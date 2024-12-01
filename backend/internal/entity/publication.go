package entity

import "time"

type PublishedPrompt struct {
	ID                string    `json:"id" bson:"_id,omitempty"`
	Name              string    `json:"name" bson:"name"`
	PromptID          string    `json:"promptId" bson:"promptId"`
	PromptVersionID   string    `json:"promptVersionId" bson:"promptVersionId"`
	ParentID          string    `json:"parentId" bson:"parentId"`
	PublishIdentifier string    `json:"publishIdentifier" bson:"publishIdentifier"`
	GroupID           string    `json:"groupId" bson:"groupId"`
	GroupName         string    `json:"groupName" bson:"groupName"`
	PublishedAt       time.Time `json:"publishedAt" bson:"publishedAt"`
	Disabled          bool      `json:"disabled" bson:"disabled"`
	Deleted           bool      `json:"deleted" bson:"deleted"`
	DevMode           bool      `json:"devMode" bson:"devMode"`
	Params            []string  `json:"params" bson:"params"`
}

type PublishedGroup struct {
	PublishIdentifier string            `json:"publishIdentifier" bson:"publishIdentifier"`
	GroupID           string            `json:"groupId" bson:"groupId"`
	GroupName         string            `json:"groupName" bson:"groupName"`
	Prompts           []PublishedPrompt `json:"prompts" bson:"prompts"`
	PublishedAt       time.Time         `json:"publishedAt" bson:"publishedAt"`
	Disabled          bool              `json:"disabled" bson:"disabled"`
	Deleted           bool              `json:"deleted" bson:"deleted"`
	DevMode           bool              `json:"devMode" bson:"devMode"`
	ABTestEnabled     bool              `json:"abTestEnabled" bson:"abTestEnabled"`
}

type PublicationABTest struct {
	ID                    string             `json:"id" bson:"_id,omitempty"`
	PublicationIdentifier string             `json:"publicationIdentifier" bson:"publicationIdentifier"`
	PublicationsRatio     []PublicationRatio `json:"publicationsRatio" bson:"publicationsRatio"`
}

type PublicationRatio struct {
	PublicationIdentifier string `json:"publicationIdentifier" bson:"publicationIdentifier"`
	HitRatio              int    `json:"hitRatio" bson:"hitRatio"`
}
