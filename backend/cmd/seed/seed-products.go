package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"storemaker-backend/database"
	"storemaker-backend/models"
)

func main() {
	// Initialize database
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}
	
	db, err := database.Initialize(databaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Get store ID from command line argument or use default
	storeID := uint(1) // Default to first store
	if len(os.Args) > 1 {
		if id, err := strconv.ParseUint(os.Args[1], 10, 32); err == nil {
			storeID = uint(id)
		}
	}

	// Check if store exists
	var store models.Store
	if err := db.First(&store, storeID).Error; err != nil {
		log.Fatal("Store not found. Please provide a valid store ID.")
	}

	fmt.Printf("Seeding products for store: %s (ID: %d)\n", store.Name, storeID)

	// Sample products data
	products := []models.Product{
		{
			Name:        "Premium Wireless Headphones",
			Slug:        "premium-wireless-headphones",
			Description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
			ShortDesc:   "Premium wireless headphones with noise cancellation",
			Price:       199.99,
			ComparePrice: func() *float64 { p := 249.99; return &p }(),
			SKU:         "WH-001",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     50,
			Weight:    func() *float64 { w := 0.3; return &w }(),
			IsDigital: false,
			SeoTitle:  "Premium Wireless Headphones - Best Sound Quality",
			SeoDesc:   "Get the best wireless headphones with premium sound quality and noise cancellation features.",
			StoreID:   storeID,
		},
		{
			Name:        "Smart Fitness Watch",
			Slug:        "smart-fitness-watch",
			Description: "Advanced fitness tracking watch with heart rate monitoring, GPS, and smartphone connectivity. Perfect for athletes and health enthusiasts.",
			ShortDesc:   "Advanced fitness tracking watch with health monitoring",
			Price:       299.99,
			ComparePrice: func() *float64 { p := 349.99; return &p }(),
			SKU:         "FW-002",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     30,
			Weight:    func() *float64 { w := 0.1; return &w }(),
			IsDigital: false,
			SeoTitle:  "Smart Fitness Watch - Advanced Health Tracking",
			SeoDesc:   "Track your fitness goals with our advanced smart watch featuring heart rate monitoring and GPS.",
			StoreID:   storeID,
		},
		{
			Name:        "Organic Cotton T-Shirt",
			Slug:        "organic-cotton-tshirt",
			Description: "Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes. Perfect for everyday wear.",
			ShortDesc:   "Comfortable organic cotton t-shirt",
			Price:       29.99,
			ComparePrice: func() *float64 { p := 39.99; return &p }(),
			SKU:         "TS-003",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     100,
			Weight:    func() *float64 { w := 0.2; return &w }(),
			IsDigital: false,
			SeoTitle:  "Organic Cotton T-Shirt - Sustainable Fashion",
			SeoDesc:   "Eco-friendly organic cotton t-shirt perfect for sustainable fashion choices.",
			StoreID:   storeID,
		},
		{
			Name:        "Professional Camera Lens",
			Slug:        "professional-camera-lens",
			Description: "High-quality professional camera lens for DSLR cameras. Perfect for portrait and landscape photography with excellent image quality.",
			ShortDesc:   "Professional camera lens for DSLR",
			Price:       899.99,
			ComparePrice: func() *float64 { p := 1099.99; return &p }(),
			SKU:         "CL-004",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     15,
			Weight:    func() *float64 { w := 0.8; return &w }(),
			IsDigital: false,
			SeoTitle:  "Professional Camera Lens - High Quality Photography",
			SeoDesc:   "Capture stunning images with our professional camera lens designed for DSLR cameras.",
			StoreID:   storeID,
		},
		{
			Name:        "Wireless Bluetooth Speaker",
			Slug:        "wireless-bluetooth-speaker",
			Description: "Portable wireless Bluetooth speaker with amazing sound quality and long battery life. Perfect for outdoor activities and parties.",
			ShortDesc:   "Portable wireless Bluetooth speaker",
			Price:       79.99,
			ComparePrice: func() *float64 { p := 99.99; return &p }(),
			SKU:         "BS-005",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     75,
			Weight:    func() *float64 { w := 0.5; return &w }(),
			IsDigital: false,
			SeoTitle:  "Wireless Bluetooth Speaker - Portable Sound",
			SeoDesc:   "Enjoy high-quality sound anywhere with our portable wireless Bluetooth speaker.",
			StoreID:   storeID,
		},
		{
			Name:        "Premium Coffee Maker",
			Slug:        "premium-coffee-maker",
			Description: "Professional coffee maker with programmable settings and built-in grinder. Perfect for coffee enthusiasts who want barista-quality coffee at home.",
			ShortDesc:   "Professional coffee maker with grinder",
			Price:       399.99,
			ComparePrice: func() *float64 { p := 499.99; return &p }(),
			SKU:         "CM-006",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     25,
			Weight:    func() *float64 { w := 2.5; return &w }(),
			IsDigital: false,
			SeoTitle:  "Premium Coffee Maker - Barista Quality at Home",
			SeoDesc:   "Brew barista-quality coffee at home with our premium coffee maker featuring built-in grinder.",
			StoreID:   storeID,
		},
		{
			Name:        "Yoga Mat Premium",
			Slug:        "yoga-mat-premium",
			Description: "High-quality non-slip yoga mat made from eco-friendly materials. Perfect for yoga, pilates, and fitness activities.",
			ShortDesc:   "Non-slip eco-friendly yoga mat",
			Price:       49.99,
			ComparePrice: func() *float64 { p := 69.99; return &p }(),
			SKU:         "YM-007",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     60,
			Weight:    func() *float64 { w := 1.2; return &w }(),
			IsDigital: false,
			SeoTitle:  "Premium Yoga Mat - Eco-Friendly Fitness",
			SeoDesc:   "Practice yoga and fitness with our premium non-slip yoga mat made from eco-friendly materials.",
			StoreID:   storeID,
		},
		{
			Name:        "Smart Home Security Camera",
			Slug:        "smart-home-security-camera",
			Description: "Wireless smart home security camera with night vision, motion detection, and mobile app control. Keep your home safe and secure.",
			ShortDesc:   "Wireless smart home security camera",
			Price:       129.99,
			ComparePrice: func() *float64 { p := 159.99; return &p }(),
			SKU:         "SC-008",
			Images: models.ProductImages{
				"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
				"https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop",
			},
			Status:    models.ProductStatusActive,
			Stock:     40,
			Weight:    func() *float64 { w := 0.4; return &w }(),
			IsDigital: false,
			SeoTitle:  "Smart Home Security Camera - Protect Your Home",
			SeoDesc:   "Monitor your home with our smart security camera featuring night vision and motion detection.",
			StoreID:   storeID,
		},
	}

	// Create products
	for _, product := range products {
		// Check if product already exists
		var existingProduct models.Product
		if err := db.Where("slug = ? AND store_id = ?", product.Slug, storeID).First(&existingProduct).Error; err == nil {
			fmt.Printf("Product '%s' already exists, skipping...\n", product.Name)
			continue
		}

		// Create the product
		if err := db.Create(&product).Error; err != nil {
			log.Printf("Failed to create product '%s': %v\n", product.Name, err)
			continue
		}

		fmt.Printf("✓ Created product: %s (ID: %d)\n", product.Name, product.ID)
	}

	fmt.Printf("\n✅ Successfully seeded %d products for store: %s\n", len(products), store.Name)
	fmt.Println("\nTo activate products, make sure their status is set to 'active'")
	fmt.Println("You can now use these products in your product components!")
} 