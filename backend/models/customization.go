package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type ThemeColors map[string]string

func (tc ThemeColors) Value() (driver.Value, error) {
	return json.Marshal(tc)
}

func (tc *ThemeColors) Scan(value interface{}) error {
	if value == nil {
		*tc = make(map[string]string)
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, tc)
	case string:
		return json.Unmarshal([]byte(v), tc)
	}
	return nil
}

type ThemeFonts map[string]string

func (tf ThemeFonts) Value() (driver.Value, error) {
	return json.Marshal(tf)
}

func (tf *ThemeFonts) Scan(value interface{}) error {
	if value == nil {
		*tf = make(map[string]string)
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, tf)
	case string:
		return json.Unmarshal([]byte(v), tf)
	}
	return nil
}

type StoreSettings struct {
	ID                 uint           `json:"id" gorm:"primaryKey"`
	StoreID            uint           `json:"store_id" gorm:"uniqueIndex;not null"`
	Currency           string         `json:"currency" gorm:"default:'USD'"`
	Language           string         `json:"language" gorm:"default:'en'"`
	Timezone           string         `json:"timezone" gorm:"default:'UTC'"`
	AllowGuestCheckout bool           `json:"allow_guest_checkout" gorm:"default:true"`
	RequireShipping    bool           `json:"require_shipping" gorm:"default:true"`
	TaxIncluded        bool           `json:"tax_included" gorm:"default:false"`
	TaxRate            float64        `json:"tax_rate" gorm:"default:0"`
	ShippingRate       float64        `json:"shipping_rate" gorm:"default:0"`
	FreeShippingMin    float64        `json:"free_shipping_min" gorm:"default:0"`
	OrderPrefix        string         `json:"order_prefix" gorm:"default:'#'"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Store Store `json:"store,omitempty" gorm:"foreignKey:StoreID"`
}

type StoreTheme struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	StoreID     uint           `json:"store_id" gorm:"uniqueIndex;not null"`
	Colors      ThemeColors    `json:"colors" gorm:"type:jsonb"`
	Fonts       ThemeFonts     `json:"fonts" gorm:"type:jsonb"`
	LogoURL     string         `json:"logo_url"`
	FaviconURL  string         `json:"favicon_url"`
	HeaderStyle string         `json:"header_style" gorm:"default:'modern'"`
	FooterStyle string         `json:"footer_style" gorm:"default:'simple'"`
	ButtonStyle string         `json:"button_style" gorm:"default:'rounded'"`
	CustomCSS   string         `json:"custom_css" gorm:"type:text"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Store Store `json:"store,omitempty" gorm:"foreignKey:StoreID"`
}

type PageType string

const (
	PageTypeHome    PageType = "home"
	PageTypeAbout   PageType = "about"
	PageTypeContact PageType = "contact"
	PageTypePrivacy PageType = "privacy"
	PageTypeTerms   PageType = "terms"
	PageTypeCustom  PageType = "custom"
)

