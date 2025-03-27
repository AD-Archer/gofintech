package api

import (
	"github.com/gin-gonic/gin"
)

// setupRoutes configures the routes for the application
func setupRoutes(router *gin.Engine) {
	// Test route to verify template loading
	router.GET("/test", func(c *gin.Context) {
		c.HTML(200, "index.html", gin.H{
			"title":         "Test Page",
			"active":        "dashboard",
			"showAddButton": true,
		})
	})

	// HTML page routes
	router.GET("/", homeHandler)
	router.GET("/transactions", transactionsPageHandler)

	// API routes
	api := router.Group("/api")
	{
		// Transaction API endpoints
		transactions := api.Group("/transactions")
		{
			transactions.GET("", getTransactionsHandler)
			transactions.GET("/:id", getTransactionHandler)
			transactions.POST("", createTransactionHandler)
			transactions.PUT("/:id", updateTransactionHandler)
			transactions.DELETE("/:id", deleteTransactionHandler)
		}
	}
}

// homeHandler renders the home page
func homeHandler(c *gin.Context) {
	c.HTML(200, "index.html", gin.H{
		"title":         "Dashboard Overview",
		"active":        "dashboard",
		"showAddButton": true,
	})
}

// transactionsPageHandler renders the transactions page
func transactionsPageHandler(c *gin.Context) {
	c.HTML(200, "transactions.html", gin.H{
		"title":         "Transactions | Roommate Finances",
		"active":        "transactions",
		"showAddButton": true,
	})
}
