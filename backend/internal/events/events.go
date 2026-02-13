package events

import (
	"log/slog"
	"sync"

	"github.com/google/uuid"
)

type EventType string

const (
	LotChanged EventType = "lot.changed"
)

type LotChangedPayload struct {
	ProjectID uuid.UUID
	LotID     uuid.UUID
	Operation string // "create", "update", "delete", "restore", "hard_delete"
}

type Event struct {
	Type    EventType
	Payload any
}

type EventBus struct {
	ch          chan Event
	subscribers map[EventType][]func(Event)
	mu          sync.RWMutex
	logger      *slog.Logger
}

func NewEventBus(bufferSize int) *EventBus {
	return &EventBus{
		ch:          make(chan Event, bufferSize),
		subscribers: make(map[EventType][]func(Event)),
		logger:      slog.Default(),
	}
}

// Publish sends an event to the bus (non-blocking).
func (eb *EventBus) Publish(event Event) {
	eb.logger.Info("event_bus_published",
		"event_type", event.Type,
	)

	select {
	case eb.ch <- event:
	default:
		eb.logger.Warn("event_bus_channel_full",
			"event_type", event.Type,
		)
	}
}

// Subscribe registers a handler for a given event type.
func (eb *EventBus) Subscribe(eventType EventType, handler func(Event)) {
	eb.mu.Lock()
	defer eb.mu.Unlock()
	eb.subscribers[eventType] = append(eb.subscribers[eventType], handler)
}

// Start spawns a goroutine that reads from the channel and dispatches to subscribers.
func (eb *EventBus) Start() {
	go func() {
		for event := range eb.ch {
			eb.mu.RLock()
			handlers := eb.subscribers[event.Type]
			eb.mu.RUnlock()

			eb.logger.Info("event_bus_dispatching",
				"event_type", event.Type,
				"subscriber_count", len(handlers),
			)

			for _, handler := range handlers {
				handler(event)
			}
		}
		eb.logger.Info("event_bus_stopped")
	}()
}

// Stop closes the channel; the dispatch goroutine exits after draining.
func (eb *EventBus) Stop() {
	close(eb.ch)
}
