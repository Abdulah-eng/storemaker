package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleMerchant UserRole = "merchant"
	RoleCustomer UserRole = "customer"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name"`
	LastName  string         `json:"last_name"`
	Role      UserRole       `json:"role" gorm:"default:'merchant'"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Stores []Store `json:"stores,omitempty" gorm:"foreignKey:OwnerID"`
	Orders []Order `json:"orders,omitempty" gorm:"foreignKey:CustomerID"`
}

type UserRegistrationRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
}

type UserLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Role      UserRole  `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}
