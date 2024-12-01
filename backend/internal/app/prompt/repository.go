package prompt

import (
	"context"
	"errors"
	"fmt"
	"prompt-analyzer/internal/entity"
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
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	Description    string             `bson:"description,omitempty"`
	ExecutionType  string             `bson:"executionType,omitempty"`
	OutputType     string             `bson:"outputType,omitempty"`
	PromptID       string             `bson:"promptId"`
	Name           string             `bson:"name,omitempty"`
	System         string             `bson:"system,omitempty"`
	Prompt         string             `bson:"prompt,omitempty"`
	OutputPrompt   string             `bson:"outputPrompt,omitempty"`
	Temperature    int                `bson:"temperature,omitempty"`
	Params         []string           `bson:"params"`
	P              int                `bson:"p,omitempty"`
	ParentID       string             `bson:"parentId,omitempty"`
	GroupID        primitive.ObjectID `bson:"groupId,omitempty"`
	CreatedAt      time.Time          `bson:"createdAt,omitempty"`
	UpdatedAt      time.Time          `bson:"updatedAt,omitempty"`
	ActivatedAt    time.Time          `bson:"activatedAt,omitempty"`
	Activated      bool               `bson:"activated,omitempty"`
	OutputExamples []string           `bson:"outputExamples,omitempty"`
	CustomParams   map[string]string  `bson:"customParams,omitempty"`
	Disabled       bool               `bson:"disabled"`
}

func (r *Repository) Save(ctx context.Context, prompt entity.Prompt) error {
	c := r.m.Collection("prompt")
	gID, err := primitive.ObjectIDFromHex(prompt.GroupID)
	if err != nil {
		return fmt.Errorf("cannot parse groupID to objectID, err: %v", err)
	}
	d := document{
		PromptID:      prompt.PromptID,
		Description:   prompt.Description,
		OutputType:    prompt.OutputType,
		ExecutionType: prompt.ExecutionType,
		Name:          prompt.Name,
		ParentID:      prompt.ParentID,
		GroupID:       gID,
		CreatedAt:     time.Now(),
		ActivatedAt:   time.Now(),
		Activated:     true,
	}
	_, err = c.InsertOne(ctx, d)
	if err != nil {
		return fmt.Errorf("cannot insert prompt document")
	}
	return nil
}

func (r *Repository) SaveNewVersion(ctx context.Context, promptID string, prompt entity.Prompt) (*entity.Prompt, error) {
	c := r.m.Collection("prompt")
	gID, err := primitive.ObjectIDFromHex(prompt.GroupID)
	if err != nil {
		return nil, fmt.Errorf("cannot parse groupID to objectID, err: %v", err)
	}
	d := document{
		PromptID:       promptID,
		Name:           prompt.Name,
		Description:    prompt.Description,
		OutputType:     prompt.OutputType,
		ExecutionType:  prompt.ExecutionType,
		System:         prompt.System,
		Prompt:         prompt.Prompt,
		OutputPrompt:   prompt.OutputPrompt,
		Params:         prompt.Params,
		Temperature:    prompt.Temperature,
		P:              prompt.TopP,
		ParentID:       prompt.ParentID,
		GroupID:        gID,
		CreatedAt:      time.Now(),
		OutputExamples: prompt.OutputExamples,
		CustomParams:   prompt.CustomParams,
	}
	res, err := c.InsertOne(ctx, d)
	if err != nil {
		return nil, fmt.Errorf("cannot insert prompt document")
	}
	ID := res.InsertedID.(primitive.ObjectID)
	return r.GetByID(ctx, ID.Hex())
}

