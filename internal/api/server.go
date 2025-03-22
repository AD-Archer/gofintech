package api

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// Server represents the API server
type Server struct {
	router *gin.Engine
	httpServer *http.Server
}

// NewServer creates a new API server
func NewServer() *Server {
	router := gin.Default()
	
	// Enable CORS
	router.Use(corsMiddleware())
	
	// Serve static files
	router.Static("/static", "./static")
	
	// Load HTML templates
	router.LoadHTMLGlob("templates/*")
	
	// Setup routes
	setupRoutes(router)
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port
	}
	
	return &Server{
		router: router,
		httpServer: &http.Server{
			Addr:    ":" + port,
			Handler: router,
		},
	}
}

// Start starts the API server
func (s *Server) Start() error {
	log.Printf("Server starting on port %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the API server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

// corsMiddleware adds CORS headers to responses
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
} 