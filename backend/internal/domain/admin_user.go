package domain

import (
	"time"

	"github.com/google/uuid"
)

type AdminUser struct {
	ID          uuid.UUID `json:"id"`
	Email       string    `json:"email"`
	Role        string    `json:"role"`
	Permissions []string  `json:"permissions"`
	CreatedAt   time.Time `json:"createdAt"`
	CreatedBy   string    `json:"createdBy"`
}
