package publication

import (
	"context"
	"errors"
	"fmt"
	"prompt-analyzer/internal/entity"

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

func (r *Repository) AddAll(ctx context.Context, pps []entity.PublishedPrompt) error {
	c := r.m.Collection("published")
	items := make([]interface{}, len(pps))
	for n, p := range pps {
		items[n] = p
	}
	_, err := c.InsertMany(ctx, items)
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetAllPublishedGrouped(ctx context.Context, search string) ([]entity.PublishedGroup, int, error) {
	agg := bson.A{
		bson.D{{"$match", bson.D{{"deleted", false}}}},
		bson.D{{"$match", bson.D{{"publishIdentifier", bson.D{{"$regex", search}, {"$options", "i"}}}}}},
		bson.D{{"$sort", bson.D{{"promptId", 1}}}},
		bson.D{
			{"$group",
				bson.D{
					{"_id", "$publishIdentifier"},
					{"prompts", bson.D{{"$push", "$$ROOT"}}},
					{"groupId", bson.D{{"$first", "$groupId"}}},
					{"groupName", bson.D{{"$first", "$groupName"}}},
					{"publishIdentifier", bson.D{{"$first", "$publishIdentifier"}}},
					{"disabled", bson.D{{"$max", "$disabled"}}},
					{"devMode", bson.D{{"$max", "$devMode"}}},
					{"publishedAt", bson.D{{"$last", "$publishedAt"}}},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "abtest"},
					{"localField", "publishIdentifier"},
					{"foreignField", "publicationIdentifier"},
					{"as", "result"},
				},
			},
		},
		bson.D{
			{"$addFields",
				bson.D{
					{"abTestEnabled",
						bson.D{
							{"$cond",
								bson.A{
									bson.D{{"$size", "$result"}},
									true,
									false,
								},
							},
						},
					},
				},
			},
		},
		bson.D{{"$sort", bson.D{{"publishedAt", 1}}}},
	}
	c := r.m.Collection("published")
	cur, err := c.Aggregate(ctx, agg)
	if err != nil {
		return nil, 0, fmt.Errorf("cannot fetch grouped published prompts, err: %v", err)
	}
	defer cur.Close(ctx)

	res := make([]entity.PublishedGroup, 0)
	for cur.Next(ctx) {
		var result entity.PublishedGroup
		err := cur.Decode(&result)
		if err != nil {
			return nil, 0, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, result)
	}

	if err := cur.Err(); err != nil {
		return nil, 0, fmt.Errorf("prompt cursor error, err: %v", err)
	}

	agg = append(agg, bson.D{{"$count", "total"}})
	cur, err = c.Aggregate(ctx, agg)
	if err != nil {
		return nil, 0, fmt.Errorf("cannot fetch grouped published prompts count, err: %v", err)
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

func (r *Repository) DeleteByGroupID(ctx context.Context, groupID string) error {
	c := r.m.Collection("published")
	_, err := c.DeleteMany(ctx, bson.D{{"groupId", groupID}})
	if err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetByPublishIdentifierAndPromptName(ctx context.Context, pubID, promptName string) (*entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	var result entity.PublishedPrompt
	filter := bson.D{{"name", promptName}, {"publishIdentifier", pubID}}
	opts := options.FindOne().SetSort(bson.D{{"publishedAt", -1}})
	err := c.FindOne(ctx, filter, opts).Decode(&result)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("cannot find prompt by pubID and promptName, err: %v", err)
	}
	return &result, nil
}

func (r *Repository) GetByPublishIdentifierAndGroupName(ctx context.Context, pubID, groupName string) (*entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	var result entity.PublishedPrompt
	filter := bson.D{{"groupName", groupName}, {"publishIdentifier", pubID}}
	opts := options.FindOne().SetSort(bson.D{{"publishedAt", -1}})
	err := c.FindOne(ctx, filter, opts).Decode(&result)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("cannot find prompt by pubID and promptName, err: %v", err)
	}
	return &result, nil
}

func (r *Repository) GetByPublishIdentifier(ctx context.Context, pubID string) ([]entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	var result []entity.PublishedPrompt
	filter := bson.D{{"publishIdentifier", pubID}, {"deleted", false}}
	cur, err := c.Find(ctx, filter)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("cannot find prompt by pubID and promptName, err: %v", err)
	}
	cur.All(ctx, &result)
	return result, nil
}

func (r *Repository) GetByGroupIDAndVersionID(ctx context.Context, gID, vID string) ([]entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	filter := bson.D{{Key: "groupId", Value: gID}, {Key: "versionId", Value: vID}}
	cur, err := c.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("cannot fetch published prompts by group ID, err: %v", err)
	}
	res := make([]entity.PublishedPrompt, 0)
	for cur.Next(ctx) {
		var result entity.PublishedPrompt
		err := cur.Decode(&result)
		if err != nil {
			return nil, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, result)
	}

	if err := cur.Err(); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, entity.ErrNotFound
		}
		return nil, fmt.Errorf("prompt cursor error, err: %v", err)
	}
	return res, nil
}

