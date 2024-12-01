package group

import (
	"context"
	"errors"
	"fmt"
	"prompt-analyzer/internal/entity"
	"prompt-analyzer/internal/platform/pagination"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository struct {
	m *mongo.Database
}

func NewRepository(m *mongo.Database) *Repository {
	return &Repository{m: m}
}

type document struct {
	ID          string    `bson:"_id,omitempty"`
	Name        string    `bson:"name,omitempty"`
	Description string    `bson:"description,omitempty"`
	CreatedAt   time.Time `bson:"created_at,omitempty"`
	Disabled    bool      `bson:"disabled"`
}

func (r *Repository) Save(ctx context.Context, group entity.Group) error {
	c := r.m.Collection("group")
	d := document{
		ID:          group.ID,
		Name:        group.Name,
		Description: group.Description,
		CreatedAt:   group.TimeCreation,
		Disabled:    false,
	}
	_, err := c.InsertOne(ctx, d)
	if err != nil {
		return fmt.Errorf("cannot insert group document")
	}
	return nil
}

func (r *Repository) CheckIfNameExists(ctx context.Context, name string) (bool, error) {
	c := r.m.Collection("group")
	filter := bson.D{{Key: "name", Value: name}, {Key: "disabled", Value: false}}
	count, err := c.CountDocuments(ctx, filter)
	if err != nil {
		return false, fmt.Errorf("cannot check if name exists, err: %v", err)
	}
	return count > 0, nil
}

func (r *Repository) SoftDeleteByID(ctx context.Context, ID string) error {
	c := r.m.Collection("group")
	oID, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		return fmt.Errorf("cannot delete group by ID, err = %v", err)
	}
	filter := bson.D{{Key: "_id", Value: oID}}
	_, err = c.UpdateOne(ctx, filter, bson.D{{Key: "$set", Value: bson.D{{Key: "disabled", Value: true}}}})
	return err
}

func (r *Repository) GetAll(ctx context.Context, name string) ([]entity.Group, int, error) {
	page, limit := pagination.GetPaginationParams(ctx)
	c := r.m.Collection("group")
	param := bson.M{
		"disabled": bson.M{"$ne": true},
	}
	if name != "" {
		param = bson.M{
			"name":     bson.M{"$regex": name, "$options": "i"},
			"disabled": bson.M{"$ne": true},
		}
	}
	cur, err := c.Find(ctx, param, options.Find().
		SetSkip(limit*(page-1)).
		SetLimit(limit).
		SetSort(primitive.D{{
			Key:   "created_at",
			Value: -1,
		}}))
	if err != nil {
		return nil, 0, fmt.Errorf("cannot find all groups, err: %v", err)
	}
	defer cur.Close(ctx)

	res := make([]entity.Group, 0)
	for cur.Next(ctx) {
		var result document
		err := cur.Decode(&result)
		if err != nil {
			return nil, 0, fmt.Errorf("cannot parse group, err: %v", err)
		}
		res = append(res, entity.Group{
			ID:           result.ID,
			Name:         result.Name,
			Description:  result.Description,
			TimeCreation: result.CreatedAt,
		})
	}

	if err := cur.Err(); err != nil {
		return nil, 0, fmt.Errorf("group cursor error, err: %v", err)
	}

	ctr, err := c.CountDocuments(ctx, param)
	if err != nil {
		return nil, 0, fmt.Errorf("cannot count documents, err: %v", err)
	}
	return res, int(ctr), nil
}

func (r *Repository) GetByID(ctx context.Context, ID string) (*entity.Group, error) {
	c := r.m.Collection("group")
	id, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		return nil, fmt.Errorf("cannot parse ID to objectID, err: %v", err)
	}
	var result document
	filter := bson.D{{Key: "_id", Value: id}}
	err = c.FindOne(ctx, filter).Decode(&result)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, entity.ErrNotFound
	} else if err != nil {
		return nil, fmt.Errorf("cannot find group by ID, err: %v", err)
	}
	return &entity.Group{
		ID:           result.ID,
		Name:         result.Name,
		Description:  result.Description,
		TimeCreation: result.CreatedAt,
	}, nil
}