type Page struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Type        PageType       `json:"type" gorm:"default:'custom'"`
	IsPublished bool           `json:"is_published" gorm:"default:false"`
	SeoTitle    string         `json:"seo_title"`
	SeoDesc     string         `json:"seo_description"`
	StoreID     uint           `json:"store_id" gorm:"not null"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Store    Store     `json:"store,omitempty" gorm:"foreignKey:StoreID"`
	Sections []Section `json:"sections,omitempty" gorm:"foreignKey:PageID"`
}

type SectionType string

const (
	SectionTypeHero         SectionType = "hero"
	SectionTypeFeatures     SectionType = "features"
	SectionTypeProducts     SectionType = "products"
	SectionTypeText         SectionType = "text"
	SectionTypeImage        SectionType = "image"
	SectionTypeVideo        SectionType = "video"
	SectionTypeTestimonials SectionType = "testimonials"
	SectionTypeFAQ          SectionType = "faq"
	SectionTypeContact      SectionType = "contact"
)

type SectionConfig map[string]interface{}

func (sc SectionConfig) Value() (driver.Value, error) {
	return json.Marshal(sc)
}

func (sc *SectionConfig) Scan(value interface{}) error {
	if value == nil {
		*sc = make(map[string]interface{})
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, sc)
	case string:
		return json.Unmarshal([]byte(v), sc)
	}
	return nil
}

type Section struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null"`
	Type      SectionType    `json:"type" gorm:"not null"`
	Config    SectionConfig  `json:"config" gorm:"type:jsonb"`
	Order     int            `json:"order" gorm:"default:0"`
	IsVisible bool           `json:"is_visible" gorm:"default:true"`
	PageID    uint           `json:"page_id" gorm:"not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Page       Page        `json:"page,omitempty" gorm:"foreignKey:PageID"`
	Components []Component `json:"components,omitempty" gorm:"foreignKey:SectionID"`
}

type ComponentType string

const (
	ComponentTypeText   ComponentType = "text"
	ComponentTypeImage  ComponentType = "image"
	ComponentTypeButton ComponentType = "button"
	ComponentTypeForm   ComponentType = "form"
	ComponentTypeList   ComponentType = "list"
	ComponentTypeCard   ComponentType = "card"

	// Store Builder Component Types
	ComponentTypeHeroBanner        ComponentType = "hero-banner"
	ComponentTypeHeroSplit         ComponentType = "hero-split"
	ComponentTypeHeroVideo         ComponentType = "hero-video"
	ComponentTypeHeroMinimal       ComponentType = "hero-minimal"
	ComponentTypeProductGrid       ComponentType = "product-grid"
	ComponentTypeProductCarousel   ComponentType = "product-carousel"
	ComponentTypeProductShowcase   ComponentType = "product-showcase"
	ComponentTypeProductCategories ComponentType = "product-categories"
	ComponentTypeImageGallery      ComponentType = "image-gallery"
	ComponentTypeVideoEmbed        ComponentType = "video-embed"
	ComponentTypeFeatureList       ComponentType = "feature-list"
	ComponentTypeTestimonials      ComponentType = "testimonials"
	ComponentTypeCtaBanner         ComponentType = "cta-banner"
	ComponentTypeNewsletter        ComponentType = "newsletter"
	ComponentTypeContactInfo       ComponentType = "contact-info"
	ComponentTypeAboutSection      ComponentType = "about-section"
	ComponentTypeImageText         ComponentType = "image-text"
	ComponentTypeReviewsGrid       ComponentType = "reviews-grid"
	ComponentTypeSocialProof       ComponentType = "social-proof"
	ComponentTypeIconGrid          ComponentType = "icon-grid"
	ComponentTypeBeforeAfter       ComponentType = "before-after"
	ComponentTypeStatsCounter      ComponentType = "stats-counter"
)

type ComponentConfig map[string]interface{}

func (cc ComponentConfig) Value() (driver.Value, error) {
	return json.Marshal(cc)
}

func (cc *ComponentConfig) Scan(value interface{}) error {
	if value == nil {
		*cc = make(map[string]interface{})
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, cc)
	case string:
		return json.Unmarshal([]byte(v), cc)
	}
	return nil
}

type Component struct {
	ID        uint            `json:"id" gorm:"primaryKey"`
	Name      string          `json:"name" gorm:"not null"`
	Type      ComponentType   `json:"type" gorm:"not null"`
	Config    ComponentConfig `json:"config" gorm:"type:jsonb"`
	Order     int             `json:"order" gorm:"default:0"`
	IsVisible bool            `json:"is_visible" gorm:"default:true"`
	SectionID uint            `json:"section_id" gorm:"not null"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt gorm.DeletedAt  `json:"-" gorm:"index"`

	// Relationships
	Section Section `json:"section,omitempty" gorm:"foreignKey:SectionID"`
}