func (r *Repository) GetByGroupIDAndVersionIDAndPromptID(ctx context.Context, gID, vID, pID string) (*entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	filter := bson.D{{Key: "groupName", Value: gID}, {Key: "publishIdentifier", Value: vID}, {Key: "name", Value: pID}, {Key: "deleted", Value: false}}
	res := c.FindOne(ctx, filter)
	if res.Err() != nil {
		if res.Err() == mongo.ErrNoDocuments {
			return nil, entity.ErrNotFound
		}
		return nil, fmt.Errorf("cannot fetch published prompts by group ID, err: %v", res.Err())
	}
	var result entity.PublishedPrompt
	err := res.Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("cannot parse prompt root, err: %v", err)
	}
	return &result, nil
}

func (r *Repository) GetByGroupID(ctx context.Context, gID string) ([]entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	filter := bson.D{{"groupId", gID}}
	cur, err := c.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("cannot fetch published prompts by group ID, err: %v", err)
	}
	res := make([]entity.PublishedPrompt, 0)
	for cur.Next(ctx) {
		var result entity.PublishedPrompt
		err := cur.Decode(&result)
		if err != nil {
			return nil, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, result)
	}

	if err := cur.Err(); err != nil {
		return nil, fmt.Errorf("prompt cursor error, err: %v", err)
	}

	return res, nil
}

func (r *Repository) GetByID(ctx context.Context, pID string) (*entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	var result entity.PublishedPrompt
	filter := bson.D{}
	uuid, err := primitive.ObjectIDFromHex(pID)
	if err != nil {
		filter = bson.D{{"publishIdentifier", pID}}
	} else {
		filter = bson.D{{"_id", uuid}}
	}
	err = c.FindOne(ctx, filter).Decode(&result)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("cannot find prompt by prompt ID, err: %v", err)
	}
	return &result, nil
}

func (r *Repository) GetByPromptID(ctx context.Context, id string) ([]entity.PublishedPrompt, error) {
	c := r.m.Collection("published")
	filter := bson.D{{"promptId", id}}
	cur, err := c.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("cannot fetch published prompts by prompt ID, err: %v", err)
	}
	res := make([]entity.PublishedPrompt, 0)
	for cur.Next(ctx) {
		var result entity.PublishedPrompt
		err := cur.Decode(&result)
		if err != nil {
			return nil, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, result)
	}

	if err := cur.Err(); err != nil {
		return nil, fmt.Errorf("prompt cursor error, err: %v", err)
	}

	return res, nil
}

func (r *Repository) DisableByID(ctx context.Context, id string) error {
	c := r.m.Collection("published")
	uuid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("cannot parse ID, err: %v", err)
	}
	filter := bson.D{{"_id", uuid}}
	update := bson.D{{"$set", bson.D{{"disabled", true}}}}
	_, err = c.UpdateOne(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("cannot disable prompt by ID, err: %v", err)
	}
	return nil
}

func (r *Repository) DisableAllByPubName(ctx context.Context, name string, val bool) error {
	c := r.m.Collection("published")
	filter := bson.D{{"publishIdentifier", name}}
	update := bson.D{{"$set", bson.D{{"disabled", val}}}}
	_, err := c.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("cannot disable prompts by name, err: %v", err)
	}
	return nil
}

func (r *Repository) DevModeAllByPubName(ctx context.Context, name string, val bool) error {
	c := r.m.Collection("published")
	filter := bson.D{{"publishIdentifier", name}}
	update := bson.D{{"$set", bson.D{{"devMode", val}}}}
	_, err := c.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("cannot dev mode set by name, err: %v", err)
	}
	return nil
}

func (r *Repository) DeleteAllByPubName(ctx context.Context, name string) error {
	c := r.m.Collection("published")
	filter := bson.D{{"publishIdentifier", name}}
	update := bson.D{{"$set", bson.D{{"deleted", true}}}}
	_, err := c.UpdateMany(ctx, filter, update)
	if err != nil {
		return fmt.Errorf("cannot disable prompts by name, err: %v", err)
	}
	return nil
}

func (r *Repository) AddABTest(ctx context.Context, abTest entity.PublicationABTest) error {
	c := r.m.Collection("abtest")
	_, err := c.DeleteOne(ctx, bson.D{{Key: "publicationIdentifier", Value: abTest.PublicationIdentifier}})
	if err != nil {
		return fmt.Errorf("cannot delete ab test document")
	}
	if len(abTest.PublicationsRatio) > 1 {
		_, err = c.InsertOne(ctx, abTest)
		if err != nil {
			return fmt.Errorf("cannot insert ab test document")
		}
	}
	return nil
}

func (r *Repository) GetABTestByPubID(ctx context.Context, pID string) (*entity.PublicationABTest, error) {
	c := r.m.Collection("abtest")
	var result entity.PublicationABTest
	filter := bson.D{{Key: "publicationIdentifier", Value: pID}}
	err := c.FindOne(ctx, filter).Decode(&result)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("cannot find prompt by prompt ID, err: %v", err)
	}
	return &result, nil
}

func (r *Repository) DeleteABTestByContainingPubName(ctx context.Context, pubName string) error {
	c := r.m.Collection("abtest")
	_, err := c.DeleteMany(ctx, bson.D{{Key: "publicationsRatio.publicationIdentifier", Value: pubName}})
	if err != nil {
		return fmt.Errorf("cannot delete ab test document")
	}
	return nil
}
