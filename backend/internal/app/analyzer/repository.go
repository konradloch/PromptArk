package analyzer

import (
	"context"
	"fmt"
	"prompt-analyzer/internal/entity"
	"prompt-analyzer/internal/platform/pagination"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	m *mongo.Database
}

func NewRepository(m *mongo.Database) *Repository {
	return &Repository{m: m}
}

func (r *Repository) CreateNewPromptOutput(ctx context.Context, output entity.PromptOutput) error {
	c := r.m.Collection("analyzer")
	_, err := c.InsertOne(ctx, output)
	if err != nil {
		return fmt.Errorf("cannot insert prompt output document")
	}
	return nil
}
func (r *Repository) GetFinalByCorrelationID(ctx context.Context, correlationID string) (*entity.PromptOutput, error) {
	c := r.m.Collection("analyzer")
	var result entity.PromptOutput
	filter := bson.D{{Key: "correlationId", Value: correlationID}, {Key: "outputId", Value: "final"}}
	err := c.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("cannot find prompt output by correlationID, err: %v", err)
	}
	return &result, nil
}

func (r *Repository) GetAllFiltered(ctx context.Context, f Filter) ([]CorrelationIDGrouped, int, error) {
	page, limit := pagination.GetPaginationParams(ctx)
	param := bson.M{}
	if f.PromptName != "" {
		param["promptName"] = f.PromptName
	}
	if f.GroupName != "" {
		param["groupName"] = f.GroupName
	}
	if f.PublisherIdentifier != "" {
		param["publisherIdentifier"] = f.PublisherIdentifier
	}
	if f.Status != "" {
		param["status"] = f.Status
	}
	if f.CorrelationID != "" {
		param["correlationId"] = f.CorrelationID
	}
	if !f.From.IsZero() {
		param["executionTime"] = bson.M{"$gte": f.From}
	}
	param["outputId"] = bson.M{"$ne": "final"}
	if !f.To.IsZero() {
		if param["executionTime"] != nil {
			param["executionTime"] = bson.M{"$gte": f.From, "$lte": f.To}
		} else {
			param["executionTime"] = bson.M{"$lte": f.To}
		}
	}
	agg := bson.A{
		//bson.D{{"$match", bson.D{{"deleted", false}}}},
		bson.D{{Key: "$match", Value: param}},
		bson.D{{"$sort", bson.D{{"executionTime", 1}}}},
		bson.D{
			{"$group",
				bson.D{
					{"_id", "$correlationId"},
					{"promptsOutputs", bson.D{{"$push", "$$ROOT"}}},
					{"groupName", bson.D{{"$first", "$groupName"}}},
					{"publicationName", bson.D{{"$first", "$publisherIdentifier"}}},
					{"startExecutionTime", bson.D{{"$min", "$executionTime"}}},
					{"endExecutionTime", bson.D{{"$max", "$executionTime"}}},
				},
			},
		},
		bson.D{{"$sort", bson.D{{"startExecutionTime", 1}}}},
	}
	rAgg := append(agg, bson.D{{Key: "$skip", Value: (page - 1) * limit}}, bson.D{{Key: "$limit", Value: limit}})
	c := r.m.Collection("analyzer")
	cur, err := c.Aggregate(ctx, rAgg)
	if err != nil {
		return nil, 0, fmt.Errorf("cannot fetch grouped analyzed docs, err: %v", err)
	}
	defer cur.Close(ctx)

	res := make([]CorrelationIDGrouped, 0)
	for cur.Next(ctx) {
		var result CorrelationIDGrouped
		err := cur.Decode(&result)
		if err != nil {
			return nil, 0, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, result)
	}

	if err := cur.Err(); err != nil {
		return nil, 0, fmt.Errorf("prompt cursor error, err: %v", err)
	}

	agg = append(agg, bson.D{{Key: "$count", Value: "total"}})
	cur, err = c.Aggregate(ctx, agg)
	if err != nil {
		return nil, 0, fmt.Errorf("cannot fetch grouped analyzed docs count, err: %v", err)
	}
	defer cur.Close(ctx)

	type countTotal struct {
		Total int `bson:"total" json:"total"`
	}
	var results []countTotal
	if err = cur.All(ctx, &results); err != nil {
		return nil, 0, fmt.Errorf("cannot parse count total, err: %v", err)
	}
	if len(results) == 0 {
		return res, 0, nil
	}
	return res, results[0].Total, nil
}

func (r *Repository) GetDistinctFilterOptions(ctx context.Context, filters string) ([]string, error) {
	c := r.m.Collection("analyzer")
	cur, err := c.Distinct(ctx, filters, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("cannot get distinct filter options, err: %v", err)
	}
	var res []string
	for _, dv := range cur {
		res = append(res, dv.(string))
	}
	return res, nil
}
