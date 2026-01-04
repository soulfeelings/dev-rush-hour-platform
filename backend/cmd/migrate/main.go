package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"rush-hour-platform/backend/internal/config"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	var direction string
	flag.StringVar(&direction, "direction", "up", "Migration direction: up or down")
	flag.Parse()

	cfg := config.Load()

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.DB.User,
		cfg.DB.Password,
		cfg.DB.Host,
		cfg.DB.Port,
		cfg.DB.Name,
		cfg.DB.SSLMode,
	)

	m, err := migrate.New(
		"file://internal/migrations",
		dsn,
	)
	if err != nil {
		log.Fatal(err)
	}

	switch direction {
	case "up":
		if err := m.Up(); err != nil {
			if err == migrate.ErrNoChange {
				fmt.Println("No migrations to apply")
				os.Exit(0)
			}
			log.Fatal(err)
		}
		fmt.Println("Migrations applied successfully")
	case "down":
		if err := m.Down(); err != nil {
			if err == migrate.ErrNoChange {
				fmt.Println("No migrations to rollback")
				os.Exit(0)
			}
			log.Fatal(err)
		}
		fmt.Println("Migrations rolled back successfully")
	default:
		log.Fatalf("Invalid direction: %s. Use 'up' or 'down'", direction)
	}
}