func (r *Repository) GetActivatedByPromptID(ctx context.Context, promptID string) (*entity.Prompt, error) {
	c := r.m.Collection("prompt")
	//pID, err := primitive.ObjectIDFromHex(promptID)
	//if err != nil {
	//	return nil, fmt.Errorf("cannot parse promptID to objectID, err: %v", err)
	//}
	res := c.FindOne(ctx, bson.D{{"promptId", promptID}, {"activated", true}})
	if res.Err() != nil {
		return nil, fmt.Errorf("cannot find promptID by , err: %v", res.Err())
	}
	var result document
	err := res.Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("cannot parse prompt, err: %v", err)
	}
	prompt := entity.Prompt{
		ID:             result.ID.Hex(),
		PromptID:       result.PromptID,
		Description:    result.Description,
		OutputType:     result.OutputType,
		ExecutionType:  result.ExecutionType,
		Name:           result.Name,
		System:         result.System,
		Prompt:         result.Prompt,
		OutputPrompt:   result.OutputPrompt,
		Temperature:    result.Temperature,
		Params:         result.Params,
		TopP:           result.P,
		ParentID:       result.ParentID,
		GroupID:        result.GroupID.Hex(),
		CreatedAt:      result.CreatedAt,
		ActivatedAt:    result.ActivatedAt,
		Activated:      result.Activated,
		OutputExamples: result.OutputExamples,
		CustomParams:   result.CustomParams,
	}
	return &prompt, nil
}

func (r *Repository) GetActivatedByGroupID(ctx context.Context, groupID string) ([]entity.Prompt, error) {
	c := r.m.Collection("prompt")
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, fmt.Errorf("cannot parse groupID to objectID, err: %v", err)
	}
	cur, err := c.Find(ctx, bson.D{{"groupId", gID}, {"activated", true}, {"disabled", false}})
	if err != nil {
		return nil, fmt.Errorf("cannot find prompt by groupID, err: %v", err)
	}
	defer cur.Close(ctx)

	res := make([]entity.Prompt, 0)
	for cur.Next(ctx) {
		var result document
		err := cur.Decode(&result)
		if err != nil {
			return nil, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, entity.Prompt{
			ID:             result.ID.Hex(),
			PromptID:       result.PromptID,
			Description:    result.Description,
			OutputType:     result.OutputType,
			ExecutionType:  result.ExecutionType,
			Name:           result.Name,
			System:         result.System,
			Prompt:         result.Prompt,
			OutputPrompt:   result.OutputPrompt,
			Temperature:    result.Temperature,
			Params:         result.Params,
			TopP:           result.P,
			ParentID:       result.ParentID,
			GroupID:        result.GroupID.Hex(),
			CreatedAt:      result.CreatedAt,
			ActivatedAt:    result.ActivatedAt,
			Activated:      result.Activated,
			OutputExamples: result.OutputExamples,
			CustomParams:   result.CustomParams,
		})
	}

	if err := cur.Err(); err != nil {
		return nil, fmt.Errorf("prompt cursor error, err: %v", err)
	}

	return res, nil
}

func (r *Repository) GetAllByGroupIDAndPromptID(ctx context.Context, groupID, promptID string) ([]entity.Prompt, error) {
	c := r.m.Collection("prompt")
	gID, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		return nil, fmt.Errorf("cannot parse groupID to objectID, err: %v", err)
	}
	cur, err := c.Find(ctx, bson.D{{"groupId", gID}, {"promptId", promptID}, {"disabled", false}},
		options.Find().SetSort(bson.D{{"createdAt", -1}}))
	if err != nil {
		return nil, fmt.Errorf("cannot find prompt by groupID and promptID, err: %v", err)
	}
	defer cur.Close(ctx)

	res := make([]entity.Prompt, 0)
	for cur.Next(ctx) {
		var result document
		err := cur.Decode(&result)
		if err != nil {
			return nil, fmt.Errorf("cannot parse prompt root, err: %v", err)
		}
		res = append(res, entity.Prompt{
			ID:             result.ID.Hex(),
			PromptID:       result.PromptID,
			Description:    result.Description,
			OutputType:     result.OutputType,
			ExecutionType:  result.ExecutionType,
			Name:           result.Name,
			System:         result.System,
			Prompt:         result.Prompt,
			OutputPrompt:   result.OutputPrompt,
			Temperature:    result.Temperature,
			Params:         result.Params,
			TopP:           result.P,
			ParentID:       result.ParentID,
			GroupID:        result.GroupID.Hex(),
			CreatedAt:      result.CreatedAt,
			ActivatedAt:    result.ActivatedAt,
			Activated:      result.Activated,
			OutputExamples: result.OutputExamples,
			CustomParams:   result.CustomParams,
		})
	}

	if err := cur.Err(); err != nil {
		return nil, fmt.Errorf("prompt cursor error, err: %v", err)
	}

	return res, nil
}

