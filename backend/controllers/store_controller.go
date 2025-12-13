package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"storemaker-backend/models"
	"storemaker-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StoreController struct {
	db *gorm.DB
}

func NewStoreController(db *gorm.DB) *StoreController {
	return &StoreController{db: db}
}

func (ctrl *StoreController) GetUserStores(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	var stores []models.Store
	if err := ctrl.db.Where("owner_id = ?", userID).Find(&stores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stores"})
		return
	}

	// Return stores directly as array
	c.JSON(http.StatusOK, stores)
}

func (ctrl *StoreController) CreateStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	var req models.StoreCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate slug from name
	baseSlug := utils.GenerateSlug(req.Name)
	slug := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
		var count int64
		ctrl.db.Model(&models.Store{}).Where("slug = ?", s).Count(&count)
		return count > 0
	})

	// Generate subdomain
	subdomain := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
		var count int64
		ctrl.db.Model(&models.Store{}).Where("subdomain = ?", s).Count(&count)
		return count > 0
	})

	// Generate unique domain (using subdomain with a domain suffix)
	domain := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
		var count int64
		ctrl.db.Model(&models.Store{}).Where("domain = ?", s+".storemaker.com").Count(&count)
		return count > 0
	}) + ".storemaker.com"

	store := models.Store{
		Name:        req.Name,
		Slug:        slug,
		Subdomain:   subdomain,
		Domain:      domain,
		Description: req.Description,
		OwnerID:     userID.(uint),
		TemplateID:  req.TemplateID,
		Status:      models.StoreStatusDraft,
	}

	// Save the store first
	if err := ctrl.db.Create(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create store"})
		return
	}

	// If a template is selected, copy its theme, settings, and pages to the new store
	if req.TemplateID != nil {
		var template models.Template
		if err := ctrl.db.Preload("Stores").First(&template, *req.TemplateID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Template not found"})
			return
		}

		fmt.Printf("Copying template %s (ID: %d) to store %s (ID: %d)\n", template.Name, template.ID, store.Name, store.ID)
		fmt.Printf("Template config keys: %v\n", getMapKeys(template.Config))

		// Copy theme (if template.Config has theme info)
		if themeConfig, ok := template.Config["theme"].(map[string]interface{}); ok {
			theme := models.StoreTheme{
				StoreID: store.ID,
			}
			if colors, ok := themeConfig["colors"].(map[string]interface{}); ok {
				theme.Colors = make(models.ThemeColors)
				for k, v := range colors {
					if s, ok := v.(string); ok {
						theme.Colors[k] = s
					}
				}
			}
			if fonts, ok := themeConfig["fonts"].(map[string]interface{}); ok {
				theme.Fonts = make(models.ThemeFonts)
				for k, v := range fonts {
					if s, ok := v.(string); ok {
						theme.Fonts[k] = s
					}
				}
			}
			if v, ok := themeConfig["logo_url"].(string); ok {
				theme.LogoURL = v
			}
			if v, ok := themeConfig["favicon_url"].(string); ok {
				theme.FaviconURL = v
			}
			if v, ok := themeConfig["header_style"].(string); ok {
				theme.HeaderStyle = v
			}
			if v, ok := themeConfig["footer_style"].(string); ok {
				theme.FooterStyle = v
			}
			if v, ok := themeConfig["button_style"].(string); ok {
				theme.ButtonStyle = v
			}
			if v, ok := themeConfig["custom_css"].(string); ok {
				theme.CustomCSS = v
			}
			if err := ctrl.db.Create(&theme).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to copy template theme"})
				return
			}
		}

		// Copy settings (if template.Config has settings info)
		if settingsConfig, ok := template.Config["settings"].(map[string]interface{}); ok {
			settings := models.StoreSettings{
				StoreID: store.ID,
			}
			if v, ok := settingsConfig["currency"].(string); ok {
				settings.Currency = v
			}
			if v, ok := settingsConfig["language"].(string); ok {
				settings.Language = v
			}
			if v, ok := settingsConfig["timezone"].(string); ok {
				settings.Timezone = v
			}
			if v, ok := settingsConfig["allow_guest_checkout"].(bool); ok {
				settings.AllowGuestCheckout = v
			}
			if v, ok := settingsConfig["require_shipping"].(bool); ok {
				settings.RequireShipping = v
			}
			if v, ok := settingsConfig["tax_included"].(bool); ok {
				settings.TaxIncluded = v
			}
			if v, ok := settingsConfig["tax_rate"].(float64); ok {
				settings.TaxRate = v
			}
			if v, ok := settingsConfig["shipping_rate"].(float64); ok {
				settings.ShippingRate = v
			}
			if v, ok := settingsConfig["free_shipping_min"].(float64); ok {
				settings.FreeShippingMin = v
			}
			if v, ok := settingsConfig["order_prefix"].(string); ok {
				settings.OrderPrefix = v
			}
			if err := ctrl.db.Create(&settings).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to copy template settings"})
				return
			}
		}

		// Copy components from template (new structure from admin panel)
		// Note: Template components are now stored directly in the store layout
		// and will be loaded via the store layout API, not as a separate home page
		if componentsConfig, ok := template.Config["components"].([]interface{}); ok {
			fmt.Printf("Found %d components in template - these will be loaded via store layout\n", len(componentsConfig))
		}

		// Copy pages (if template.Config has pages info) - legacy structure
		if pagesConfig, ok := template.Config["pages"].([]interface{}); ok {
			for _, pageRaw := range pagesConfig {
				pageMap, ok := pageRaw.(map[string]interface{})
				if !ok {
					continue
				}
				page := models.Page{
					StoreID:     store.ID,
					Title:       getString(pageMap, "title"),
					Slug:        getString(pageMap, "slug"),
					Content:     getString(pageMap, "content"),
					Type:        models.PageType(getString(pageMap, "type")),
					IsPublished: getBool(pageMap, "is_published"),
					SeoTitle:    getString(pageMap, "seo_title"),
					SeoDesc:     getString(pageMap, "seo_description"),
				}
				if err := ctrl.db.Create(&page).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to copy template page"})
					return
				}
				// Copy sections
				if sectionsConfig, ok := pageMap["sections"].([]interface{}); ok {
					for _, sectionRaw := range sectionsConfig {
						sectionMap, ok := sectionRaw.(map[string]interface{})
						if !ok {
							continue
						}
						section := models.Section{
							PageID:    page.ID,
							Name:      getString(sectionMap, "name"),
							Type:      models.SectionType(getString(sectionMap, "type")),
							Order:     getInt(sectionMap, "order"),
							IsVisible: getBool(sectionMap, "is_visible"),
						}
						if err := ctrl.db.Create(&section).Error; err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to copy template section"})
							return
						}
						// Copy components
						if componentsConfig, ok := sectionMap["components"].([]interface{}); ok {
							for _, compRaw := range componentsConfig {
								compMap, ok := compRaw.(map[string]interface{})
								if !ok {
									continue
								}
								component := models.Component{
									SectionID: section.ID,
									Name:      getString(compMap, "name"),
									Type:      models.ComponentType(getString(compMap, "type")),
									Order:     getInt(compMap, "order"),
									IsVisible: getBool(compMap, "is_visible"),
								}
								// Config is a map
								if config, ok := compMap["config"].(map[string]interface{}); ok {
									configBytes, _ := json.Marshal(config)
									var compConfig models.ComponentConfig
									_ = json.Unmarshal(configBytes, &compConfig)
									component.Config = compConfig
								}
								if err := ctrl.db.Create(&component).Error; err != nil {
									c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to copy template component"})
									return
								}
							}
						}
					}
				}
			}
		}
	}

	c.JSON(http.StatusCreated, store)
}

