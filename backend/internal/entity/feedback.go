package entity

import "time"

type Feedback struct {
	ID                 string    `json:"id" bson:"_id,omitempty"`
	Positive           bool      `json:"positive" bson:"positive"`
	Type               string    `json:"type" bson:"type"`
	ObjectName         string    `json:"objectId" bson:"objectId"`
	GroupName          string    `json:"groupName" bson:"groupName"`
	PublicationVersion string    `json:"publicationVersion" bson:"publicationVersion"`
	CreatedAt          time.Time `json:"createdAt" bson:"createdAt"`
}

type FeedbackPayload struct {
	Positive           *bool  `json:"positive" validate:"required"`
	Type               string `json:"type" validate:"required"`
	ObjectName         string `json:"objectName" validate:"required"`
	PublicationVersion string `json:"publicationVersion" validate:"required"`
}
