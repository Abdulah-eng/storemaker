package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"storemaker-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TemplateController struct {
	db *gorm.DB
}

func NewTemplateController(db *gorm.DB) *TemplateController {
	return &TemplateController{db: db}
}

func (ctrl *TemplateController) GetPublicTemplates(c *gin.Context) {
	var templates []models.Template
	if err := ctrl.db.Where("is_active = ?", true).Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch templates"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": templates})
}

func (ctrl *TemplateController) GetTemplate(c *gin.Context) {
	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	var template models.Template
	if err := ctrl.db.Where("id = ? AND is_active = ?", templateID, true).First(&template).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch template"})
		}
		return
	}

	c.JSON(http.StatusOK, template)
}

// GetTemplateAdmin gets a template for admin use (includes inactive templates)
func (ctrl *TemplateController) GetTemplateAdmin(c *gin.Context) {
	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	var template models.Template
	if err := ctrl.db.First(&template, templateID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch template"})
		}
		return
	}

	c.JSON(http.StatusOK, template)
}

func (ctrl *TemplateController) GetAllTemplates(c *gin.Context) {
	var templates []models.Template
	if err := ctrl.db.Order("created_at DESC").Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch templates"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": templates})
}

func (ctrl *TemplateController) CreateTemplate(c *gin.Context) {
	var req models.TemplateCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template := models.Template{
		Name:         req.Name,
		Description:  req.Description,
		Category:     req.Category,
		PreviewURL:   req.PreviewURL,
		ThumbnailURL: req.ThumbnailURL,
		Config:       req.Config,
		IsActive:     true,
		IsPremium:    req.IsPremium,
	}

	if err := ctrl.db.Create(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create template"})
		return
	}

	c.JSON(http.StatusCreated, template)
}

func (ctrl *TemplateController) UpdateTemplate(c *gin.Context) {
	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	var req models.TemplateUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Debug logging
	fmt.Printf("Updating template %d with config: %+v\n", templateID, req.Config)

	var template models.Template
	if err := ctrl.db.First(&template, templateID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch template"})
		}
		return
	}

	// Update fields if provided
	if req.Name != nil {
		template.Name = *req.Name
	}
	if req.Description != nil {
		template.Description = *req.Description
	}
	if req.Category != nil {
		template.Category = *req.Category
	}
	if req.PreviewURL != nil {
		template.PreviewURL = *req.PreviewURL
	}
	if req.ThumbnailURL != nil {
		template.ThumbnailURL = *req.ThumbnailURL
	}
	if req.Config != nil {
		template.Config = *req.Config
	}
	if req.IsActive != nil {
		template.IsActive = *req.IsActive
	}
	if req.IsPremium != nil {
		template.IsPremium = *req.IsPremium
	}

	if err := ctrl.db.Save(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template"})
		return
	}

	fmt.Printf("Template %d updated successfully with config: %+v\n", templateID, template.Config)
	c.JSON(http.StatusOK, template)
}

func (ctrl *TemplateController) DeleteTemplate(c *gin.Context) {
	templateID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	// Check if template is being used by any stores
	var count int64
	if err := ctrl.db.Model(&models.Store{}).Where("template_id = ?", templateID).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check template usage"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete template that is being used by stores"})
		return
	}

	if err := ctrl.db.Delete(&models.Template{}, templateID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete template"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Template deleted successfully"})
}
