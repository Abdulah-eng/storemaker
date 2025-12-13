package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderController struct {
	db *gorm.DB
}

func NewOrderController(db *gorm.DB) *OrderController {
	return &OrderController{db: db}
}

func (ctrl *OrderController) CreateOrder(c *gin.Context) {
	// TODO: Implement create order (public)
	c.JSON(http.StatusOK, gin.H{"message": "Create order - TODO"})
}

func (ctrl *OrderController) GetOrderByNumber(c *gin.Context) {
	// TODO: Implement get order by order number (public)
	c.JSON(http.StatusOK, gin.H{"message": "Get order by number - TODO"})
}

func (ctrl *OrderController) GetStoreOrders(c *gin.Context) {
	// TODO: Implement get store orders
	c.JSON(http.StatusOK, gin.H{"message": "Get store orders - TODO"})
}

func (ctrl *OrderController) UpdateOrder(c *gin.Context) {
	// TODO: Implement update order
	c.JSON(http.StatusOK, gin.H{"message": "Update order - TODO"})
}