func (ctrl *StoreController) GetStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var store models.Store
	if err := ctrl.db.Where("id = ? AND owner_id = ?", storeID, userID).First(&store).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store"})
		}
		return
	}

	c.JSON(http.StatusOK, store)
}

func (ctrl *StoreController) GetStoreBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var store models.Store
	if err := ctrl.db.Where("slug = ? AND status IN (?, ?)", slug, models.StoreStatusActive, models.StoreStatusDraft).First(&store).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store"})
		}
		return
	}

	c.JSON(http.StatusOK, store)
}

func (ctrl *StoreController) UpdateStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var store models.Store
	if err := ctrl.db.Where("id = ? AND owner_id = ?", storeID, userID).First(&store).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store"})
		}
		return
	}

	var req models.StoreUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		store.Name = *req.Name
		// Update slug if name changed
		baseSlug := utils.GenerateSlug(*req.Name)
		newSlug := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
			if s == store.Slug {
				return false // Allow keeping the same slug
			}
			var count int64
			ctrl.db.Model(&models.Store{}).Where("slug = ?", s).Count(&count)
			return count > 0
		})
		store.Slug = newSlug
	}
	if req.Description != nil {
		store.Description = *req.Description
	}
	if req.Logo != nil {
		store.Logo = *req.Logo
	}
	if req.Favicon != nil {
		store.Favicon = *req.Favicon
	}
	if req.Domain != nil {
		store.Domain = *req.Domain
	}
	if req.Status != nil {
		store.Status = *req.Status
	}

	if err := ctrl.db.Save(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store"})
		return
	}

	c.JSON(http.StatusOK, store)
}

