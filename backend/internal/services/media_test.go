package services

import (
	"testing"

	"rush-hour-platform/backend/internal/domain"
)

// Tests for domain functions

func TestIsAllowedMimeType(t *testing.T) {
	tests := []struct {
		mimeType string
		expected bool
	}{
		{"image/jpeg", true},
		{"image/png", true},
		{"image/webp", true},
		{"image/gif", true},
		{"application/pdf", false},
		{"video/mp4", false},
		{"text/plain", false},
		{"", false},
	}

	for _, tt := range tests {
		t.Run(tt.mimeType, func(t *testing.T) {
			result := domain.IsAllowedMimeType(tt.mimeType)
			if result != tt.expected {
				t.Errorf("IsAllowedMimeType(%s) = %v, want %v", tt.mimeType, result, tt.expected)
			}
		})
	}
}

func TestGetExtForMimeType(t *testing.T) {
	tests := []struct {
		mimeType    string
		expectedExt string
	}{
		{"image/jpeg", ".jpg"},
		{"image/png", ".png"},
		{"image/webp", ".webp"},
		{"image/gif", ".gif"},
		{"application/pdf", ""},
		{"", ""},
	}

	for _, tt := range tests {
		t.Run(tt.mimeType, func(t *testing.T) {
			result := domain.GetExtForMimeType(tt.mimeType)
			if result != tt.expectedExt {
				t.Errorf("GetExtForMimeType(%s) = %v, want %v", tt.mimeType, result, tt.expectedExt)
			}
		})
	}
}

func TestMaxBatchSize(t *testing.T) {
	if MaxBatchSize != 50 {
		t.Errorf("MaxBatchSize = %d, want 50", MaxBatchSize)
	}
}

func TestMaxUploadSize(t *testing.T) {
	expectedSize := int64(10 * 1024 * 1024) // 10 MB
	if MaxUploadSize != expectedSize {
		t.Errorf("MaxUploadSize = %d, want %d", MaxUploadSize, expectedSize)
	}
}
