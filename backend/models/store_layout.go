package models

import (
	"time"
	"gorm.io/gorm"
)

// StoreLayout represents the saved layout configuration for a store
type StoreLayout struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	StoreID   uint           `json:"store_id" gorm:"not null;uniqueIndex"`
	Components []StoreLayoutComponent `json:"components" gorm:"foreignKey:StoreLayoutID;constraint:OnDelete:CASCADE"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// StoreLayoutComponent represents a single component in the store layout
type StoreLayoutComponent struct {
	ID            uint                   `json:"id" gorm:"primaryKey"`
	StoreLayoutID uint                   `json:"store_layout_id" gorm:"not null"`
	Type          string                 `json:"type" gorm:"not null"`
	Props         map[string]interface{} `json:"props" gorm:"type:jsonb"`
	Order         int                    `json:"order" gorm:"not null"`
	CreatedAt     time.Time              `json:"created_at"`
	UpdatedAt     time.Time              `json:"updated_at"`
	DeletedAt     gorm.DeletedAt         `json:"-" gorm:"index"`
}

// TableName specifies the table name for StoreLayoutComponent
func (StoreLayoutComponent) TableName() string {
	return "store_layout_components"
}
