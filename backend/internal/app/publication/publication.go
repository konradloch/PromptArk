package publication

import "prompt-analyzer/internal/entity"

type payload struct {
	Name    string `json:"name" validate:"required"`
	GroupID string `json:"groupId" validate:"required"`
}

type abTestPayload struct {
	PublicationID string `json:"publicationIdentifier" validate:"required"`
	HitRatio      int    `json:"hitRatio" validate:"required"`
}

type response struct {
	Data       []entity.PublishedGroup `json:"data"`
	Pagination responsePagination      `json:"pagination"`
}

type responsePagination struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Size  int `json:"size"`
}

type avaliabilityABTestResponse struct {
	AvaliablePrompts []string `json:"avaliablePrompts"`
}
