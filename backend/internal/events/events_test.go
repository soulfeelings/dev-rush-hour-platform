package events

import (
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewEventBus(t *testing.T) {
	eb := NewEventBus(10)
	if eb == nil {
		t.Fatal("expected non-nil EventBus")
	}
	if eb.ch == nil {
		t.Fatal("expected non-nil channel")
	}
	if eb.subscribers == nil {
		t.Fatal("expected non-nil subscribers map")
	}
}

func TestPublishAndSubscribe(t *testing.T) {
	eb := NewEventBus(10)
	eb.Start()
	defer eb.Stop()

	var received Event
	var wg sync.WaitGroup
	wg.Add(1)

	eb.Subscribe(LotChanged, func(e Event) {
		received = e
		wg.Done()
	})

	projectID := uuid.New()
	lotID := uuid.New()

	eb.Publish(Event{
		Type: LotChanged,
		Payload: LotChangedPayload{
			ProjectID: projectID,
			LotID:     lotID,
			Operation: "create",
		},
	})

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for event dispatch")
	}

	if received.Type != LotChanged {
		t.Errorf("expected event type %q, got %q", LotChanged, received.Type)
	}

	payload, ok := received.Payload.(LotChangedPayload)
	if !ok {
		t.Fatal("expected LotChangedPayload type")
	}
	if payload.ProjectID != projectID {
		t.Errorf("expected project ID %s, got %s", projectID, payload.ProjectID)
	}
	if payload.LotID != lotID {
		t.Errorf("expected lot ID %s, got %s", lotID, payload.LotID)
	}
	if payload.Operation != "create" {
		t.Errorf("expected operation %q, got %q", "create", payload.Operation)
	}
}

func TestMultipleSubscribers(t *testing.T) {
	eb := NewEventBus(10)
	eb.Start()
	defer eb.Stop()

	var wg sync.WaitGroup
	wg.Add(3)

	callCount := 0
	var mu sync.Mutex

	for range 3 {
		eb.Subscribe(LotChanged, func(e Event) {
			mu.Lock()
			callCount++
			mu.Unlock()
			wg.Done()
		})
	}

	eb.Publish(Event{
		Type: LotChanged,
		Payload: LotChangedPayload{
			ProjectID: uuid.New(),
			LotID:     uuid.New(),
			Operation: "create",
		},
	})

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for all subscribers")
	}

	mu.Lock()
	defer mu.Unlock()
	if callCount != 3 {
		t.Errorf("expected 3 subscriber calls, got %d", callCount)
	}
}

func TestNoSubscribersNoError(t *testing.T) {
	eb := NewEventBus(10)
	eb.Start()
	defer eb.Stop()

	// Publishing with no subscribers should not panic or block
	eb.Publish(Event{
		Type: LotChanged,
		Payload: LotChangedPayload{
			ProjectID: uuid.New(),
			LotID:     uuid.New(),
			Operation: "delete",
		},
	})

	// Give the dispatch goroutine time to process
	time.Sleep(50 * time.Millisecond)
}

func TestUnrelatedEventTypeNotDispatched(t *testing.T) {
	eb := NewEventBus(10)
	eb.Start()
	defer eb.Stop()

	called := false
	eb.Subscribe(LotChanged, func(e Event) {
		called = true
	})

	// Publish a different event type
	eb.Publish(Event{
		Type:    EventType("other.event"),
		Payload: nil,
	})

	time.Sleep(100 * time.Millisecond)

	if called {
		t.Error("subscriber should not be called for unrelated event type")
	}
}

func TestPublishNonBlocking_FullChannel(t *testing.T) {
	eb := NewEventBus(1)
	// Do NOT start — channel won't be drained

	// Fill the buffer
	eb.Publish(Event{Type: LotChanged, Payload: LotChangedPayload{Operation: "first"}})

	// This should not block (non-blocking publish)
	done := make(chan struct{})
	go func() {
		eb.Publish(Event{Type: LotChanged, Payload: LotChangedPayload{Operation: "second"}})
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(1 * time.Second):
		t.Fatal("Publish blocked on full channel")
	}
}

func TestStopDrainsEvents(t *testing.T) {
	eb := NewEventBus(10)

	var wg sync.WaitGroup
	wg.Add(3)

	eb.Subscribe(LotChanged, func(e Event) {
		wg.Done()
	})

	// Publish events before Start — they sit in the channel
	for range 3 {
		eb.Publish(Event{
			Type:    LotChanged,
			Payload: LotChangedPayload{Operation: "create"},
		})
	}

	eb.Start()
	eb.Stop() // closes channel, goroutine drains remaining events

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("timed out — events were not drained on Stop")
	}
}

func TestMultipleEventTypes(t *testing.T) {
	eb := NewEventBus(10)
	eb.Start()
	defer eb.Stop()

	customType := EventType("custom.event")

	var wg sync.WaitGroup
	wg.Add(2)

	var lotReceived, customReceived bool
	var mu sync.Mutex

	eb.Subscribe(LotChanged, func(e Event) {
		mu.Lock()
		lotReceived = true
		mu.Unlock()
		wg.Done()
	})

	eb.Subscribe(customType, func(e Event) {
		mu.Lock()
		customReceived = true
		mu.Unlock()
		wg.Done()
	})

	eb.Publish(Event{Type: LotChanged, Payload: LotChangedPayload{Operation: "create"}})
	eb.Publish(Event{Type: customType, Payload: "custom data"})

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("timed out waiting for events")
	}

	mu.Lock()
	defer mu.Unlock()
	if !lotReceived {
		t.Error("LotChanged subscriber was not called")
	}
	if !customReceived {
		t.Error("custom event subscriber was not called")
	}
}