func (ctrl *StoreController) DeleteStore(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var store models.Store
	if err := ctrl.db.Where("id = ? AND owner_id = ?", storeID, userID).First(&store).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch store"})
		}
		return
	}

	if err := ctrl.db.Delete(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete store"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store deleted successfully"})
}

func (ctrl *StoreController) GetStoreAnalytics(c *gin.Context) {
	// TODO: Implement get store analytics
	c.JSON(http.StatusOK, gin.H{"message": "Get store analytics - TODO"})
}

func (ctrl *StoreController) GetAllStores(c *gin.Context) {
	var stores []models.Store
	if err := ctrl.db.Preload("Owner").Preload("Template").Order("created_at DESC").Find(&stores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stores"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stores})
}

func (ctrl *StoreController) UpdateStoreStatus(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var req struct {
		Status models.StoreStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.db.Model(&models.Store{}).Where("id = ?", storeID).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update store status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Store status updated successfully"})
}

func (ctrl *StoreController) GetSystemAnalytics(c *gin.Context) {
	// Get basic system analytics
	var stats struct {
		TotalStores    int64 `json:"total_stores"`
		ActiveStores   int64 `json:"active_stores"`
		TotalUsers     int64 `json:"total_users"`
		TotalProducts  int64 `json:"total_products"`
		TotalOrders    int64 `json:"total_orders"`
		TotalTemplates int64 `json:"total_templates"`
	}

	ctrl.db.Model(&models.Store{}).Count(&stats.TotalStores)
	ctrl.db.Model(&models.Store{}).Where("status = ?", models.StoreStatusActive).Count(&stats.ActiveStores)
	ctrl.db.Model(&models.User{}).Count(&stats.TotalUsers)
	ctrl.db.Model(&models.Product{}).Count(&stats.TotalProducts)
	ctrl.db.Model(&models.Order{}).Count(&stats.TotalOrders)
	ctrl.db.Model(&models.Template{}).Count(&stats.TotalTemplates)

	c.JSON(http.StatusOK, stats)
}

// CreateStoreWithAI handles AI-powered store creation using Gemini API
func (ctrl *StoreController) CreateStoreWithAI(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
		return
	}

	var req models.StoreCreateWithAIRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate AI-powered store configuration
	aiConfig, err := ctrl.generateAIStoreConfig(req.Description, req.Industry, req.BusinessType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate AI store configuration: " + err.Error()})
		return
	}

	// Generate slug from name
	baseSlug := utils.GenerateSlug(req.Name)
	slug := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
		var count int64
		ctrl.db.Model(&models.Store{}).Where("slug = ?", s).Count(&count)
		return count > 0
	})

	// Generate subdomain
	subdomain := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
		var count int64
		ctrl.db.Model(&models.Store{}).Where("subdomain = ?", s).Count(&count)
		return count > 0
	})

	// Generate unique domain
	domain := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
		var count int64
		ctrl.db.Model(&models.Store{}).Where("domain = ?", s+".storemaker.com").Count(&count)
		return count > 0
	}) + ".storemaker.com"

	store := models.Store{
		Name:        req.Name,
		Slug:        slug,
		Subdomain:   subdomain,
		Domain:      domain,
		Description: req.Description,
		OwnerID:     userID.(uint),
		Status:      models.StoreStatusDraft,
	}

	// Save the store first
	if err := ctrl.db.Create(&store).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create store"})
		return
	}

	// Create AI-generated theme
	if aiConfig.Theme != nil {
		theme := models.StoreTheme{
			StoreID: store.ID,
		}

		if aiConfig.Theme.Colors != nil {
			theme.Colors = aiConfig.Theme.Colors
		}
		if aiConfig.Theme.Fonts != nil {
			theme.Fonts = aiConfig.Theme.Fonts
		}
		if aiConfig.Theme.LogoURL != "" {
			theme.LogoURL = aiConfig.Theme.LogoURL
		}
		if aiConfig.Theme.FaviconURL != "" {
			theme.FaviconURL = aiConfig.Theme.FaviconURL
		}
		if aiConfig.Theme.HeaderStyle != "" {
			theme.HeaderStyle = aiConfig.Theme.HeaderStyle
		}
		if aiConfig.Theme.FooterStyle != "" {
			theme.FooterStyle = aiConfig.Theme.FooterStyle
		}
		if aiConfig.Theme.ButtonStyle != "" {
			theme.ButtonStyle = aiConfig.Theme.ButtonStyle
		}
		if aiConfig.Theme.CustomCSS != "" {
			theme.CustomCSS = aiConfig.Theme.CustomCSS
		}

		if err := ctrl.db.Create(&theme).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create AI theme"})
			return
		}
	}

	// Create AI-generated settings
	if aiConfig.Settings != nil {
		settings := models.StoreSettings{
			StoreID: store.ID,
		}

		if aiConfig.Settings.Currency != "" {
			settings.Currency = aiConfig.Settings.Currency
		}
		if aiConfig.Settings.Language != "" {
			settings.Language = aiConfig.Settings.Language
		}
		if aiConfig.Settings.Timezone != "" {
			settings.Timezone = aiConfig.Settings.Timezone
		}
		if aiConfig.Settings.AllowGuestCheckout != nil {
			settings.AllowGuestCheckout = *aiConfig.Settings.AllowGuestCheckout
		}
		if aiConfig.Settings.RequireShipping != nil {
			settings.RequireShipping = *aiConfig.Settings.RequireShipping
		}
		if aiConfig.Settings.TaxIncluded != nil {
			settings.TaxIncluded = *aiConfig.Settings.TaxIncluded
		}
		if aiConfig.Settings.TaxRate != nil {
			settings.TaxRate = *aiConfig.Settings.TaxRate
		}
		if aiConfig.Settings.ShippingRate != nil {
			settings.ShippingRate = *aiConfig.Settings.ShippingRate
		}
		if aiConfig.Settings.FreeShippingMin != nil {
			settings.FreeShippingMin = *aiConfig.Settings.FreeShippingMin
		}
		if aiConfig.Settings.OrderPrefix != "" {
			settings.OrderPrefix = aiConfig.Settings.OrderPrefix
		}

		if err := ctrl.db.Create(&settings).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create AI settings"})
			return
		}
	}

	// Create AI-generated components
	// Note: AI-generated components are now stored directly in the store layout
	// and will be loaded via the store layout API, not as a separate home page
	if aiConfig.Components != nil {
		fmt.Printf("Found %d AI-generated components - these will be loaded via store layout\n", len(aiConfig.Components))
	}

	c.JSON(http.StatusCreated, gin.H{
		"store":        store,
		"ai_generated": true,
		"message":      "Store created successfully with AI assistance",
	})
}

