package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct {
	db *gorm.DB
}

func NewUserController(db *gorm.DB) *UserController {
	return &UserController{db: db}
}

func (ctrl *UserController) GetProfile(c *gin.Context) {
	// TODO: Implement get user profile
	c.JSON(http.StatusOK, gin.H{"message": "Get profile - TODO"})
}

func (ctrl *UserController) UpdateProfile(c *gin.Context) {
	// TODO: Implement update user profile
	c.JSON(http.StatusOK, gin.H{"message": "Update profile - TODO"})
}

func (ctrl *UserController) DeleteProfile(c *gin.Context) {
	// TODO: Implement delete user profile
	c.JSON(http.StatusOK, gin.H{"message": "Delete profile - TODO"})
}

func (ctrl *UserController) GetAllUsers(c *gin.Context) {
	// TODO: Implement get all users (admin only)
	c.JSON(http.StatusOK, gin.H{"message": "Get all users - TODO"})
}

func (ctrl *UserController) UpdateUserStatus(c *gin.Context) {
	// TODO: Implement update user status (admin only)
	c.JSON(http.StatusOK, gin.H{"message": "Update user status - TODO"})
}
