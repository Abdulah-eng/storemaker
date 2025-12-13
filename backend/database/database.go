package database

import (
	"log"

	"storemaker-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	log.Println("Database connection established")
	return db, nil
}

func RunMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	err := db.AutoMigrate(
		&models.User{},
		&models.Store{},
		&models.Template{},
		&models.Product{},
		&models.Category{},
		&models.Order{},
		&models.OrderItem{},
		&models.StoreSettings{},
		&models.StoreTheme{},
		&models.Page{},
		&models.Section{},
		&models.Component{},
		&models.NewsletterSubscription{},
		&models.StoreLayout{},
		&models.StoreLayoutComponent{},
	)

	if err != nil {
		return err
	}

	log.Println("Migrations completed successfully")
	return nil
}
