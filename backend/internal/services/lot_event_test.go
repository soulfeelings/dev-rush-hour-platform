package services

import (
	"errors"
	"sync"
	"testing"
	"time"

	"rush-hour-platform/backend/internal/domain"
	"rush-hour-platform/backend/internal/events"
	"rush-hour-platform/backend/internal/repo"

	"github.com/google/uuid"
)

// mockLotRepo implements LotRepository for testing.
type mockLotRepo struct {
	getByIDFn          func(id uuid.UUID) (*domain.Lot, error)
	getByIDWithDelFn   func(id uuid.UUID) (*domain.Lot, error)
	createFn           func(lot *domain.Lot) error
	updateFn           func(id uuid.UUID, lot *domain.Lot) error
	deleteFn           func(id uuid.UUID) error
	restoreFn          func(id uuid.UUID) error
	hardDeleteFn       func(id uuid.UUID) error
	listFn             func(filters repo.LotFilters, sort repo.LotSort, limit, offset int) ([]domain.Lot, int, error)
	listAllFn          func() ([]domain.Lot, error)
	listDeletedFn      func() ([]domain.Lot, error)
}

func (m *mockLotRepo) GetByID(id uuid.UUID) (*domain.Lot, error) {
	if m.getByIDFn != nil {
		return m.getByIDFn(id)
	}
	return nil, nil
}

func (m *mockLotRepo) GetByIDWithDeleted(id uuid.UUID) (*domain.Lot, error) {
	if m.getByIDWithDelFn != nil {
		return m.getByIDWithDelFn(id)
	}
	return nil, nil
}

func (m *mockLotRepo) Create(lot *domain.Lot) error {
	if m.createFn != nil {
		return m.createFn(lot)
	}
	return nil
}

func (m *mockLotRepo) Update(id uuid.UUID, lot *domain.Lot) error {
	if m.updateFn != nil {
		return m.updateFn(id, lot)
	}
	return nil
}

func (m *mockLotRepo) Delete(id uuid.UUID) error {
	if m.deleteFn != nil {
		return m.deleteFn(id)
	}
	return nil
}

func (m *mockLotRepo) Restore(id uuid.UUID) error {
	if m.restoreFn != nil {
		return m.restoreFn(id)
	}
	return nil
}

func (m *mockLotRepo) HardDelete(id uuid.UUID) error {
	if m.hardDeleteFn != nil {
		return m.hardDeleteFn(id)
	}
	return nil
}

func (m *mockLotRepo) List(filters repo.LotFilters, sort repo.LotSort, limit, offset int) ([]domain.Lot, int, error) {
	if m.listFn != nil {
		return m.listFn(filters, sort, limit, offset)
	}
	return []domain.Lot{}, 0, nil
}

func (m *mockLotRepo) ListAll() ([]domain.Lot, error) {
	if m.listAllFn != nil {
		return m.listAllFn()
	}
	return []domain.Lot{}, nil
}

func (m *mockLotRepo) ListDeleted() ([]domain.Lot, error) {
	if m.listDeletedFn != nil {
		return m.listDeletedFn()
	}
	return []domain.Lot{}, nil
}

// eventCollector collects events dispatched by the EventBus.
type eventCollector struct {
	mu     sync.Mutex
	events []events.LotChangedPayload
}

func (c *eventCollector) handler(e events.Event) {
	payload := e.Payload.(events.LotChangedPayload)
	c.mu.Lock()
	c.events = append(c.events, payload)
	c.mu.Unlock()
}

func (c *eventCollector) waitFor(n int, timeout time.Duration) []events.LotChangedPayload {
	deadline := time.After(timeout)
	for {
		c.mu.Lock()
		if len(c.events) >= n {
			result := make([]events.LotChangedPayload, len(c.events))
			copy(result, c.events)
			c.mu.Unlock()
			return result
		}
		c.mu.Unlock()
		select {
		case <-deadline:
			c.mu.Lock()
			result := make([]events.LotChangedPayload, len(c.events))
			copy(result, c.events)
			c.mu.Unlock()
			return result
		case <-time.After(10 * time.Millisecond):
		}
	}
}

func setupTest() (*LotsService, *eventCollector, func()) {
	return setupTestWithRepo(&mockLotRepo{})
}

func setupTestWithRepo(mockRepo *mockLotRepo) (*LotsService, *eventCollector, func()) {
	eb := events.NewEventBus(100)
	collector := &eventCollector{}
	eb.Subscribe(events.LotChanged, collector.handler)
	eb.Start()

	svc := NewLotsService(mockRepo, eb)

	cleanup := func() {
		eb.Stop()
	}

	return svc, collector, cleanup
}