// generateAIStoreConfig uses Gemini API to generate store configuration
func (ctrl *StoreController) generateAIStoreConfig(description, industry, businessType string) (*models.AIStoreConfig, error) {
	geminiAPIKey := "AIzaSyDJ_qhYqnP3C5T0bVpqG1O3vFFz3jydiOs"

	// Create a simplified prompt for Gemini with only available component types
	prompt := fmt.Sprintf(`
Create a simple e-commerce store configuration for a %s business in the %s industry.

Business: %s

IMPORTANT: Only use these exact component IDs in your response:
- hero-banner, hero-split, hero-video, hero-minimal
- product-grid, product-carousel, product-showcase, product-categories
- image-gallery, video-embed
- feature-list, icon-grid
- testimonials, reviews-grid, social-proof
- cta-banner, newsletter
- contact-info, about-section
- image-text, before-after, stats-counter
- spacer, divider

Generate a JSON configuration with this structure:
{
  "theme": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#f8fafc",
      "accent": "#10b981"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    }
  },
  "settings": {
    "currency": "USD",
    "language": "en",
    "timezone": "UTC",
    "allow_guest_checkout": true,
    "require_shipping": true,
    "tax_included": false,
    "tax_rate": 0.0,
    "shipping_rate": 5.0,
    "free_shipping_min": 50.0,
    "order_prefix": "ORD"
  },
  "components": [
    {
      "id": "hero-banner",
      "type": "hero-banner",
      "order": 1,
      "props": {
        "title": "Welcome to %s",
        "subtitle": "Your one-stop shop for quality products",
        "buttonText": "Shop Now",
        "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop"
      }
    },
    {
      "id": "feature-list",
      "type": "feature-list",
      "order": 2,
      "props": {
        "title": "Why Choose Us",
        "features": [
          {"title": "Quality Products", "description": "Premium selection"},
          {"title": "Fast Shipping", "description": "Quick delivery"},
          {"title": "24/7 Support", "description": "Always here to help"}
        ]
      }
    }
  ]
}

Keep it simple and professional. Use only the component IDs listed above. Return ONLY the JSON object, no markdown formatting, no code blocks, no explanations.
`, businessType, industry, description, description)

	// Call Gemini API
	response, err := ctrl.callGeminiAPI(geminiAPIKey, prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to call Gemini API: %v", err)
	}

	// Clean the response - remove markdown code blocks if present
	cleanResponse := response
	if strings.Contains(cleanResponse, "```json") {
		start := strings.Index(cleanResponse, "```json")
		end := strings.LastIndex(cleanResponse, "```")
		if start != -1 && end != -1 && end > start {
			cleanResponse = cleanResponse[start+7 : end]
		}
	} else if strings.Contains(cleanResponse, "```") {
		start := strings.Index(cleanResponse, "```")
		end := strings.LastIndex(cleanResponse, "```")
		if start != -1 && end != -1 && end > start {
			cleanResponse = cleanResponse[start+3 : end]
		}
	}

	// Trim whitespace
	cleanResponse = strings.TrimSpace(cleanResponse)

	// Parse the JSON response
	var aiConfig models.AIStoreConfig
	if err := json.Unmarshal([]byte(cleanResponse), &aiConfig); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v, response: %s", err, cleanResponse[:min(len(cleanResponse), 200)])
	}

	return &aiConfig, nil
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// callGeminiAPI makes a request to the Gemini API
func (ctrl *StoreController) callGeminiAPI(apiKey, prompt string) (string, error) {
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

	requestBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{
						"text": prompt,
					},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.7,
			"topK":            40,
			"topP":            0.95,
			"maxOutputTokens": 8192,
		},
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url+"?key="+apiKey, strings.NewReader(string(jsonBody)))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Gemini API returned status: %d", resp.StatusCode)
	}

	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	// Extract the generated text from the response
	candidates, ok := response["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "", fmt.Errorf("no candidates in Gemini response")
	}

	candidate, ok := candidates[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid candidate format")
	}

	content, ok := candidate["content"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid content format")
	}

	parts, ok := content["parts"].([]interface{})
	if !ok || len(parts) == 0 {
		return "", fmt.Errorf("no parts in content")
	}

	part, ok := parts[0].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid part format")
	}

	text, ok := part["text"].(string)
	if !ok {
		return "", fmt.Errorf("no text in part")
	}

	return text, nil
}

// Helper functions for type assertions
func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func getBool(m map[string]interface{}, key string) bool {
	if v, ok := m[key]; ok {
		if b, ok := v.(bool); ok {
			return b
		}
	}
	return false
}

func getInt(m map[string]interface{}, key string) int {
	if v, ok := m[key]; ok {
		switch t := v.(type) {
		case int:
			return t
		case float64:
			return int(t)
		}
	}
	return 0
}

func getMapKeys(m map[string]interface{}) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
