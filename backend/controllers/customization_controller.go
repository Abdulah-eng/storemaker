package controllers

import (
	"net/http"
	"strconv"

	"storemaker-backend/models"
	"storemaker-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CustomizationController struct {
	db *gorm.DB
}

func NewCustomizationController(db *gorm.DB) *CustomizationController {
	return &CustomizationController{db: db}
}

// Store Layout Management
type StoreLayoutResponse struct {
	Components []ComponentData    `json:"components"`
	Theme      *models.StoreTheme `json:"theme"`
}

type ComponentData struct {
	ID    string                 `json:"id"`
	Type  string                 `json:"type"`
	Props map[string]interface{} `json:"props"`
	Order int                    `json:"order"`
}

type StoreLayoutRequest struct {
	Components []ComponentData    `json:"components"`
	Theme      *models.StoreTheme `json:"theme"`
}

func (ctrl *CustomizationController) GetStoreLayout(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	// Check if store exists
	var store models.Store
	if err := ctrl.db.First(&store, storeID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store"})
		}
		return
	}

	// Get store theme
	var theme models.StoreTheme
	if err := ctrl.db.Where("store_id = ?", storeID).First(&theme).Error; err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store theme"})
		return
	}

	// Get store layout components
	var storeLayout models.StoreLayout
	var components []ComponentData

	if err := ctrl.db.Preload("Components").Where("store_id = ?", storeID).First(&storeLayout).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// No layout saved yet, return empty components
			components = []ComponentData{}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store layout"})
			return
		}
	} else {
		// Convert stored components to ComponentData format
		for _, comp := range storeLayout.Components {
			component := ComponentData{
				ID:    strconv.FormatUint(uint64(comp.ID), 10),
				Type:  comp.Type,
				Props: comp.Props,
				Order: comp.Order,
			}
			components = append(components, component)
		}
	}

	response := StoreLayoutResponse{
		Components: components,
		Theme:      &theme,
	}

	c.JSON(http.StatusOK, response)
}

// Public endpoint - Get store layout by slug (for public store access)
func (ctrl *CustomizationController) GetPublicStoreLayout(c *gin.Context) {
	storeSlug := c.Param("slug")

	// Get store by slug (allow both active and draft for development)
	var store models.Store
	if err := ctrl.db.Where("slug = ? AND status IN (?, ?)", storeSlug, models.StoreStatusActive, models.StoreStatusDraft).First(&store).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store"})
		}
		return
	}

	// Get store theme
	var theme models.StoreTheme
	if err := ctrl.db.Where("store_id = ?", store.ID).First(&theme).Error; err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store theme"})
		return
	}

	// Get store layout components
	var storeLayout models.StoreLayout
	var components []ComponentData

	if err := ctrl.db.Preload("Components").Where("store_id = ?", store.ID).First(&storeLayout).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// No layout saved yet, return empty components
			components = []ComponentData{}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store layout"})
			return
		}
	} else {
		// Convert stored components to ComponentData format
		for _, comp := range storeLayout.Components {
			component := ComponentData{
				ID:    strconv.FormatUint(uint64(comp.ID), 10),
				Type:  comp.Type,
				Props: comp.Props,
				Order: comp.Order,
			}
			components = append(components, component)
		}
	}

	response := StoreLayoutResponse{
		Components: components,
		Theme:      &theme,
	}

	c.JSON(http.StatusOK, response)
}

func (ctrl *CustomizationController) SaveStoreLayout(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var req StoreLayoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Start transaction
	tx := ctrl.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Save or update store layout
	var existingLayout models.StoreLayout
	if err := tx.Where("store_id = ?", storeID).First(&existingLayout).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new layout
			layout := models.StoreLayout{
				StoreID: uint(storeID),
			}
			if err := tx.Create(&layout).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create store layout"})
				return
			}
			existingLayout = layout
		} else {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch existing layout"})
			return
		}
	}

	// Delete existing components
	if err := tx.Where("store_layout_id = ?", existingLayout.ID).Delete(&models.StoreLayoutComponent{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete existing components"})
		return
	}

	// Create new components
	if req.Components != nil && len(req.Components) > 0 {
		for _, comp := range req.Components {
			component := models.StoreLayoutComponent{
				StoreLayoutID: existingLayout.ID,
				Type:          comp.Type,
				Props:         comp.Props,
				Order:         comp.Order,
			}
			if err := tx.Create(&component).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create component"})
				return
			}
		}
	}

	// Update theme if provided
	if req.Theme != nil {
		var existingTheme models.StoreTheme
		if err := tx.Where("store_id = ?", storeID).First(&existingTheme).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Create new theme
				req.Theme.StoreID = uint(storeID)
				if err := tx.Create(req.Theme).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create theme"})
					return
				}
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch existing theme"})
				return
			}
		} else {
			// Update existing theme
			req.Theme.ID = existingTheme.ID
			req.Theme.StoreID = uint(storeID)
			if err := tx.Save(req.Theme).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update theme"})
				return
			}
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save layout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Layout saved successfully"})
}

