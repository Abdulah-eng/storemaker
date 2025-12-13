package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type ProductStatus string

const (
	ProductStatusActive   ProductStatus = "active"
	ProductStatusInactive ProductStatus = "inactive"
	ProductStatusDraft    ProductStatus = "draft"
)

type ProductImages []string

func (pi ProductImages) Value() (driver.Value, error) {
	return json.Marshal(pi)
}

func (pi *ProductImages) Scan(value interface{}) error {
	if value == nil {
		*pi = []string{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, pi)
	case string:
		return json.Unmarshal([]byte(v), pi)
	}
	return nil
}

type ProductVariants []ProductVariant

func (pv ProductVariants) Value() (driver.Value, error) {
	return json.Marshal(pv)
}

func (pv *ProductVariants) Scan(value interface{}) error {
	if value == nil {
		*pv = []ProductVariant{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, pv)
	case string:
		return json.Unmarshal([]byte(v), pv)
	}
	return nil
}

type ProductVariant struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	Price   float64           `json:"price"`
	SKU     string            `json:"sku"`
	Stock   int               `json:"stock"`
	Options map[string]string `json:"options"`
}

type Product struct {
	ID           uint            `json:"id" gorm:"primaryKey"`
	Name         string          `json:"name" gorm:"not null"`
	Slug         string          `json:"slug" gorm:"not null"`
	Description  string          `json:"description"`
	ShortDesc    string          `json:"short_description"`
	Price        float64         `json:"price" gorm:"not null"`
	ComparePrice *float64        `json:"compare_price"`
	SKU          string          `json:"sku"`
	Images       ProductImages   `json:"images" gorm:"type:jsonb"`
	Variants     ProductVariants `json:"variants" gorm:"type:jsonb"`
	Status       ProductStatus   `json:"status" gorm:"default:'draft'"`
	Stock        int             `json:"stock" gorm:"default:0"`
	Weight       *float64        `json:"weight"`
	IsDigital    bool            `json:"is_digital" gorm:"default:false"`
	SeoTitle     string          `json:"seo_title"`
	SeoDesc      string          `json:"seo_description"`
	StoreID      uint            `json:"store_id" gorm:"not null"`
	CategoryID   *uint           `json:"category_id"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	DeletedAt    gorm.DeletedAt  `json:"-" gorm:"index"`

	// Relationships
	Store    Store     `json:"store,omitempty" gorm:"foreignKey:StoreID"`
	Category *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
}

type Category struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"not null"`
	Description string         `json:"description"`
	Image       string         `json:"image"`
	ParentID    *uint          `json:"parent_id"`
	StoreID     uint           `json:"store_id" gorm:"not null"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Store    Store      `json:"store,omitempty" gorm:"foreignKey:StoreID"`
	Parent   *Category  `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children []Category `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	Products []Product  `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

type ProductCreateRequest struct {
	Name         string          `json:"name" binding:"required"`
	Description  string          `json:"description"`
	ShortDesc    string          `json:"short_description"`
	Price        float64         `json:"price" binding:"required,min=0"`
	ComparePrice *float64        `json:"compare_price,omitempty"`
	SKU          string          `json:"sku"`
	Images       ProductImages   `json:"images"`
	Variants     ProductVariants `json:"variants"`
	Stock        int             `json:"stock"`
	Weight       *float64        `json:"weight,omitempty"`
	IsDigital    bool            `json:"is_digital"`
	SeoTitle     string          `json:"seo_title"`
	SeoDesc      string          `json:"seo_description"`
	CategoryID   *uint           `json:"category_id,omitempty"`
}

type ProductUpdateRequest struct {
	Name         *string          `json:"name,omitempty"`
	Description  *string          `json:"description,omitempty"`
	ShortDesc    *string          `json:"short_description,omitempty"`
	Price        *float64         `json:"price,omitempty"`
	ComparePrice *float64         `json:"compare_price,omitempty"`
	SKU          *string          `json:"sku,omitempty"`
	Images       *ProductImages   `json:"images,omitempty"`
	Variants     *ProductVariants `json:"variants,omitempty"`
	Status       *ProductStatus   `json:"status,omitempty"`
	Stock        *int             `json:"stock,omitempty"`
	Weight       *float64         `json:"weight,omitempty"`
	IsDigital    *bool            `json:"is_digital,omitempty"`
	SeoTitle     *string          `json:"seo_title,omitempty"`
	SeoDesc      *string          `json:"seo_description,omitempty"`
	CategoryID   *uint            `json:"category_id,omitempty"`
}
