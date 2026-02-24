package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"time"
)

// CFImagesStorage implements MediaStorage for Cloudflare Images
// Uses direct_upload API: backend proxies multipart to CF
type CFImagesStorage struct {
	accountID   string
	apiToken    string
	uploadURL   string // Backend proxy URL for upload (e.g. /api/admin/media/upload)
	logger      *slog.Logger
}

// CFDirectUploadResponse is the response from CF direct_upload API
type CFDirectUploadResponse struct {
	Success bool `json:"success"`
	Result  struct {
		ID        string `json:"id"`
		UploadURL string `json:"uploadURL"`
	} `json:"result"`
	Errors []struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"errors"`
}

// NewCFImagesStorage creates a new Cloudflare Images storage instance
func NewCFImagesStorage(accountID, apiToken, uploadBaseURL string) *CFImagesStorage {
	return &CFImagesStorage{
		accountID: accountID,
		apiToken:  apiToken,
		uploadURL: uploadBaseURL + "/upload",
		logger:    slog.Default(),
	}
}

// CreateUploadPolicy returns upload policy for proxy flow
// Client should POST multipart to the returned URL (backend upload endpoint)
func (s *CFImagesStorage) CreateUploadPolicy(ctx context.Context, key, contentType string, maxSizeBytes int64, expires time.Duration) (*UploadPolicy, error) {
	s.logger.Info("cf_images_create_upload_policy",
		"key", key,
		"content_type", contentType,
	)

	// For CF proxy flow: client POSTs to our backend, we proxy to CF
	return &UploadPolicy{
		URL:    s.uploadURL,
		Fields: nil,
	}, nil
}

// UploadToCF uploads file to Cloudflare Images via direct_upload API
// Returns the CF image ID (storage_key) on success
func (s *CFImagesStorage) UploadToCF(ctx context.Context, fileReader io.Reader, filename string, contentType string, fileSize int64) (string, error) {
	// 1. Get direct upload URL from CF
	req, err := http.NewRequestWithContext(ctx, "POST",
		fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/images/v2/direct_upload", s.accountID),
		nil,
	)
	if err != nil {
		return "", fmt.Errorf("create direct_upload request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.apiToken)

	// Use multipart form for optional params
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	_ = writer.WriteField("requireSignedURLs", "false")
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("close form writer: %w", err)
	}
	req.Body = io.NopCloser(&body)
	req.ContentLength = int64(body.Len())
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("direct_upload request: %w", err)
	}
	defer resp.Body.Close()

	var cfResp CFDirectUploadResponse
	if err := json.NewDecoder(resp.Body).Decode(&cfResp); err != nil {
		return "", fmt.Errorf("decode direct_upload response: %w", err)
	}
	if !cfResp.Success || cfResp.Result.UploadURL == "" {
		errMsg := "CF API error"
		if len(cfResp.Errors) > 0 {
			errMsg = cfResp.Errors[0].Message
		}
		return "", fmt.Errorf("direct_upload failed: %s", errMsg)
	}

	// 2. POST file to uploadURL
	var formBody bytes.Buffer
	fw := multipart.NewWriter(&formBody)

	part, err := fw.CreateFormFile("file", filename)
	if err != nil {
		return "", fmt.Errorf("create form file: %w", err)
	}
	if _, err := io.Copy(part, fileReader); err != nil {
		return "", fmt.Errorf("copy file: %w", err)
	}
	if err := fw.Close(); err != nil {
		return "", fmt.Errorf("close form: %w", err)
	}

	uploadReq, err := http.NewRequestWithContext(ctx, "POST", cfResp.Result.UploadURL, &formBody)
	if err != nil {
		return "", fmt.Errorf("create upload request: %w", err)
	}
	uploadReq.Header.Set("Content-Type", fw.FormDataContentType())
	uploadReq.ContentLength = int64(formBody.Len())

	uploadResp, err := client.Do(uploadReq)
	if err != nil {
		return "", fmt.Errorf("upload to CF: %w", err)
	}
	defer uploadResp.Body.Close()

	if uploadResp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(uploadResp.Body)
		return "", fmt.Errorf("CF upload failed: status=%d, body=%s", uploadResp.StatusCode, string(b))
	}

	return cfResp.Result.ID, nil
}

// DeleteObject deletes an image from Cloudflare Images
func (s *CFImagesStorage) DeleteObject(ctx context.Context, imageID string) error {
	s.logger.Info("cf_images_delete_object_started",
		"image_id", imageID,
	)

	req, err := http.NewRequestWithContext(ctx, "DELETE",
		fmt.Sprintf("https://api.cloudflare.com/client/v4/accounts/%s/images/v1/%s", s.accountID, imageID),
		nil,
	)
	if err != nil {
		return fmt.Errorf("create delete request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.apiToken)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("delete request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Success bool `json:"success"`
			Errors  []struct {
				Message string `json:"message"`
			} `json:"errors"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		errMsg := "delete failed"
		if len(errResp.Errors) > 0 {
			errMsg = errResp.Errors[0].Message
		}
		return fmt.Errorf("CF delete: %s (status=%d)", errMsg, resp.StatusCode)
	}

	s.logger.Info("cf_images_delete_object_completed",
		"image_id", imageID,
	)

	return nil
}

// HeadObject returns nil for CF (no server-side metadata check needed)
// CF Images are always ready after upload
func (s *CFImagesStorage) HeadObject(ctx context.Context, key string) (*ObjectInfo, error) {
	return nil, nil
}

// Driver returns the storage driver name
func (s *CFImagesStorage) Driver() string {
	return "cloudflare_images"
}
