package controllers

import (
	"net/http"
	"strconv"

	"storemaker-backend/models"
	"storemaker-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductController struct {
	db *gorm.DB
}

func NewProductController(db *gorm.DB) *ProductController {
	return &ProductController{db: db}
}

// Public endpoints - Get products by store slug
func (ctrl *ProductController) GetStoreProducts(c *gin.Context) {
	storeSlug := c.Param("slug")

	var store models.Store
	if err := ctrl.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	var products []models.Product
	query := ctrl.db.Where("store_id = ? AND status IN (?, ?)", store.ID, models.ProductStatusActive, models.ProductStatusDraft)

	// Pagination
	page := 1
	limit := 20
	if p, err := strconv.Atoi(c.DefaultQuery("page", "1")); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(c.DefaultQuery("limit", "20")); err == nil && l > 0 && l <= 100 {
		limit = l
	}

	offset := (page - 1) * limit

	if err := query.Offset(offset).Limit(limit).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (ctrl *ProductController) GetStoreProduct(c *gin.Context) {
	storeSlug := c.Param("slug")
	productSlug := c.Param("productSlug")

	var store models.Store
	if err := ctrl.db.Where("slug = ?", storeSlug).First(&store).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Store not found"})
		return
	}

	var product models.Product
	if err := ctrl.db.Where("store_id = ? AND slug = ? AND status IN (?, ?)", store.ID, productSlug, models.ProductStatusActive, models.ProductStatusDraft).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// Management endpoints - CRUD operations for store owners
func (ctrl *ProductController) GetProducts(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var products []models.Product
	query := ctrl.db.Where("store_id = ?", storeID)

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Pagination
	page := 1
	limit := 20
	if p, err := strconv.Atoi(c.DefaultQuery("page", "1")); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(c.DefaultQuery("limit", "20")); err == nil && l > 0 && l <= 100 {
		limit = l
	}

	offset := (page - 1) * limit

	if err := query.Offset(offset).Limit(limit).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (ctrl *ProductController) CreateProduct(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	var req models.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate slug from name
	baseSlug := utils.GenerateSlug(req.Name)
	slug := utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
		var count int64
		ctrl.db.Model(&models.Product{}).Where("store_id = ? AND slug = ?", storeID, s).Count(&count)
		return count > 0
	})

	product := models.Product{
		Name:         req.Name,
		Slug:         slug,
		Description:  req.Description,
		ShortDesc:    req.ShortDesc,
		Price:        req.Price,
		ComparePrice: req.ComparePrice,
		SKU:          req.SKU,
		Images:       req.Images,
		Variants:     req.Variants,
		Status:       models.ProductStatusDraft,
		Stock:        req.Stock,
		Weight:       req.Weight,
		IsDigital:    req.IsDigital,
		SeoTitle:     req.SeoTitle,
		SeoDesc:      req.SeoDesc,
		StoreID:      uint(storeID),
		CategoryID:   req.CategoryID,
	}

	if err := ctrl.db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

func (ctrl *ProductController) UpdateProduct(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	productID, err := strconv.ParseUint(c.Param("productId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var req models.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find existing product
	var product models.Product
	if err := ctrl.db.Where("id = ? AND store_id = ?", productID, storeID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Update slug if name changed
	if req.Name != "" && req.Name != product.Name {
		baseSlug := utils.GenerateSlug(req.Name)
		req.Slug = utils.GenerateUniqueSlug(baseSlug, func(s string) bool {
			var count int64
			ctrl.db.Model(&models.Product{}).Where("store_id = ? AND slug = ? AND id != ?", storeID, s, productID).Count(&count)
			return count > 0
		})
	}

	if err := ctrl.db.Model(&product).Updates(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (ctrl *ProductController) DeleteProduct(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}

	productID, err := strconv.ParseUint(c.Param("productId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	if err := ctrl.db.Where("id = ? AND store_id = ?", productID, storeID).Delete(&models.Product{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
