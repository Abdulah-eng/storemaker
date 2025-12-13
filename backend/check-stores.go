package main

import (
	"fmt"
	"log"
	"os"

	"storemaker-backend/database"
	"storemaker-backend/models"
)

func main() {
	// Load environment variables
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Initialize database
	db, err := database.Initialize(databaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Checking stores in database...")

	// Get all stores
	var stores []models.Store
	if err := db.Preload("Owner").Preload("Template").Find(&stores).Error; err != nil {
		log.Fatal("Failed to fetch stores:", err)
	}

	if len(stores) == 0 {
		fmt.Println("❌ No stores found in database!")
		fmt.Println("You need to create a store first.")
		return
	}

	fmt.Printf("✅ Found %d stores:\n\n", len(stores))

	for i, store := range stores {
		fmt.Printf("Store %d:\n", i+1)
		fmt.Printf("  ID: %d\n", store.ID)
		fmt.Printf("  Name: %s\n", store.Name)
		fmt.Printf("  Slug: %s\n", store.Slug)
		fmt.Printf("  Domain: %s\n", store.Domain)
		fmt.Printf("  Status: %s\n", store.Status)
		fmt.Printf("  Owner: %s (%s)\n", store.Owner.Email, store.Owner.Role)
		if store.Template != nil {
			fmt.Printf("  Template: %s\n", store.Template.Name)
		} else {
			fmt.Printf("  Template: None\n")
		}
		fmt.Printf("  Created: %s\n", store.CreatedAt.Format("2006-01-02 15:04:05"))
		fmt.Println()
	}

	// Also check users
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		log.Fatal("Failed to fetch users:", err)
	}

	fmt.Printf("Users in database (%d):\n", len(users))
	for _, user := range users {
		fmt.Printf("  - %s (%s) - Role: %s - Active: %t\n",
			user.Email, user.FirstName, user.Role, user.IsActive)
	}
}
