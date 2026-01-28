package services

import "errors"

var (
    ErrDeveloperNotFound = errors.New("developer not found")
    ErrProjectNotFound   = errors.New("project not found")
    ErrAreaNotFound      = errors.New("area not found")
    ErrCityNotFound      = errors.New("city not found")
    ErrLotNotFound       = errors.New("lot not found")
    ErrLeadNotFound      = errors.New("lead not found")
    ErrBadgeNotFound     = errors.New("badge not found")
)