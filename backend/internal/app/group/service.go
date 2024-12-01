package group

import (
	"context"
	"fmt"
	"prompt-analyzer/internal/entity"

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

func (s *Service) CreateNewGroup(ctx context.Context, group entity.Group) error {
	log.Info("Creating new group")
	exists, err := s.repo.CheckIfNameExists(ctx, group.Name)
	if err != nil {
		return fmt.Errorf("cannot check if name exists, err: %v", err)
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.repo.Save(ctx, group)
}

func (s *Service) DeleteByID(ctx context.Context, ID string) error {
	log.Info("Soft delete group by ID ", ID)
	return s.repo.SoftDeleteByID(ctx, ID)
}

func (s *Service) GetAll(ctx context.Context, name string) ([]entity.Group, int, error) {
	log.Info("Getting all groups")
	return s.repo.GetAll(ctx, name)
}

func (s *Service) GetByID(ctx context.Context, ID string) (*entity.Group, error) {
	log.Info("Getting all groups")
	return s.repo.GetByID(ctx, ID)
}
