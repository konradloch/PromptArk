package prompt

import "time"

type payload struct {
	Name           string            `json:"name" validate:"required"`
	Description    string            `json:"description,omitempty"`
	ExecutionType  string            `json:"executionType"`
	OutputType     string            `json:"outputType"`
	System         string            `json:"system,omitempty"`
	Prompt         string            `json:"prompt" validate:"required"`
	OutputPrompt   string            `json:"outputPrompt"`
	Params         []string          `json:"params"`
	Temperature    int               `json:"temperature,omitempty"`
	P              int               `json:"p,omitempty"`
	ParentID       string            `json:"parentId,omitempty"`
	OutputExamples []string          `json:"outputExamples,omitempty"`
	CustomParams   map[string]string `json:"customParams,omitempty"`
}

type templatePayload struct {
	Name          string `json:"name" validate:"required"`
	Description   string `json:"description,omitempty"`
	ExecutionType string `json:"executionType"`
	OutputType    string `json:"outputType"`
	ParentID      string `json:"parentId,omitempty"`
}

type response struct {
	ID             string            `json:"id"`
	PromptID       string            `json:"promptId"`
	Description    string            `json:"description,omitempty"`
	ExecutionType  string            `json:"executionType"`
	OutputType     string            `json:"outputType"`
	Name           string            `json:"name" validate:"required"`
	System         string            `json:"system,omitempty"`
	Prompt         string            `json:"prompt" validate:"required"`
	OutputPrompt   string            `json:"outputPrompt" validate:"required"`
	Params         []string          `json:"params"`
	Temperature    int               `json:"temperature,omitempty"`
	P              int               `json:"p,omitempty"`
	ParentID       string            `json:"parentId,omitempty"`
	CreatedAt      time.Time         `json:"createdAt,omitempty"`
	Activated      bool              `json:"activated,omitempty"`
	OutputExamples []string          `json:"outputExamples"`
	CustomParams   map[string]string `json:"customParams"`
	GroupID        string            `json:"groupId"`
}

type ResponseToken struct {
	Prompt         string `json:"prompt"`
	TokenCount     int    `json:"tokenCount"`
	BytesCount     int    `json:"bytesCount"`
	CharacterCount int    `json:"characterCount"`
}

type responseTokenTotal struct {
	TotalTokens int `json:"totalTokens"`
}