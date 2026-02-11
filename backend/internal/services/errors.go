package services

import "errors"

var (
	ErrDeveloperNotFound = errors.New("developer not found")
	ErrProjectNotFound   = errors.New("project not found")
	ErrAreaNotFound      = errors.New("area not found")
	ErrCityNotFound      = errors.New("city not found")
	ErrLotNotFound       = errors.New("lot not found")
	ErrLeadNotFound      = errors.New("lead not found")
	ErrBadgeNotFound          = errors.New("badge not found")
	ErrInfrastructureNotFound = errors.New("infrastructure not found")

	// Media errors
	ErrMediaNotFound       = errors.New("media not found")
	ErrInvalidMimeType     = errors.New("invalid or unsupported mime type")
	ErrInvalidOriginalName = errors.New("original name is required")
	ErrUploadNotFound      = errors.New("upload not found in storage")
	ErrBatchTooLarge       = errors.New("batch size exceeds maximum allowed (50)")
)