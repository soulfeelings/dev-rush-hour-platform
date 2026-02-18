package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)


type AdminAuthService struct {
	adminUserRepo   *repo.AdminUserRepo
	superadminEmail string
}

func NewAdminAuthService(adminUserRepo *repo.AdminUserRepo, superadminEmail string) *AdminAuthService {
	return &AdminAuthService{
		adminUserRepo:   adminUserRepo,
		superadminEmail: superadminEmail,
	}
}

// VerifyMicrosoftToken verifies a Microsoft access token via Graph API and returns the user's email.
func (s *AdminAuthService) VerifyMicrosoftToken(_ context.Context, accessToken string) (string, error) {
	req, err := http.NewRequest("GET", "https://graph.microsoft.com/v1.0/me", nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to contact microsoft graph: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("invalid microsoft token")
	}

	var payload struct {
		Mail              string `json:"mail"`
		UserPrincipalName string `json:"userPrincipalName"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return "", fmt.Errorf("failed to decode graph response: %w", err)
	}

	email := payload.Mail
	if email == "" {
		email = payload.UserPrincipalName
	}
	if email == "" {
		return "", fmt.Errorf("email not found in microsoft profile")
	}

	return strings.ToLower(email), nil
}

// Login returns the admin user for the given email.
// If the admin_users table is empty and email matches SUPERADMIN_EMAIL, it bootstraps the superadmin.
func (s *AdminAuthService) Login(_ context.Context, email string) (*domain.AdminUser, error) {
	user, err := s.adminUserRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}
	if user != nil {
		return user, nil
	}

	// Bootstrap: auto-create superadmin on first login
	if s.superadminEmail != "" && strings.EqualFold(email, s.superadminEmail) {
		count, err := s.adminUserRepo.Count()
		if err != nil {
			return nil, err
		}
		if count == 0 {
			newUser := &domain.AdminUser{
				Email:       email,
				Role:        "superadmin",
				Permissions: []string{},
				CreatedBy:   "bootstrap",
			}
			if err := s.adminUserRepo.Create(newUser); err != nil {
				return nil, err
			}
			return newUser, nil
		}
	}

	return nil, nil // not authorized
}

func (s *AdminAuthService) ListAdminUsers(_ context.Context) ([]domain.AdminUser, error) {
	return s.adminUserRepo.List()
}

func (s *AdminAuthService) AddAdminUser(_ context.Context, user *domain.AdminUser) error {
	return s.adminUserRepo.Create(user)
}

func (s *AdminAuthService) UpdateAdminUser(_ context.Context, id uuid.UUID, role string, permissions []string) error {
	return s.adminUserRepo.UpdatePermissions(id, role, permissions)
}

func (s *AdminAuthService) RemoveAdminUser(_ context.Context, id uuid.UUID) error {
	return s.adminUserRepo.Delete(id)
}

func (s *AdminAuthService) GetAdminUser(_ context.Context, email string) (*domain.AdminUser, error) {
	return s.adminUserRepo.GetByEmail(email)
}
