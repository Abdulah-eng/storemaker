package models

import (
	"time"

	"gorm.io/gorm"
)

type StoreStatus string

const (
	StoreStatusActive   StoreStatus = "active"
	StoreStatusInactive StoreStatus = "inactive"
	StoreStatusDraft    StoreStatus = "draft"
)

type Store struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Description string         `json:"description"`
	Logo        string         `json:"logo"`
	Favicon     string         `json:"favicon"`
	Domain      string         `json:"domain" gorm:"uniqueIndex"`
	Subdomain   string         `json:"subdomain" gorm:"uniqueIndex"`
	Status      StoreStatus    `json:"status" gorm:"default:'draft'"`
	OwnerID     uint           `json:"owner_id" gorm:"not null"`
	TemplateID  *uint          `json:"template_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Owner      User           `json:"owner,omitempty" gorm:"foreignKey:OwnerID"`
	Template   *Template      `json:"template,omitempty" gorm:"foreignKey:TemplateID"`
	Products   []Product      `json:"products,omitempty" gorm:"foreignKey:StoreID"`
	Categories []Category     `json:"categories,omitempty" gorm:"foreignKey:StoreID"`
	Orders     []Order        `json:"orders,omitempty" gorm:"foreignKey:StoreID"`
	Settings   *StoreSettings `json:"settings,omitempty" gorm:"foreignKey:StoreID"`
	Theme      *StoreTheme    `json:"theme,omitempty" gorm:"foreignKey:StoreID"`
	Pages      []Page         `json:"pages,omitempty" gorm:"foreignKey:StoreID"`
}

type StoreCreateRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	TemplateID  *uint  `json:"template_id"`
}

type StoreCreateWithAIRequest struct {
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description" binding:"required"`
	Industry     string `json:"industry" binding:"required"`
	BusinessType string `json:"business_type" binding:"required"`
}

// AIStoreConfig represents the AI-generated store configuration
type AIStoreConfig struct {
	Theme      *AIThemeConfig       `json:"theme,omitempty"`
	Settings   *AISettingsConfig    `json:"settings,omitempty"`
	Pages      []*AIPageConfig      `json:"pages,omitempty"`
	Components []*AIComponentConfig `json:"components,omitempty"`
}

type AIThemeConfig struct {
	Colors      ThemeColors `json:"colors,omitempty"`
	Fonts       ThemeFonts  `json:"fonts,omitempty"`
	LogoURL     string      `json:"logo_url,omitempty"`
	FaviconURL  string      `json:"favicon_url,omitempty"`
	HeaderStyle string      `json:"header_style,omitempty"`
	FooterStyle string      `json:"footer_style,omitempty"`
	ButtonStyle string      `json:"button_style,omitempty"`
	CustomCSS   string      `json:"custom_css,omitempty"`
}

type AISettingsConfig struct {
	Currency           string   `json:"currency,omitempty"`
	Language           string   `json:"language,omitempty"`
	Timezone           string   `json:"timezone,omitempty"`
	AllowGuestCheckout *bool    `json:"allow_guest_checkout,omitempty"`
	RequireShipping    *bool    `json:"require_shipping,omitempty"`
	TaxIncluded        *bool    `json:"tax_included,omitempty"`
	TaxRate            *float64 `json:"tax_rate,omitempty"`
	ShippingRate       *float64 `json:"shipping_rate,omitempty"`
	FreeShippingMin    *float64 `json:"free_shipping_min,omitempty"`
	OrderPrefix        string   `json:"order_prefix,omitempty"`
}

type AIPageConfig struct {
	Title          string             `json:"title"`
	Slug           string             `json:"slug"`
	Content        string             `json:"content"`
	Type           PageType           `json:"type"`
	IsPublished    bool               `json:"is_published"`
	SeoTitle       string             `json:"seo_title"`
	SeoDescription string             `json:"seo_description"`
	Sections       []*AISectionConfig `json:"sections,omitempty"`
}

type AISectionConfig struct {
	Name       string               `json:"name"`
	Type       SectionType          `json:"type"`
	Order      int                  `json:"order"`
	IsVisible  bool                 `json:"is_visible"`
	Components []*AIComponentConfig `json:"components,omitempty"`
}

type AIComponentConfig struct {
	ID    string                 `json:"id"`
	Type  string                 `json:"type"`
	Order int                    `json:"order"`
	Props map[string]interface{} `json:"props"`
}

type StoreUpdateRequest struct {
	Name        *string      `json:"name,omitempty"`
	Description *string      `json:"description,omitempty"`
	Logo        *string      `json:"logo,omitempty"`
	Favicon     *string      `json:"favicon,omitempty"`
	Domain      *string      `json:"domain,omitempty"`
	Status      *StoreStatus `json:"status,omitempty"`
}

type StoreResponse struct {
	ID          uint        `json:"id"`
	Name        string      `json:"name"`
	Slug        string      `json:"slug"`
	Description string      `json:"description"`
	Logo        string      `json:"logo"`
	Favicon     string      `json:"favicon"`
	Domain      string      `json:"domain"`
	Subdomain   string      `json:"subdomain"`
	Status      StoreStatus `json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}
