package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Transaction represents a financial transaction in the fintech app
type Transaction struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Amount      float64            `json:"amount" bson:"amount"`
	Description string             `json:"description" bson:"description"`
	Category    string             `json:"category" bson:"category"`
	Type        string             `json:"type" bson:"type"` // "income" or "expense"
	Date        time.Time          `json:"date" bson:"date"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

// TransactionInput represents the data required to create a new transaction
type TransactionInput struct {
	Amount      float64 `json:"amount" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Category    string  `json:"category" binding:"required"`
	Type        string  `json:"type" binding:"required,oneof=income expense"`
	Date        string  `json:"date" binding:"required"` // Format: "2006-01-02"
} 