package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FileController struct {
	db *gorm.DB
}

func NewFileController(db *gorm.DB) *FileController {
	return &FileController{db: db}
}

func ensureUploadDir() (string, error) {
	dir := "uploads"
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	return dir, nil
}

func saveUploadedFile(c *gin.Context, formKey string, prefix string) (string, error) {
	file, err := c.FormFile(formKey)
	if err != nil {
		return "", err
	}
	dir, err := ensureUploadDir()
	if err != nil {
		return "", err
	}
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s_%d%s", prefix, time.Now().UnixNano(), ext)
	fullPath := filepath.Join(dir, filename)
	if err := c.SaveUploadedFile(file, fullPath); err != nil {
		return "", err
	}
	// Absolute URL for frontend use
	serverURL := os.Getenv("SERVER_URL")
	if serverURL == "" {
		scheme := "http"
		if c.Request.TLS != nil {
			scheme = "https"
		}
		serverURL = fmt.Sprintf("%s://%s", scheme, c.Request.Host)
	}
	return fmt.Sprintf("%s/uploads/%s", serverURL, filename), nil
}

// POST /manage/stores/:id/logo multipart/form-data: file
func (fc *FileController) UploadStoreLogo(c *gin.Context) {
	if _, err := strconv.ParseUint(c.Param("id"), 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}
	url, err := saveUploadedFile(c, "file", "logo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}

// POST /manage/stores/:id/favicon multipart/form-data: file
func (fc *FileController) UploadStoreFavicon(c *gin.Context) {
	if _, err := strconv.ParseUint(c.Param("id"), 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid store ID"})
		return
	}
	url, err := saveUploadedFile(c, "file", "favicon")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}
