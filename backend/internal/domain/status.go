package domain

type Status string

const (
	StatusActive   Status = "active"
	StatusInactive Status = "inactive"
	StatusArchived Status = "archived"
	StatusHidden   Status = "hidden"
	StatusReserved Status = "reserved"
	StatusSold     Status = "sold"
)

type ProjectStatus string

const (
	ProjectStatusActive   ProjectStatus = "active"
	ProjectStatusArchived ProjectStatus = "archived"
)

type LotStatus string

const (
	LotStatusActive   LotStatus = "active"
	LotStatusHidden   LotStatus = "hidden"
	LotStatusReserved LotStatus = "reserved"
	LotStatusSold     LotStatus = "sold"
	LotStatusDeleted  LotStatus = "deleted"
)

type DeveloperStatus string

const (
	DeveloperStatusActive   DeveloperStatus = "active"
	DeveloperStatusInactive DeveloperStatus = "inactive"
)

type AreaStatus string

const (
	AreaStatusActive   AreaStatus = "active"
	AreaStatusInactive AreaStatus = "inactive"
)

type LeadStatus string

const (
	LeadStatusNew        LeadStatus = "new"
	LeadStatusInProgress LeadStatus = "in_progress"
	LeadStatusDone       LeadStatus = "done"
	LeadStatusSpam       LeadStatus = "spam"
)

type LotType string

type LeadType string

const (
	LeadTypeCallback LeadType = "callback"
	LeadTypeViewing  LeadType = "viewing"
	LeadTypeDetails  LeadType = "details"
)

