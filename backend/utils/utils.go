package utils

import (
	"crypto/rand"
	"fmt"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// GetJWTSecret returns the JWT secret key
func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-super-secret-jwt-key-change-this-in-production"
	}
	return []byte(secret)
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// CheckPassword compares a hashed password with a plain text password
func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// GenerateSlug creates a URL-friendly slug from a string
func GenerateSlug(text string) string {
	// Convert to lowercase
	slug := strings.ToLower(text)

	// Replace spaces with hyphens
	slug = regexp.MustCompile(`\s+`).ReplaceAllString(slug, "-")

	// Remove special characters except hyphens
	slug = regexp.MustCompile(`[^a-z0-9\-]`).ReplaceAllString(slug, "")

	// Remove multiple consecutive hyphens
	slug = regexp.MustCompile(`-+`).ReplaceAllString(slug, "-")

	// Remove leading and trailing hyphens
	slug = strings.Trim(slug, "-")

	return slug
}

// GenerateUniqueSlug creates a unique slug by appending numbers if needed
func GenerateUniqueSlug(baseSlug string, checkFunc func(string) bool) string {
	slug := baseSlug
	counter := 1

	for checkFunc(slug) {
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}

	return slug
}

// GenerateOrderNumber generates a unique order number
func GenerateOrderNumber() string {
	now := time.Now()
	return fmt.Sprintf("ORD-%d%02d%02d-%d",
		now.Year(), now.Month(), now.Day(), now.Unix())
}

// GenerateRandomString generates a random string of specified length
func GenerateRandomString(length int) (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		randomByte := make([]byte, 1)
		_, err := rand.Read(randomByte)
		if err != nil {
			return "", err
		}
		b[i] = charset[randomByte[0]%byte(len(charset))]
	}
	return string(b), nil
}

// ValidateEmail validates email format
func ValidateEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// GetEnv gets an environment variable with a default value
func GetEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// ValidatePassword validates password requirements
func ValidatePassword(password string) error {
	if len(password) < 6 {
		return fmt.Errorf("password must be at least 6 characters long")
	}
	return nil
}

// FormatPrice formats a price to display with currency
func FormatPrice(price float64, currency string) string {
	switch currency {
	case "USD":
		return fmt.Sprintf("$%.2f", price)
	case "EUR":
		return fmt.Sprintf("€%.2f", price)
	case "GBP":
		return fmt.Sprintf("£%.2f", price)
	default:
		return fmt.Sprintf("%.2f %s", price, currency)
	}
}

// ParsePaginationParams parses pagination parameters from query string
func ParsePaginationParams(page, limit string) (int, int) {
	pageNum := 1
	limitNum := 20

	if page != "" {
		if p, err := fmt.Sscanf(page, "%d", &pageNum); err != nil || p != 1 || pageNum < 1 {
			pageNum = 1
		}
	}

	if limit != "" {
		if l, err := fmt.Sscanf(limit, "%d", &limitNum); err != nil || l != 1 || limitNum < 1 || limitNum > 100 {
			limitNum = 20
		}
	}

	return pageNum, limitNum
}

// CalculateOffset calculates database offset for pagination
func CalculateOffset(page, limit int) int {
	return (page - 1) * limit
}

// ParseJWTToken parses and validates a JWT token
func ParseJWTToken(tokenString string, claims jwt.Claims) (*jwt.Token, error) {
	return jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return GetJWTSecret(), nil
	})
}
