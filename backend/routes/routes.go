package routes

import (
	"storemaker-backend/controllers"
	"storemaker-backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	// Initialize controllers
	authController := controllers.NewAuthController(db)
	userController := controllers.NewUserController(db)
	storeController := controllers.NewStoreController(db)
	templateController := controllers.NewTemplateController(db)
	productController := controllers.NewProductController(db)
	orderController := controllers.NewOrderController(db)
	customizationController := controllers.NewCustomizationController(db)
	newsletterController := controllers.NewNewsletterController(db)
	fileController := controllers.NewFileController(db)

	// API v1 routes
	v1 := router.Group("/api/v1")

	// Public routes
	public := v1.Group("")
	{
		// Auth routes
		public.POST("/auth/register", authController.Register)
		public.POST("/auth/login", authController.Login)
		public.POST("/auth/refresh", authController.RefreshToken)

		// Template routes
		public.GET("/templates", templateController.GetPublicTemplates)
		public.GET("/templates/:id", templateController.GetTemplate)

		// Public store routes
		public.GET("/stores/:slug", storeController.GetStoreBySlug)
		public.GET("/stores/:slug/layout", customizationController.GetPublicStoreLayout)
		public.GET("/stores/:slug/pages", customizationController.GetPublicStorePages)
		public.GET("/stores/:slug/pages/:pageSlug", customizationController.GetPublicStorePage)
		public.GET("/stores/:slug/pages/:pageSlug/layout", customizationController.GetPublicPageLayout)
		public.GET("/stores/:slug/products", productController.GetStoreProducts)
		public.GET("/stores/:slug/products/:productSlug", productController.GetStoreProduct)

		// Newsletter routes
		public.POST("/stores/:slug/newsletter/subscribe", newsletterController.Subscribe)
		public.GET("/stores/:slug/newsletter/unsubscribe", newsletterController.Unsubscribe)

		// Order routes
		public.POST("/stores/:slug/orders", orderController.CreateOrder)
		public.GET("/stores/:slug/orders/:orderNumber", orderController.GetOrderByNumber)
	}

	// Protected routes
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		protected.GET("/user/profile", userController.GetProfile)
		protected.PUT("/user/profile", userController.UpdateProfile)
		protected.DELETE("/user/profile", userController.DeleteProfile)

		// Store management (merchant only) - using /manage prefix to avoid conflicts
		storeRoutes := protected.Group("/manage/stores")
		storeRoutes.Use(middleware.MerchantMiddleware())
		{
			storeRoutes.GET("", storeController.GetUserStores)
			storeRoutes.POST("", storeController.CreateStore)
			storeRoutes.POST("/ai", storeController.CreateStoreWithAI)
			storeRoutes.GET("/:id", storeController.GetStore)
			storeRoutes.PUT("/:id", storeController.UpdateStore)
			storeRoutes.DELETE("/:id", storeController.DeleteStore)

			// File upload routes (logo & favicon)
			storeRoutes.POST("/:id/logo", fileController.UploadStoreLogo)
			storeRoutes.POST("/:id/favicon", fileController.UploadStoreFavicon)

			// Store settings
			storeRoutes.GET("/:id/settings", customizationController.GetStoreSettings)
			storeRoutes.PUT("/:id/settings", customizationController.UpdateStoreSettings)

			// Store theme
			storeRoutes.GET("/:id/theme", customizationController.GetStoreTheme)
			storeRoutes.PUT("/:id/theme", customizationController.UpdateStoreTheme)

			// Store layout
			storeRoutes.GET("/:id/layout", customizationController.GetStoreLayout)
			storeRoutes.POST("/:id/layout", customizationController.SaveStoreLayout)

			// Store pages
			storeRoutes.GET("/:id/pages", customizationController.GetPages)
			storeRoutes.POST("/:id/pages", customizationController.CreatePage)
			storeRoutes.PUT("/:id/pages/:pageId", customizationController.UpdatePage)
			storeRoutes.DELETE("/:id/pages/:pageId", customizationController.DeletePage)

			// Page layouts
			storeRoutes.GET("/:id/pages/:pageId/layout", customizationController.GetPageLayout)
			storeRoutes.POST("/:id/pages/:pageId/layout", customizationController.SavePageLayout)

			// Store products
			storeRoutes.GET("/:id/products", productController.GetProducts)
			storeRoutes.POST("/:id/products", productController.CreateProduct)
			storeRoutes.PUT("/:id/products/:productId", productController.UpdateProduct)
			storeRoutes.DELETE("/:id/products/:productId", productController.DeleteProduct)

			// Store orders
			storeRoutes.GET("/:id/orders", orderController.GetStoreOrders)
			storeRoutes.PUT("/:id/orders/:orderId", orderController.UpdateOrder)

			// Store newsletter
			storeRoutes.GET("/:id/newsletter/subscriptions", newsletterController.GetSubscriptions)
			storeRoutes.DELETE("/:id/newsletter/subscriptions/:subscriptionId", newsletterController.DeleteSubscription)
		}
	}

	// Admin routes (admin only)
	admin := v1.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/stores", storeController.GetAllStores)
		admin.PUT("/stores/:id/status", storeController.UpdateStoreStatus)
		admin.GET("/analytics", storeController.GetSystemAnalytics)

		// Admin template management
		admin.GET("/templates", templateController.GetAllTemplates)
		admin.GET("/templates/:id", templateController.GetTemplateAdmin)
		admin.POST("/templates", templateController.CreateTemplate)
		admin.PUT("/templates/:id", templateController.UpdateTemplate)
		admin.DELETE("/templates/:id", templateController.DeleteTemplate)
	}
}