func ptrUUID(id uuid.UUID) *uuid.UUID {
	return &id
}

// --- Create ---

func TestCreate_PublishesEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		createFn: func(lot *domain.Lot) error {
			lot.ID = lotID
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	lot := &domain.Lot{
		ProjectID: ptrUUID(projectID),
		Type:      "apartment",
		Status:    "active",
	}

	err := svc.Create(lot)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := collector.waitFor(1, 2*time.Second)
	if len(got) != 1 {
		t.Fatalf("expected 1 event, got %d", len(got))
	}
	if got[0].ProjectID != projectID {
		t.Errorf("expected project ID %s, got %s", projectID, got[0].ProjectID)
	}
	if got[0].LotID != lotID {
		t.Errorf("expected lot ID %s, got %s", lotID, got[0].LotID)
	}
	if got[0].Operation != "create" {
		t.Errorf("expected operation %q, got %q", "create", got[0].Operation)
	}
}

func TestCreate_NoEventOnNilProjectID(t *testing.T) {
	mockRepo := &mockLotRepo{
		createFn: func(lot *domain.Lot) error {
			lot.ID = uuid.New()
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	lot := &domain.Lot{
		ProjectID: nil,
		Type:      "apartment",
		Status:    "active",
	}

	err := svc.Create(lot)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Wait briefly — no events should arrive
	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events for nil project ID, got %d", len(got))
	}
}

func TestCreate_NoEventOnRepoError(t *testing.T) {
	mockRepo := &mockLotRepo{
		createFn: func(lot *domain.Lot) error {
			return errors.New("db error")
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	lot := &domain.Lot{
		ProjectID: ptrUUID(uuid.New()),
		Type:      "apartment",
		Status:    "active",
	}

	err := svc.Create(lot)
	if err == nil {
		t.Fatal("expected error")
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events on error, got %d", len(got))
	}
}

// --- Update ---

func TestUpdate_PublishesEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		updateFn: func(id uuid.UUID, lot *domain.Lot) error {
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	updates := &domain.Lot{PriceFromUs: 500000}
	err := svc.Update(lotID, updates)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := collector.waitFor(1, 2*time.Second)
	if len(got) != 1 {
		t.Fatalf("expected 1 event, got %d", len(got))
	}
	if got[0].ProjectID != projectID {
		t.Errorf("expected project ID %s, got %s", projectID, got[0].ProjectID)
	}
	if got[0].Operation != "update" {
		t.Errorf("expected operation %q, got %q", "update", got[0].Operation)
	}
}

func TestUpdate_ProjectChanged_PublishesTwoEvents(t *testing.T) {
	oldProjectID := uuid.New()
	newProjectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(oldProjectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		updateFn: func(id uuid.UUID, lot *domain.Lot) error {
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	updates := &domain.Lot{ProjectID: ptrUUID(newProjectID)}
	err := svc.Update(lotID, updates)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := collector.waitFor(2, 2*time.Second)
	if len(got) != 2 {
		t.Fatalf("expected 2 events (new + old project), got %d", len(got))
	}

	// First event is for the new project (existing.ProjectID after merge)
	if got[0].ProjectID != newProjectID {
		t.Errorf("first event: expected new project ID %s, got %s", newProjectID, got[0].ProjectID)
	}
	// Second event is for the old project
	if got[1].ProjectID != oldProjectID {
		t.Errorf("second event: expected old project ID %s, got %s", oldProjectID, got[1].ProjectID)
	}
}

func TestUpdate_SameProject_PublishesOneEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		updateFn: func(id uuid.UUID, lot *domain.Lot) error {
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	// Update with same project ID
	updates := &domain.Lot{ProjectID: ptrUUID(projectID)}
	err := svc.Update(lotID, updates)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := collector.waitFor(2, 300*time.Millisecond)
	if len(got) != 1 {
		t.Fatalf("expected 1 event (same project), got %d", len(got))
	}
}

func TestUpdate_NotFound_NoEvent(t *testing.T) {
	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return nil, nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Update(uuid.New(), &domain.Lot{PriceFromUs: 100})
	if !errors.Is(err, ErrLotNotFound) {
		t.Fatalf("expected ErrLotNotFound, got %v", err)
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events on not found, got %d", len(got))
	}
}

func TestUpdate_RepoError_NoEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		updateFn: func(id uuid.UUID, lot *domain.Lot) error {
			return errors.New("db error")
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Update(lotID, &domain.Lot{PriceFromUs: 100})
	if err == nil {
		t.Fatal("expected error")
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events on error, got %d", len(got))
	}
}

// --- Delete ---

func TestDelete_PublishesEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		deleteFn: func(id uuid.UUID) error {
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Delete(lotID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := collector.waitFor(1, 2*time.Second)
	if len(got) != 1 {
		t.Fatalf("expected 1 event, got %d", len(got))
	}
	if got[0].ProjectID != projectID {
		t.Errorf("expected project ID %s, got %s", projectID, got[0].ProjectID)
	}
	if got[0].Operation != "delete" {
		t.Errorf("expected operation %q, got %q", "delete", got[0].Operation)
	}
}

func TestDelete_NotFound_NoEvent(t *testing.T) {
	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return nil, nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Delete(uuid.New())
	if !errors.Is(err, ErrLotNotFound) {
		t.Fatalf("expected ErrLotNotFound, got %v", err)
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events, got %d", len(got))
	}
}

func TestDelete_RepoError_NoEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		deleteFn: func(id uuid.UUID) error {
			return errors.New("db error")
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Delete(lotID)
	if err == nil {
		t.Fatal("expected error")
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events on error, got %d", len(got))
	}
}

// --- Restore ---

func TestRestore_PublishesEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()
	now := time.Now()

	mockRepo := &mockLotRepo{
		getByIDWithDelFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
				DeletedAt: &now,
			}, nil
		},
		restoreFn: func(id uuid.UUID) error {
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Restore(lotID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := collector.waitFor(1, 2*time.Second)
	if len(got) != 1 {
		t.Fatalf("expected 1 event, got %d", len(got))
	}
	if got[0].ProjectID != projectID {
		t.Errorf("expected project ID %s, got %s", projectID, got[0].ProjectID)
	}
	if got[0].Operation != "restore" {
		t.Errorf("expected operation %q, got %q", "restore", got[0].Operation)
	}
}

func TestRestore_NotFound_NoEvent(t *testing.T) {
	mockRepo := &mockLotRepo{
		getByIDWithDelFn: func(id uuid.UUID) (*domain.Lot, error) {
			return nil, nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Restore(uuid.New())
	if !errors.Is(err, ErrLotNotFound) {
		t.Fatalf("expected ErrLotNotFound, got %v", err)
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events, got %d", len(got))
	}
}

func TestRestore_NotDeleted_NoEvent(t *testing.T) {
	mockRepo := &mockLotRepo{
		getByIDWithDelFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        uuid.New(),
				ProjectID: ptrUUID(uuid.New()),
				Status:    "active",
				Type:      "apartment",
				DeletedAt: nil, // not deleted
			}, nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.Restore(uuid.New())
	if err == nil {
		t.Fatal("expected error for non-deleted lot")
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events, got %d", len(got))
	}
}

// --- HardDelete ---

func TestHardDelete_PublishesEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDWithDelFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		hardDeleteFn: func(id uuid.UUID) error {
			return nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.HardDelete(lotID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := collector.waitFor(1, 2*time.Second)
	if len(got) != 1 {
		t.Fatalf("expected 1 event, got %d", len(got))
	}
	if got[0].ProjectID != projectID {
		t.Errorf("expected project ID %s, got %s", projectID, got[0].ProjectID)
	}
	if got[0].Operation != "hard_delete" {
		t.Errorf("expected operation %q, got %q", "hard_delete", got[0].Operation)
	}
}

func TestHardDelete_NotFound_NoEvent(t *testing.T) {
	mockRepo := &mockLotRepo{
		getByIDWithDelFn: func(id uuid.UUID) (*domain.Lot, error) {
			return nil, nil
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.HardDelete(uuid.New())
	if !errors.Is(err, ErrLotNotFound) {
		t.Fatalf("expected ErrLotNotFound, got %v", err)
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events, got %d", len(got))
	}
}

func TestHardDelete_RepoError_NoEvent(t *testing.T) {
	projectID := uuid.New()
	lotID := uuid.New()

	mockRepo := &mockLotRepo{
		getByIDWithDelFn: func(id uuid.UUID) (*domain.Lot, error) {
			return &domain.Lot{
				ID:        lotID,
				ProjectID: ptrUUID(projectID),
				Status:    "active",
				Type:      "apartment",
			}, nil
		},
		hardDeleteFn: func(id uuid.UUID) error {
			return errors.New("db error")
		},
	}
	svc, collector, cleanup := setupTestWithRepo(mockRepo)
	defer cleanup()

	err := svc.HardDelete(lotID)
	if err == nil {
		t.Fatal("expected error")
	}

	got := collector.waitFor(1, 200*time.Millisecond)
	if len(got) != 0 {
		t.Errorf("expected 0 events on error, got %d", len(got))
	}
}
