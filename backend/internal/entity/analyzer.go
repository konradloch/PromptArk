package entity

import "time"

type PromptOutput struct {
	ID                  string    `json:"id" bson:"_id,omitempty"`
	PromptVersionID     string    `json:"promptVersionId" bson:"promptVersionId,omitempty"`
	PromptName          string    `json:"promptName" bson:"promptName,omitempty"`
	GroupName           string    `json:"groupName" bson:"groupName,omitempty"`
	Status              string    `json:"status" bson:"status,omitempty"`
	CorrelationID       string    `json:"correlationId" bson:"correlationId"`
	ExecutionTime       time.Time `json:"executionTime" bson:"executionTime,omitempty"`
	Output              string    `json:"output" bson:"output"`
	PublisherIdentifier string    `json:"publisherIdentifier" bson:"publisherIdentifier,omitempty"`
	OutputID            string    `json:"outputId" bson:"outputId"`
	StatusMessage       string    `json:"statusMessage" bson:"statusMessage,omitempty"`
}

type AnalyzerPayload struct {
	PromptID      string    `json:"promptId" validate:"required"`
	Status        string    `json:"status" validate:"required"`
	StatusMessage string    `json:"statusMessage"`
	CorrelationID string    `json:"correlationId" validate:"required"`
	ExecutionTime time.Time `json:"executionTime" validate:"required"`
	PromptOutput  string    `json:"promptOutput" validate:"required"`
}
