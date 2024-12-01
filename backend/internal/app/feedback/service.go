package feedback

import (
	"context"
	"fmt"
	"prompt-analyzer/internal/entity"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

type prompter interface {
	GetPromptPub(ctx context.Context, pubName string, promptName string) (*entity.PublishedPrompt, error)
	GetGroupPub(ctx context.Context, pubName string, groupName string) (*entity.PublishedPrompt, error)
}

type Service struct {
	repo     *Repository
	prompter prompter
}

func NewService(repo *Repository, p prompter) *Service {
	return &Service{
		repo:     repo,
		prompter: p,
	}
}

func (s *Service) CreateFeedbackRecord(ctx context.Context, feedback entity.FeedbackPayload) error {
	log.Info("Creating new feedback entry")
	var groupName string
	if strings.ToUpper(feedback.Type) == "GROUP" {
		g, err := s.prompter.GetGroupPub(ctx, feedback.PublicationVersion, feedback.ObjectName)
		if err != nil {
			log.Errorf("cannot fetch published group by name, err: %v", err)
			return fmt.Errorf("cannot fetch published group by name")
		}
		if g == nil {
			log.Errorf("cannot find published group by name, err: %v", err)
			return fmt.Errorf("cannot find published group by name")
		}
		groupName = feedback.ObjectName
	}
	if strings.ToUpper(feedback.Type) == "PROMPT" {
		p, err := s.prompter.GetPromptPub(ctx, feedback.PublicationVersion, feedback.ObjectName)
		if err != nil {
			log.Errorf("cannot fetch published prompt by name, err: %v", err)
			return fmt.Errorf("cannot fetch published prompt by name")
		}
		if p == nil {
			log.Errorf("cannot find published prompt by name, err: %v", err)
			return fmt.Errorf("cannot find published prompt by name")
		}
		groupName = p.GroupName
	}
	return s.repo.Save(ctx, entity.Feedback{
		Type:               strings.ToUpper(feedback.Type),
		ObjectName:         feedback.ObjectName,
		PublicationVersion: feedback.PublicationVersion,
		Positive:           *feedback.Positive,
		GroupName:          groupName,
		CreatedAt:          time.Now(),
	})
}

func (s *Service) GetAll(ctx context.Context, f Filter) ([]FeedbackGrouped, int, error) {
	log.Info("Getting all feedback")
	return s.repo.GetAllFiltered(ctx, f)
}

func (s *Service) GetFilterOptions(ctx context.Context, filters []string) ([]FilterOptions, error) {
	log.Info("Getting filter options")
	resp := make([]FilterOptions, 0)
	for _, f := range filters {
		fo, err := s.repo.GetDistinctFilterOptions(ctx, f)
		if err != nil {
			return nil, fmt.Errorf("cannot get distinct filter options for %s: %v", f, err)
		}
		resp = append(resp, FilterOptions{
			FilterName: f,
			Options:    fo,
		})
	}
	return resp, nil
}

func (s *Service) GetSubFeedback(ctx context.Context, gID, pID string) ([]FeedbackSubGrouped, error) {
	log.Info("Getting sub feedback")
	return s.repo.GetSubFeedback(ctx, gID, pID)
}
