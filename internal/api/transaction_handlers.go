package api

import (
	"context"
	"net/http"
	"time"

	"github.com/adarcher21/fintech-app/internal/database"
	"github.com/adarcher21/fintech-app/internal/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	transactionCollection = "transactions"
)

// getTransactionsHandler retrieves all transactions
func getTransactionsHandler(c *gin.Context) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get transactions collection
	collection := database.GetCollection(transactionCollection)

	// Set options to sort by date descending
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "date", Value: -1}})

	// Query database
	cursor, err := collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving transactions"})
		return
	}
	defer cursor.Close(ctx)

	// Parse results
	var transactions []models.Transaction
	if err = cursor.All(ctx, &transactions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing transactions"})
		return
	}

	// Return empty array if no transactions found
	if len(transactions) == 0 {
		transactions = []models.Transaction{}
	}

	c.JSON(http.StatusOK, transactions)
}

// getTransactionHandler retrieves a single transaction by ID
func getTransactionHandler(c *gin.Context) {
	// Get ID from URL parameter
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get transactions collection
	collection := database.GetCollection(transactionCollection)

	// Find transaction
	var transaction models.Transaction
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&transaction)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	c.JSON(http.StatusOK, transaction)
}

// createTransactionHandler creates a new transaction
func createTransactionHandler(c *gin.Context) {
	// Parse request body
	var input models.TransactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date
	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Create transaction
	now := time.Now()
	transaction := models.Transaction{
		Amount:      input.Amount,
		Description: input.Description,
		Category:    input.Category,
		Type:        input.Type,
		Date:        date,
		CreatedBy:   input.CreatedBy,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get transactions collection
	collection := database.GetCollection(transactionCollection)

	// Insert transaction
	result, err := collection.InsertOne(ctx, transaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating transaction"})
		return
	}

	// Get ID of inserted document
	objectID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving inserted ID"})
		return
	}
	transaction.ID = objectID

	c.JSON(http.StatusCreated, transaction)
}

// updateTransactionHandler updates an existing transaction
func updateTransactionHandler(c *gin.Context) {
	// Get ID from URL parameter
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Parse request body
	var input models.TransactionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date
	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Create update document
	updateDoc := bson.M{
		"$set": bson.M{
			"amount":      input.Amount,
			"description": input.Description,
			"category":    input.Category,
			"type":        input.Type,
			"date":        date,
			"createdBy":   input.CreatedBy,
			"updatedAt":   time.Now(),
		},
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get transactions collection
	collection := database.GetCollection(transactionCollection)

	// Update transaction
	result, err := collection.UpdateOne(ctx, bson.M{"_id": objID}, updateDoc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating transaction"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	// Return updated transaction
	var updatedTransaction models.Transaction
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&updatedTransaction)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving updated transaction"})
		return
	}

	c.JSON(http.StatusOK, updatedTransaction)
}

// deleteTransactionHandler deletes a transaction
func deleteTransactionHandler(c *gin.Context) {
	// Get ID from URL parameter
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get transactions collection
	collection := database.GetCollection(transactionCollection)

	// Delete transaction
	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting transaction"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}
