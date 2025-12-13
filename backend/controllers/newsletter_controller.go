package controllers

import (
	"net/http"
	"strconv"

	"storemaker-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type NewsletterController struct {
	db *gorm.DB
}

func NewNewsletterController(db *gorm.DB) *NewsletterController {
	return &NewsletterController{db: db}
}

// Subscribe to newsletter for a specific store
func (nc *NewsletterController) Subscribe(c *gin.Context) {
	storeSlug := c.Param("slug")

	// Get store by slug
	var store models.Store
	if err := nc.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	var req models.NewsletterSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Check if email already exists for this store
	var existingSubscription models.NewsletterSubscription
	if err := nc.db.Where("store_id = ? AND email = ?", store.ID, req.Email).First(&existingSubscription).Error; err == nil {
		// Email already exists, check if it's active
		if existingSubscription.Active {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already subscribed"})
			return
		} else {
			// Reactivate subscription
			existingSubscription.Active = true
			if err := nc.db.Save(&existingSubscription).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reactivate subscription"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Subscription reactivated successfully"})
			return
		}
	}

	// Create new subscription
	subscription := models.NewsletterSubscription{
		StoreID: store.ID,
		Email:   req.Email,
		Active:  true,
	}

	if err := nc.db.Create(&subscription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Successfully subscribed to newsletter"})
}

// Unsubscribe from newsletter
func (nc *NewsletterController) Unsubscribe(c *gin.Context) {
	storeSlug := c.Param("slug")
	email := c.Query("email")

	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email parameter is required"})
		return
	}

	// Get store by slug
	var store models.Store
	if err := nc.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	// Find and deactivate subscription
	var subscription models.NewsletterSubscription
	if err := nc.db.Where("store_id = ? AND email = ?", store.ID, email).First(&subscription).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	subscription.Active = false
	if err := nc.db.Save(&subscription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unsubscribe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully unsubscribed from newsletter"})
}

// Get newsletter subscriptions for a store (admin only)
func (nc *NewsletterController) GetSubscriptions(c *gin.Context) {
	storeIDStr := c.Param("storeId")
	storeID, err := strconv.ParseUint(storeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var subscriptions []models.NewsletterSubscription
	if err := nc.db.Where("store_id = ? AND active = ?", storeID, true).Find(&subscriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}

	var responses []models.NewsletterSubscriptionResponse
	for _, sub := range subscriptions {
		responses = append(responses, models.NewsletterSubscriptionResponse{
			ID:        sub.ID,
			Email:     sub.Email,
			Active:    sub.Active,
			CreatedAt: sub.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"subscriptions": responses})
}

// Delete newsletter subscription (admin only)
func (nc *NewsletterController) DeleteSubscription(c *gin.Context) {
	storeIDStr := c.Param("storeId")
	subscriptionIDStr := c.Param("subscriptionId")

	storeID, err := strconv.ParseUint(storeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	subscriptionID, err := strconv.ParseUint(subscriptionIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription ID"})
		return
	}

	var subscription models.NewsletterSubscription
	if err := nc.db.Where("id = ? AND store_id = ?", subscriptionID, storeID).First(&subscription).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}

	if err := nc.db.Delete(&subscription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription deleted successfully"})
}
