package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var (
	// Client is the MongoDB client
	Client *mongo.Client
	// Database is the MongoDB database
	Database *mongo.Database
)

// ConnectMongoDB establishes a connection to the MongoDB database
func ConnectMongoDB() (*mongo.Client, error) {
	// Get MongoDB URI from environment variable
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI environment variable not set")
	}

	// Set client options
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	Client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Check the connection
	if err := Client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	// Set the Database variable
	dbName := os.Getenv("MONGO_DB_NAME")
	if dbName == "" {
		dbName = "fintech_app" // Default database name
	}
	Database = Client.Database(dbName)

	log.Println("Connected to MongoDB!")
	return Client, nil
}

// GetCollection returns a MongoDB collection
func GetCollection(collectionName string) *mongo.Collection {
	return Database.Collection(collectionName)
} 