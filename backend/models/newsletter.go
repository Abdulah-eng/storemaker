package models

import (
	"time"

	"gorm.io/gorm"
)

type NewsletterSubscription struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	StoreID   uint           `json:"store_id" gorm:"not null"`
	Email     string         `json:"email" gorm:"not null"`
	Active    bool           `json:"active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`

	// Relationships
	Store Store `json:"store,omitempty" gorm:"foreignKey:StoreID"`
}

type NewsletterSubscriptionRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type NewsletterSubscriptionResponse struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"created_at"`
}