func (r *Repository) GetByID(ctx context.Context, ID string) (*entity.Prompt, error) {
	c := r.m.Collection("prompt")
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
		return nil, fmt.Errorf("cannot find prompt by ID, err: %v", err)
	}
	return &entity.Prompt{
		ID:             result.ID.Hex(),
		PromptID:       result.PromptID,
		Name:           result.Name,
		Description:    result.Description,
		OutputType:     result.OutputType,
		ExecutionType:  result.ExecutionType,
		System:         result.System,
		Prompt:         result.Prompt,
		OutputPrompt:   result.OutputPrompt,
		Temperature:    result.Temperature,
		Params:         result.Params,
		TopP:           result.P,
		ParentID:       result.ParentID,
		GroupID:        result.GroupID.Hex(),
		CreatedAt:      result.CreatedAt,
		ActivatedAt:    result.ActivatedAt,
		Activated:      result.Activated,
		OutputExamples: result.OutputExamples,
		CustomParams:   result.CustomParams,
	}, nil
}

func (r *Repository) GetByParentID(ctx context.Context, parentID string) (*entity.Prompt, error) {
	c := r.m.Collection("prompt")
	var result document
	filter := bson.D{{Key: "parentId", Value: parentID}}
	err := c.FindOne(ctx, filter).Decode(&result)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	} else if err != nil {
		return nil, fmt.Errorf("cannot find prompt by parentID, err: %v", err)
	}
	return &entity.Prompt{
		ID:             result.ID.Hex(),
		PromptID:       result.PromptID,
		Name:           result.Name,
		Description:    result.Description,
		OutputType:     result.OutputType,
		ExecutionType:  result.ExecutionType,
		System:         result.System,
		Prompt:         result.Prompt,
		OutputPrompt:   result.OutputPrompt,
		Temperature:    result.Temperature,
		Params:         result.Params,
		TopP:           result.P,
		ParentID:       result.ParentID,
		GroupID:        result.GroupID.Hex(),
		CreatedAt:      result.CreatedAt,
		ActivatedAt:    result.ActivatedAt,
		Activated:      result.Activated,
		OutputExamples: result.OutputExamples,
		CustomParams:   result.CustomParams,
	}, nil
}

func (r *Repository) DeactivatePromptByPromptID(ctx context.Context, promptID string) error {
	c := r.m.Collection("prompt")
	filter := bson.D{{"promptId", promptID}, {"activated", true}}
	_, err := c.UpdateOne(ctx, filter, bson.D{{"$set", bson.D{{"activated", false}}}})
	return err
}

func (r *Repository) ActivatePromptByID(ctx context.Context, ID string) error {
	c := r.m.Collection("prompt")
	id, err := primitive.ObjectIDFromHex(ID)
	if err != nil {
		return fmt.Errorf("cannot parse ID to objectID, err: %v", err)
	}
	filter := bson.D{{"_id", id}}
	_, err = c.UpdateOne(ctx, filter, bson.D{{"$set", bson.D{{"activated", true}}}})
	return err
}

func (r *Repository) DeleteByPromptIDs(ctx context.Context, ids []string) error {
	c := r.m.Collection("prompt")
	filter := bson.D{{Key: "promptId", Value: bson.D{{Key: "$in", Value: ids}}}}
	_, err := c.UpdateMany(ctx, filter, bson.D{{Key: "$set", Value: bson.D{{Key: "disabled", Value: true}}}})
	return err
}
