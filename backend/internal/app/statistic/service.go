package statistics

import (
	"context"
	"time"

	log "github.com/sirupsen/logrus"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) Create(ctx context.Context, stat StatName, val int) error {
	log.Info("Creating new statistic")
	return s.repo.Save(ctx, Statistic{
		Name:      stat,
		Value:     val,
		CreatedAt: time.Now(),
	})
}

func (s *Service) GetByNamesAndDuration(ctx context.Context, names []StatName, accuracy time.Duration) ([]Statistic, error) {
	log.Info("Getting statistics by names and duration")
	return s.repo.GetByNamesAndDuration(ctx, names, accuracy)
}
