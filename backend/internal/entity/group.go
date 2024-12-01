package entity

import "time"

type Group struct {
	ID           string
	Name         string
	Description  string
	TimeCreation time.Time
}
