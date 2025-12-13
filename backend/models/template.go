package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type TemplateCategory string

const (
	TemplateCategoryFashion     TemplateCategory = "fashion"
	TemplateCategoryElectronics TemplateCategory = "electronics"
	TemplateCategoryFood        TemplateCategory = "food"
	TemplateCategoryBeauty      TemplateCategory = "beauty"
	TemplateCategoryHome        TemplateCategory = "home"
	TemplateCategoryGeneral     TemplateCategory = "general"
)

type TemplateConfig map[string]interface{}

func (tc TemplateConfig) Value() (driver.Value, error) {
	return json.Marshal(tc)
}

func (tc *TemplateConfig) Scan(value interface{}) error {
	if value == nil {
		*tc = make(map[string]interface{})
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

type Template struct {
	ID           uint             `json:"id" gorm:"primaryKey"`
	Name         string           `json:"name" gorm:"not null"`
	Description  string           `json:"description"`
	Category     TemplateCategory `json:"category" gorm:"not null"`
	PreviewURL   string           `json:"preview_url"`
	ThumbnailURL string           `json:"thumbnail_url"`
	Config       TemplateConfig   `json:"config" gorm:"type:jsonb"`
	IsActive     bool             `json:"is_active" gorm:"default:true"`
	IsPremium    bool             `json:"is_premium" gorm:"default:false"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
	DeletedAt    gorm.DeletedAt   `json:"-" gorm:"index"`

	// Relationships
	Stores []Store `json:"stores,omitempty" gorm:"foreignKey:TemplateID"`
}

type TemplateCreateRequest struct {
	Name         string           `json:"name" binding:"required"`
	Description  string           `json:"description"`
	Category     TemplateCategory `json:"category" binding:"required"`
	PreviewURL   string           `json:"preview_url"`
	ThumbnailURL string           `json:"thumbnail_url"`
	Config       TemplateConfig   `json:"config"`
	IsPremium    bool             `json:"is_premium"`
}

type TemplateUpdateRequest struct {
	Name         *string           `json:"name,omitempty"`
	Description  *string           `json:"description,omitempty"`
	Category     *TemplateCategory `json:"category,omitempty"`
	PreviewURL   *string           `json:"preview_url,omitempty"`
	ThumbnailURL *string           `json:"thumbnail_url,omitempty"`
	Config       *TemplateConfig   `json:"config,omitempty"`
	IsActive     *bool             `json:"is_active,omitempty"`
	IsPremium    *bool             `json:"is_premium,omitempty"`
}

type TemplateResponse struct {
	ID           uint             `json:"id"`
	Name         string           `json:"name"`
	Description  string           `json:"description"`
	Category     TemplateCategory `json:"category"`
	PreviewURL   string           `json:"preview_url"`
	ThumbnailURL string           `json:"thumbnail_url"`
	Config       TemplateConfig   `json:"config"`
	IsActive     bool             `json:"is_active"`
	IsPremium    bool             `json:"is_premium"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
}