// Public endpoint - Get published pages by store slug
func (ctrl *CustomizationController) GetStorePages(c *gin.Context) {
	storeSlug := c.Param("slug")

	var store models.Store
	if err := ctrl.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	var pages []models.Page
	if err := ctrl.db.Where("store_id = ? AND is_published = ?", store.ID, true).Find(&pages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pages"})
		return
	}

	c.JSON(http.StatusOK, pages)
}

// Management endpoint - Get all pages for store owner
func (ctrl *CustomizationController) GetPages(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var pages []models.Page
	query := ctrl.db.Where("store_id = ?", storeID)

	// Filter by type if provided
	if pageType := c.Query("type"); pageType != "" {
		query = query.Where("type = ?", pageType)
	}

	// Filter by published status if provided
	if published := c.Query("published"); published != "" {
		switch published {
		case "true":
			query = query.Where("is_published = ?", true)
		case "false":
			query = query.Where("is_published = ?", false)
		}
	}

	if err := query.Order("created_at DESC").Find(&pages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pages"})
		return
	}

	c.JSON(http.StatusOK, pages)
}

func (ctrl *CustomizationController) GetStorePage(c *gin.Context) {
	storeSlug := c.Param("slug")
	pageSlug := c.Param("pageSlug")

	var store models.Store
	if err := ctrl.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	var page models.Page
	if err := ctrl.db.Where("store_id = ? AND slug = ? AND is_published = ?", store.ID, pageSlug, true).
		Preload("Sections.Components").First(&page).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		return
	}

	c.JSON(http.StatusOK, page)
}

func (ctrl *CustomizationController) GetPublicStorePages(c *gin.Context) {
	storeSlug := c.Param("slug")

	var store models.Store
	if err := ctrl.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	var pages []models.Page
	if err := ctrl.db.Where("store_id = ? AND is_published = ?", store.ID, true).
		Preload("Sections.Components").
		Find(&pages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pages"})
		return
	}

	c.JSON(http.StatusOK, pages)
}

func (ctrl *CustomizationController) GetPublicStorePage(c *gin.Context) {
	storeSlug := c.Param("slug")
	pageSlug := c.Param("pageSlug")

	var store models.Store
	if err := ctrl.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	var page models.Page
	if err := ctrl.db.Where("store_id = ? AND slug = ? AND is_published = ?", store.ID, pageSlug, true).
		Preload("Sections.Components").
		First(&page).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		return
	}

	c.JSON(http.StatusOK, page)
}

func (ctrl *CustomizationController) CreatePage(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var req models.Page
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate slug from title if not provided
	if req.Slug == "" && req.Title != "" {
		baseSlug := utils.GenerateSlug(req.Title)
		req.Slug = utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
			var count int64
			ctrl.db.Model(&models.Page{}).Where("store_id = ? AND slug = ?", storeID, s).Count(&count)
			return count > 0
		})
	}

	req.StoreID = uint(storeID)
	if err := ctrl.db.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create page"})
		return
	}

	c.JSON(http.StatusCreated, req)
}

func (ctrl *CustomizationController) UpdatePage(c *gin.Context) {
	pageID, err := strconv.ParseUint(c.Param("pageId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page ID"})
		return
	}

	var req models.Page
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.db.Model(&models.Page{}).Where("id = ?", pageID).Updates(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update page"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Page updated successfully"})
}

func (ctrl *CustomizationController) DeletePage(c *gin.Context) {
	pageID, err := strconv.ParseUint(c.Param("pageId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page ID"})
		return
	}

	if err := ctrl.db.Delete(&models.Page{}, pageID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete page"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Page deleted successfully"})
}

func (ctrl *CustomizationController) GetStoreSettings(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var settings models.StoreSettings
	if err := ctrl.db.Where("store_id = ?", storeID).First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default settings
			settings = models.StoreSettings{
				StoreID:            uint(storeID),
				Currency:           "USD",
				Language:           "en",
				Timezone:           "UTC",
				AllowGuestCheckout: true,
				RequireShipping:    true,
			}
			if err := ctrl.db.Create(&settings).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create default settings"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
			return
		}
	}

	c.JSON(http.StatusOK, settings)
}

func (ctrl *CustomizationController) UpdateStoreSettings(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var req models.StoreSettings
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.db.Model(&models.StoreSettings{}).Where("store_id = ?", storeID).Updates(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully"})
}

func (ctrl *CustomizationController) GetStoreTheme(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var theme models.StoreTheme
	if err := ctrl.db.Where("store_id = ?", storeID).First(&theme).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default theme
			theme = models.StoreTheme{
				StoreID: uint(storeID),
				Colors:  make(models.ThemeColors),
				Fonts:   make(models.ThemeFonts),
			}
			if err := ctrl.db.Create(&theme).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create default theme"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch theme"})
			return
		}
	}

	c.JSON(http.StatusOK, theme)
}

