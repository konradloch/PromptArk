package statistics

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	m *mongo.Database
}

func NewRepository(m *mongo.Database) *Repository {
	return &Repository{m: m}
}

func (r *Repository) Save(ctx context.Context, statistic Statistic) error {
	c := r.m.Collection("statistics")
	_, err := c.InsertOne(ctx, statistic)
	if err != nil {
		return fmt.Errorf("cannot insert statistic document")
	}
	return nil
}

func (r *Repository) GetByNamesAndDuration(ctx context.Context, names []StatName, dur time.Duration) ([]Statistic, error) {
	filter := make(bson.M)
	if len(names) > 0 {
		filter["name"] = bson.M{"$in": names}
	}
	if dur > 0 {
		filter["createdAt"] = bson.M{"$gte": time.Now().Add(-dur)}
	}
	c := r.m.Collection("statistics")
	var aggr bson.A
	aggr = append(aggr, bson.D{{"$match", filter}})
	aggr = append(aggr, bson.D{
		{"$group",
			bson.D{
				{"_id", "$name"},
				{"value", bson.D{{"$sum", "$value"}}},
				{"name", bson.D{{"$first", "$name"}}},
				{"createdAt", bson.D{{"$last", "$createdAt"}}},
			},
		},
	})
	cur, err := c.Aggregate(ctx, aggr)
	if err != nil {
		return nil, fmt.Errorf("cannot aggregate statistics, err: %v", err)
	}
	defer cur.Close(ctx)
	var res []Statistic
	for cur.Next(ctx) {
		var result Statistic
		err := cur.Decode(&result)
		if err != nil {
			return nil, fmt.Errorf("cannot parse statistic, err: %v", err)
		}
		res = append(res, result)
	}
	if err := cur.Err(); err != nil {
		return nil, fmt.Errorf("statistic cursor error, err: %v", err)
	}
	return res, nil
}
