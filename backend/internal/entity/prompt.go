package entity

import "time"

type Prompt struct {
	ID             string            `json:"id"`
	PromptID       string            `json:"promptId"`
	Name           string            `json:"name"`
	System         string            `json:"system"`
	Prompt         string            `json:"prompt"`
	OutputPrompt   string            `json:"outputPrompt"`
	Params         []string          `json:"params"`
	Temperature    int               `json:"temperature"`
	TopP           int               `json:"topP"`
	IsRoot         bool              `json:"isRoot"`
	ParentID       string            `json:"parentId"`
	GroupID        string            `json:"groupId"`
	CreatedAt      time.Time         `json:"createdAt"`
	ActivatedAt    time.Time         `json:"activatedAt"`
	Activated      bool              `json:"activated"`
	OutputExamples []string          `json:"outputExamples"`
	CustomParams   map[string]string `json:"customParams"`
	Disabled       bool              `json:"disabled"`
	Description    string            `json:"description"`
	ExecutionType  string            `json:"executionType"`
	OutputType     string            `json:"outputType"`
}
