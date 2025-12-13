package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusConfirmed  OrderStatus = "confirmed"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusShipped    OrderStatus = "shipped"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
	OrderStatusRefunded   OrderStatus = "refunded"
)

type ShippingAddress struct {
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Company    string `json:"company"`
	Address1   string `json:"address1"`
	Address2   string `json:"address2"`
	City       string `json:"city"`
	Province   string `json:"province"`
	Country    string `json:"country"`
	PostalCode string `json:"postal_code"`
	Phone      string `json:"phone"`
}

func (sa ShippingAddress) Value() (driver.Value, error) {
	return json.Marshal(sa)
}

func (sa *ShippingAddress) Scan(value interface{}) error {
	if value == nil {
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, sa)
	case string:
		return json.Unmarshal([]byte(v), sa)
	}
	return nil
}

type Order struct {
	ID              uint            `json:"id" gorm:"primaryKey"`
	OrderNumber     string          `json:"order_number" gorm:"uniqueIndex;not null"`
	Status          OrderStatus     `json:"status" gorm:"default:'pending'"`
	CustomerEmail   string          `json:"customer_email" gorm:"not null"`
	CustomerID      *uint           `json:"customer_id"`
	StoreID         uint            `json:"store_id" gorm:"not null"`
	SubtotalPrice   float64         `json:"subtotal_price" gorm:"not null"`
	TaxPrice        float64         `json:"tax_price" gorm:"default:0"`
	ShippingPrice   float64         `json:"shipping_price" gorm:"default:0"`
	TotalPrice      float64         `json:"total_price" gorm:"not null"`
	Currency        string          `json:"currency" gorm:"default:'USD'"`
	ShippingAddress ShippingAddress `json:"shipping_address" gorm:"type:jsonb"`
	BillingAddress  ShippingAddress `json:"billing_address" gorm:"type:jsonb"`
	Notes           string          `json:"notes"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       gorm.DeletedAt  `json:"-" gorm:"index"`

	// Relationships
	Customer   *User       `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Store      Store       `json:"store,omitempty" gorm:"foreignKey:StoreID"`
	OrderItems []OrderItem `json:"order_items,omitempty" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	OrderID      uint           `json:"order_id" gorm:"not null"`
	ProductID    uint           `json:"product_id" gorm:"not null"`
	VariantID    string         `json:"variant_id"`
	Quantity     int            `json:"quantity" gorm:"not null"`
	Price        float64        `json:"price" gorm:"not null"`
	ProductTitle string         `json:"product_title" gorm:"not null"`
	ProductSKU   string         `json:"product_sku"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Order   Order   `json:"order,omitempty" gorm:"foreignKey:OrderID"`
	Product Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

type OrderCreateRequest struct {
	CustomerEmail   string             `json:"customer_email" binding:"required,email"`
	ShippingAddress ShippingAddress    `json:"shipping_address" binding:"required"`
	BillingAddress  ShippingAddress    `json:"billing_address"`
	Items           []OrderItemRequest `json:"items" binding:"required,min=1"`
	Notes           string             `json:"notes"`
}

type OrderItemRequest struct {
	ProductID uint   `json:"product_id" binding:"required"`
	VariantID string `json:"variant_id"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type OrderUpdateRequest struct {
	Status          *OrderStatus     `json:"status,omitempty"`
	ShippingAddress *ShippingAddress `json:"shipping_address,omitempty"`
	BillingAddress  *ShippingAddress `json:"billing_address,omitempty"`
	Notes           *string          `json:"notes,omitempty"`
}
