package client

import "prompt-analyzer/internal/entity"

type ResponseGraph struct {
	Prompt entity.PublishedPrompt `json:"prompt"`
	Edges  []ResponseGraph        `json:"edges"`
}

type PromptResponse struct {
	ID                string                 `json:"id"`
	PromptName        string                 `json:"name"`
	PromptVersionID   string                 `json:"promptVersionId"`
	ParentName        string                 `json:"parentName"`
	PublishIdentifier string                 `json:"publishIdentifier"`
	GroupName         string                 `json:"groupName"`
	Disabled          bool                   `json:"disabled"`
	DevVersion        bool                   `json:"devVersion"`
	SystemRolePrompt  string                 `json:"systemRolePrompt"`
	UserPrompt        string                 `json:"userPrompt"`
	FullPrompt        string                 `json:"fullPrompt"`
	Temerature        int                    `json:"temperature"`
	TopP              int                    `json:"topP"`
	Params            []string               `json:"params"`
	PromptParams      map[string]interface{} `json:"promptParams"`
	CustomParams      map[string]string      `json:"customParams"`
}
