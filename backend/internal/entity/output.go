package entity

import "time"

type PromptParsedOutput struct {
	ID                string                 `json:"id" bson:"_id,omitempty"`
	PromptName        string                 `json:"name" bson:"name"`
	PromptVersionID   string                 `json:"promptVersionId" bson:"promptVersionId"`
	ParentName        string                 `json:"parentName" bson:"parentId"`
	PublishIdentifier string                 `json:"publishIdentifier" bson:"publishIdentifier"`
	GroupName         string                 `json:"groupName" bson:"groupName"`
	Disabled          bool                   `json:"disabled" bson:"disabled"`
	DevVersion        bool                   `json:"devVersion" bson:"devVersion"`
	SystemRolePrompt  string                 `json:"systemRolePrompt" bson:"systemRolePrompt"`
	UserPrompt        string                 `json:"userPrompt" bson:"userPrompt"`
	FullPrompt        string                 `json:"fullPrompt" bson:"fullPrompt"`
	Temerature        int                    `json:"temperature" bson:"temperature"`
	TopP              int                    `json:"topP" bson:"topP"`
	PromptParams      map[string]interface{} `json:"promptParams" bson:"promptParams"`
	CustomParams      map[string]string      `json:"customParams" bson:"customParams"`
	System            string                 `json:"system" bson:"system"`
	Prompt            string                 `json:"prompt" bson:"prompt"`
	OutputPrompt      string                 `json:"outputPrompt" bson:"outputPrompt"`
	Params            []string               `json:"params" bson:"params"`
	CreatedAt         time.Time              `json:"createdAt" bson:"createdAt"`
	OutputExamples    []string               `json:"outputExamples" bson:"outputExamples"`
	ExecutionType     string                 `json:"executionType" bson:"executionType"`
	OutputType        string                 `json:"outputType" bson:"outputType"`
}
