package output

import (
	"context"
	"errors"
	"fmt"
	"prompt-analyzer/internal/entity"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	m *mongo.Database
}

func NewRepository(m *mongo.Database) *Repository {
	return &Repository{m: m}
}

func (r *Repository) Save(ctx context.Context, prompt *entity.PromptParsedOutput) (string, error) {
	c := r.m.Collection("output")
	ins, err := c.InsertOne(ctx, prompt)
	if err != nil {
		return "", fmt.Errorf("cannot insert prompt document")
	}
	return ins.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (r *Repository) GetByID(ctx context.Context, ID string) (*entity.PromptParsedOutput, error) {
	c := r.m.Collection("output")
	id, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		return nil, fmt.Errorf("cannot parse ID to objectID, err: %v", err)
	}
	var result entity.PromptParsedOutput
	filter := bson.D{{Key: "_id", Value: id}}
	err = c.FindOne(ctx, filter).Decode(&result)
	if err != nil && errors.Is(err, mongo.ErrNoDocuments) {
		return nil, entity.ErrNotFound
	} else if err != nil {
		return nil, fmt.Errorf("cannot find prompt by ID, err: %v", err)
	}
	return &result, nil
}
