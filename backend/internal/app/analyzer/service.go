package analyzer

import (
	"context"
	"fmt"
	"prompt-analyzer/internal/entity"

	log "github.com/sirupsen/logrus"
)

type outputer interface {
	GetByID(ctx context.Context, pID string) (*entity.PromptParsedOutput, error)
}

type Service struct {
	repo     *Repository
	outputer outputer
}

func NewService(repo *Repository, outputer outputer) *Service {
	return &Service{
		repo:     repo,
		outputer: outputer,
	}
}

func (s *Service) CreateAnalyzeRecord(ctx context.Context, p entity.AnalyzerPayload) error {
	log.Info("Creating new pub output")
	
	if p.CorrelationID != "" && p.PromptID == "" && p.PromptOutput != "" {
		log.Info("Creating final output")
		output := entity.PromptOutput{
			CorrelationID: p.CorrelationID,
			Output:        p.PromptOutput,
			OutputID:      "final",
		}
		//TODO delete before save
		return s.repo.CreateNewPromptOutput(ctx, output)
	}
	pr, err := s.outputer.GetByID(ctx, p.PromptID)
	if err != nil {
		return fmt.Errorf("cannot fetch prompt by id, err: %w", err)
	}
	output := entity.PromptOutput{
		PromptVersionID:     pr.PromptVersionID,
		PromptName:          pr.PromptName,
		GroupName:           pr.GroupName,
		Status:              p.Status,
		CorrelationID:       p.CorrelationID,
		ExecutionTime:       p.ExecutionTime,
		Output:              p.PromptOutput,
		PublisherIdentifier: pr.PublishIdentifier,
		OutputID:            pr.ID,
		StatusMessage:       p.StatusMessage,
	}
	return s.repo.CreateNewPromptOutput(ctx, output)
}

func (s *Service) GetAllDetailedByFilter(ctx context.Context, f Filter) ([]CorrelationIDGroupedResponse, int, error) {
	log.Info("Getting all prompt outputs")
	pos, ctr, err := s.repo.GetAllFiltered(ctx, f)
	if err != nil {
		return nil, 0, err
	}
	res := make([]CorrelationIDGroupedResponse, len(pos))
	for j, cg := range pos {
		pod := make([]PromptOutputDetailed, 0)
		for _, p := range cg.PromptOutputs {
			pr, err := s.outputer.GetByID(ctx, p.OutputID)
			if err != nil {
				return nil, 0, fmt.Errorf("cannot fetch prompt by id, err: %w", err)
			}
			pod = append(pod, PromptOutputDetailed{
				ID:                  p.ID,
				Prompt:              *pr,
				PromptName:          p.PromptName,
				PromptVersionID:     p.PromptVersionID,
				GroupName:           p.GroupName,
				Status:              p.Status,
				CorrelationID:       p.CorrelationID,
				ExecutionTime:       p.ExecutionTime,
				Output:              p.Output,
				PublisherIdentifier: p.PublisherIdentifier,
			})
		}
		status := pod[0].Status
		for _, s := range pod {
			if s.Status != status {
				status = "partialy-failed"
				break
			}
		}
		finalOutput := ""
		finalOutputPrompt, err := s.repo.GetFinalByCorrelationID(ctx, cg.ID)
		if err != nil {
			log.Warnf("cannot get final output by correlationID, err: %v", err)
		} else {
			finalOutput = finalOutputPrompt.Output
		}
		res[j] = CorrelationIDGroupedResponse{
			ID:                 cg.ID,
			GroupName:          cg.GroupName,
			PublicationName:    cg.PublicationName,
			StartExecutionTime: cg.StartExecutionTime,
			EndExecutionTime:   cg.EndExecutionTime,
			PromptOutputs:      pod,
			Duration:           cg.EndExecutionTime.Sub(cg.StartExecutionTime),
			Status:             status,
			FinalOutput:        finalOutput,
		}
	}
	return res, ctr, nil
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
