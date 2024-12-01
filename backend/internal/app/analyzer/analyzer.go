package analyzer

import (
	"prompt-analyzer/internal/entity"
	"time"
)

type PromptOutputDetailed struct {
	ID                  string                    `json:"id" bson:"_id,omitempty"`
	Prompt              entity.PromptParsedOutput `json:"prompt" bson:"prompt"`
	PromptName          string                    `json:"promptName" bson:"promptName"`
	GroupName           string                    `json:"groupName" bson:"groupName"`
	Status              string                    `json:"status" bson:"status"`
	CorrelationID       string                    `json:"correlationId" bson:"correlationId"`
	ExecutionTime       time.Time                 `json:"executionTime" bson:"executionTime"`
	Output              string                    `json:"output" bson:"output"`
	PublisherIdentifier string                    `json:"publisherIdentifier" bson:"publisherIdentifier"`
	PromptVersionID     string                    `json:"promptVersionId" bson:"promptVersionId"`
}

type CorrelationIDGrouped struct {
	ID                 string                `json:"id" bson:"_id,omitempty"`
	GroupName          string                `json:"groupName" bson:"groupName"`
	PublicationName    string                `json:"publicationName" bson:"publicationName"`
	PromptOutputs      []entity.PromptOutput `json:"promptsOutputs" bson:"promptsOutputs"`
	StartExecutionTime time.Time             `json:"startExecutionTime" bson:"startExecutionTime"`
	EndExecutionTime   time.Time             `json:"endExecutionTime" bson:"endExecutionTime"`
}

type CorrelationIDGroupedResponse struct {
	ID                 string                 `json:"id" bson:"_id,omitempty"`
	GroupName          string                 `json:"groupName" bson:"groupName"`
	PublicationName    string                 `json:"publicationName" bson:"publicationName"`
	PromptOutputs      []PromptOutputDetailed `json:"promptOutputs" bson:"promptOutputs"`
	StartExecutionTime time.Time              `json:"startExecutionTime" bson:"startExecutionTime"`
	EndExecutionTime   time.Time              `json:"endExecutionTime" bson:"endExecutionTime"`
	Duration           time.Duration          `json:"duration" bson:"duration"`
	Status             string                 `json:"status" bson:"status"`
	FinalOutput        string                 `json:"finalOutput" bson:"finalOutput"`
}

type FilterOptions struct {
	FilterName string   `json:"filterName"`
	Options    []string `json:"options"`
}

type Filter struct {
	PromptName          string
	PublisherIdentifier string
	GroupName           string
	Status              string
	CorrelationID       string
	From                time.Time
	To                  time.Time
}

type response struct {
	Data       []CorrelationIDGroupedResponse `json:"data"`
	Pagination responsePagination             `json:"pagination"`
}

type responsePagination struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Size  int `json:"size"`
}