func (ctrl *CustomizationController) UpdateStoreTheme(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var req models.StoreTheme
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.db.Model(&models.StoreTheme{}).Where("store_id = ?", storeID).Updates(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update theme"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Theme updated successfully"})
}

// Page Layout Management
type PageLayoutResponse struct {
	Components []ComponentData    `json:"components"`
	Theme      *models.StoreTheme `json:"theme"`
}

type PageLayoutRequest struct {
	Components []ComponentData    `json:"components"`
	Theme      *models.StoreTheme `json:"theme"`
}

// Get page layout by page ID
func (ctrl *CustomizationController) GetPageLayout(c *gin.Context) {
	pageID, err := strconv.ParseUint(c.Param("pageId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page ID"})
		return
	}

	// Get page with sections and components
	var page models.Page
	if err := ctrl.db.Where("id = ?", pageID).Preload("Sections.Components").First(&page).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch page"})
		}
		return
	}

	// Get store theme
	var theme models.StoreTheme
	if err := ctrl.db.Where("store_id = ?", page.StoreID).First(&theme).Error; err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store theme"})
		return
	}

	// Convert sections/components to frontend format
	var components []ComponentData
	for _, section := range page.Sections {
		for _, component := range section.Components {
			components = append(components, ComponentData{
				ID:    component.Name,
				Type:  string(component.Type),
				Props: component.Config,
				Order: component.Order,
			})
		}
	}

	response := PageLayoutResponse{
		Components: components,
		Theme:      &theme,
	}

	c.JSON(http.StatusOK, response)
}

// Save page layout by page ID
func (ctrl *CustomizationController) SavePageLayout(c *gin.Context) {
	pageID, err := strconv.ParseUint(c.Param("pageId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page ID"})
		return
	}

	var req PageLayoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get page to verify it exists and get store ID
	var page models.Page
	if err := ctrl.db.First(&page, pageID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch page"})
		}
		return
	}

	// Start transaction
	tx := ctrl.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Clear existing sections and components for this page
	if err := tx.Where("page_id = ?", pageID).Delete(&models.Section{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear existing page layout"})
		return
	}

	// Create new section for components
	section := models.Section{
		Name:      "Main Content",
		Type:      models.SectionTypeText, // Generic type
		PageID:    uint(pageID),
		Order:     0,
		IsVisible: true,
	}
	if err := tx.Create(&section).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create section"})
		return
	}

	// Create components
	for _, comp := range req.Components {
		component := models.Component{
			Name:      comp.ID,
			Type:      models.ComponentType(comp.Type),
			Config:    models.ComponentConfig(comp.Props),
			Order:     comp.Order,
			SectionID: section.ID,
			IsVisible: true,
		}
		if err := tx.Create(&component).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create component"})
			return
		}
	}

	// Update theme if provided (only if it's for the store, not individual pages)
	if req.Theme != nil {
		var existingTheme models.StoreTheme
		if err := tx.Where("store_id = ?", page.StoreID).First(&existingTheme).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Create new theme
				req.Theme.StoreID = page.StoreID
				if err := tx.Create(req.Theme).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create theme"})
					return
				}
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch existing theme"})
				return
			}
		} else {
			// Update existing theme
			req.Theme.ID = existingTheme.ID
			req.Theme.StoreID = page.StoreID
			if err := tx.Save(req.Theme).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update theme"})
				return
			}
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save page layout"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Page layout saved successfully"})
}

// Get public page layout by store slug and page slug
func (ctrl *CustomizationController) GetPublicPageLayout(c *gin.Context) {
	storeSlug := c.Param("slug")
	pageSlug := c.Param("pageSlug")

	// Get store by slug (allow both active and draft for development)
	var store models.Store
	if err := ctrl.db.Where("slug = ? AND status IN (?, ?)", storeSlug, models.StoreStatusActive, models.StoreStatusDraft).First(&store).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store"})
		}
		return
	}

	// Get page by slug
	var page models.Page
	if err := ctrl.db.Where("store_id = ? AND slug = ? AND is_published = ?", store.ID, pageSlug, true).
		Preload("Sections.Components").First(&page).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch page"})
		}
		return
	}

	// Get store theme
	var theme models.StoreTheme
	if err := ctrl.db.Where("store_id = ?", store.ID).First(&theme).Error; err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store theme"})
		return
	}

	// Convert sections/components to frontend format
	var components []ComponentData
	for _, section := range page.Sections {
		for _, component := range section.Components {
			components = append(components, ComponentData{
				ID:    component.Name,
				Type:  string(component.Type),
				Props: component.Config,
				Order: component.Order,
			})
		}
	}

	response := PageLayoutResponse{
		Components: components,
		Theme:      &theme,
	}

	c.JSON(http.StatusOK, response)
}
