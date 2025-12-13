package main

import (
	"log"
	"storemaker-backend/config"
	"storemaker-backend/database"
	"storemaker-backend/models"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Find first store (assuming you have at least one store)
	var store models.Store
	if err := db.First(&store).Error; err != nil {
		log.Fatal("No stores found. Please create a store first:", err)
	}

	log.Printf("Adding sample products to store: %s (ID: %d)", store.Name, store.ID)

	// Sample products data
	sampleProducts := []models.Product{
		{
			Name:         "Premium Wireless Headphones",
			Slug:         "premium-wireless-headphones",
			Description:  "High-quality wireless headphones with noise cancellation and superior sound quality. Perfect for music lovers and professionals.",
			ShortDesc:    "Premium wireless headphones with noise cancellation",
			Price:        199.99,
			ComparePrice: func() *float64 { v := 249.99; return &v }(),
			SKU:          "WH-001",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
				"https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     25,
			IsDigital: false,
			SeoTitle:  "Premium Wireless Headphones - High Quality Audio",
			SeoDesc:   "Shop premium wireless headphones with noise cancellation. Free shipping and 2-year warranty included.",
			StoreID:   store.ID,
		},
		{
			Name:         "Luxury Leather Wallet",
			Slug:         "luxury-leather-wallet",
			Description:  "Handcrafted genuine leather wallet with RFID protection. Multiple card slots and a timeless design that lasts for years.",
			ShortDesc:    "Handcrafted leather wallet with RFID protection",
			Price:        89.99,
			ComparePrice: func() *float64 { v := 120.00; return &v }(),
			SKU:          "LW-002",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
				"https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     40,
			IsDigital: false,
			SeoTitle:  "Luxury Leather Wallet - RFID Protection",
			SeoDesc:   "Premium handcrafted leather wallet with RFID blocking technology. Perfect gift for any occasion.",
			StoreID:   store.ID,
		},
		{
			Name:         "Smart Fitness Watch",
			Slug:         "smart-fitness-watch",
			Description:  "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life. Track your health and stay connected.",
			ShortDesc:    "Advanced fitness tracker with GPS and heart rate monitoring",
			Price:        299.99,
			ComparePrice: func() *float64 { v := 399.99; return &v }(),
			SKU:          "FW-003",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
				"https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&h=500&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     15,
			IsDigital: false,
			SeoTitle:  "Smart Fitness Watch - GPS & Heart Rate Monitor",
			SeoDesc:   "Track your fitness goals with our advanced smartwatch. GPS, heart rate monitor, and 7-day battery life.",
			StoreID:   store.ID,
		},
		{
			Name:        "Organic Coffee Beans",
			Slug:        "organic-coffee-beans",
			Description: "Single-origin organic coffee beans, freshly roasted to perfection. Rich flavor with notes of chocolate and caramel.",
			ShortDesc:   "Single-origin organic coffee beans, freshly roasted",
			Price:       24.99,
			SKU:         "CB-004",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop",
				"https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&h=500&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     100,
			IsDigital: false,
			SeoTitle:  "Organic Coffee Beans - Single Origin",
			SeoDesc:   "Premium organic coffee beans with rich flavor. Perfect for coffee enthusiasts who appreciate quality.",
			StoreID:   store.ID,
		},
		{
			Name:         "Minimalist Desk Lamp",
			Slug:         "minimalist-desk-lamp",
			Description:  "Modern LED desk lamp with adjustable brightness and color temperature. Perfect for work, study, or ambient lighting.",
			ShortDesc:    "Modern LED desk lamp with adjustable brightness",
			Price:        79.99,
			ComparePrice: func() *float64 { v := 99.99; return &v }(),
			SKU:          "DL-005",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
				"https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     30,
			IsDigital: false,
			SeoTitle:  "Minimalist LED Desk Lamp - Adjustable Brightness",
			SeoDesc:   "Modern desk lamp with LED technology. Adjustable brightness and color temperature for optimal lighting.",
			StoreID:   store.ID,
		},
		{
			Name:        "Eco-Friendly Water Bottle",
			Slug:        "eco-friendly-water-bottle",
			Description: "Sustainable stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and environmentally conscious.",
			ShortDesc:   "Sustainable stainless steel water bottle",
			Price:       34.99,
			SKU:         "WB-006",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
				"https://images.unsplash.com/photo-1556909075-f3dc64cdfc7d?w=500&h=500&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     75,
			IsDigital: false,
			SeoTitle:  "Eco-Friendly Stainless Steel Water Bottle",
			SeoDesc:   "Sustainable water bottle that keeps drinks at perfect temperature. BPA-free and environmentally friendly.",
			StoreID:   store.ID,
		},
	}

	// Insert products
	for _, product := range sampleProducts {
		// Check if product already exists
		var existingProduct models.Product
		result := db.Where("slug = ? AND store_id = ?", product.Slug, store.ID).First(&existingProduct)

		if result.Error != nil {
			// Product doesn't exist, create it
			if err := db.Create(&product).Error; err != nil {
				log.Printf("Error creating product %s: %v", product.Name, err)
			} else {
				log.Printf("✅ Created product: %s", product.Name)
			}
		} else {
			log.Printf("⏭️  Product already exists: %s", product.Name)
		}
	}

	log.Println("🎉 Sample products seeding completed!")
	log.Printf("Store: %s now has sample products for testing the product carousel.", store.Name)
}
