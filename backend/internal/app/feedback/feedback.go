package feedback

import (
	"time"
)

type FeedbackGrouped struct {
	PossitivePercGroup float64   `json:"possitivePercGroup" bson:"possitivePercGroup"`
	PossitivePercAll   float64   `json:"possitivePercAll" bson:"possitivePercAll"`
	GroupName          string    `json:"groupName" bson:"groupName"`
	PublicationVersion string    `json:"publicationVersion" bson:"publicationVersion"`
	FirstCreatedAt     time.Time `json:"firstCreatedAt" bson:"firstCreatedAt"`
	LastCreatedAt      time.Time `json:"lastCreatedAt" bson:"lastCreatedAt"`
	FeedbackCount      int       `json:"feedbackCount" bson:"all"`
	FeedbackGroupCount int       `json:"feedbackGroupCount" bson:"allGroup"`
}

type FeedbackSubGrouped struct {
	PossitivePercAll float64   `json:"possitivePercAll" bson:"possitivePercAll"`
	PromptName       string    `json:"promptName" bson:"objectId"`
	FirstCreatedAt   time.Time `json:"firstCreatedAt" bson:"firstCreatedAt"`
	LastCreatedAt    time.Time `json:"lastCreatedAt" bson:"lastCreatedAt"`
	FeedbackCount    int       `json:"feedbackCount" bson:"all"`
}

type response struct {
	Data       interface{}        `json:"data"`
	Pagination responsePagination `json:"pagination"`
}

type responsePagination struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Size  int `json:"size"`
}

type FilterOptions struct {
	FilterName string   `json:"filterName"`
	Options    []string `json:"options"`
}

type Filter struct {
	GroupName  string
	PubVersion string
	From       time.Time
	To         time.Time
}
