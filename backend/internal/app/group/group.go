package group

import "time"

type payload struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
}

type response struct {
	Data       []responseData     `json:"data"`
	Pagination responsePagination `json:"pagination"`
}

type responseData struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	TimeCreation time.Time `json:"time_creation"`
}

type responsePagination struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Size  int `json:"size"`
}
