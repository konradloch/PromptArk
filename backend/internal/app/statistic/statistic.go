package statistics

import "time"

type Statistic struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	Name      StatName  `json:"name" bson:"name"`
	Value     int       `json:"value" bson:"value"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
}

type StatName string

var (
	Tokens                StatName = "tokens"
	PromptRequests        StatName = "prompt_requests"
	PromptRequestFailures StatName = "prompt_request_failures"
	PromptFailures        StatName = "prompt_failures"
	FeedbackCount         StatName = "feedback_count"
	AnalyzerFeedbackCount StatName = "analyzer_feedback_count"
)
