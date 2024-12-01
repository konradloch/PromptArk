package client

import (
	"context"
	"fmt"
	statistics "prompt-analyzer/internal/app/statistic"
	"prompt-analyzer/internal/app/tokenizer"
	"prompt-analyzer/internal/entity"

	log "github.com/sirupsen/logrus"
)

type outputer interface {
	CreateAndSavePrompt(ctx context.Context, groupID, pubName, promptID string, pp map[string]interface{}) (*entity.PromptParsedOutput, error)
}

type analyzer interface {
	CreateAnalyzeRecord(ctx context.Context, a entity.AnalyzerPayload) error
}

type feedbacker interface {
	CreateFeedbackRecord(ctx context.Context, f entity.FeedbackPayload) error
}

type statisticer interface {
	Create(ctx context.Context, stat statistics.StatName, val int) error
}

type Service struct {
	outputer    outputer
	analyzer    analyzer
	feedbacker  feedbacker
	statisticer statisticer
}

func NewService(prompter outputer, analyzer analyzer, feedbacker feedbacker, statisticer statisticer) *Service {
	return &Service{
		outputer:    prompter,
		analyzer:    analyzer,
		feedbacker:  feedbacker,
		statisticer: statisticer,
	}
}

func (s *Service) GetPublishedPrompt(ctx context.Context, groupID, versionID, promptID string, params map[string]interface{}) (*PromptResponse, error) {
	o, err := s.outputer.CreateAndSavePrompt(ctx, groupID, versionID, promptID, params)
	if err != nil {
		s.createStatistic(statistics.PromptRequestFailures, 1)
		return nil, fmt.Errorf("cannot create and save prompt, err=%w", err)
	}
	s.createStatistic(statistics.PromptRequests, 1)
	s.createTokenStatistic(o.FullPrompt)
	return &PromptResponse{
		ID:                o.ID,
		PromptName:        o.PromptName,
		PromptVersionID:   o.PromptVersionID,
		ParentName:        o.ParentName,
		PublishIdentifier: o.PublishIdentifier,
		GroupName:         o.GroupName,
		Disabled:          o.Disabled,
		DevVersion:        o.DevVersion,
		SystemRolePrompt:  o.SystemRolePrompt,
		UserPrompt:        o.UserPrompt,
		FullPrompt:        o.FullPrompt,
		Temerature:        o.Temerature,
		TopP:              o.TopP,
		PromptParams:      o.PromptParams,
		CustomParams:      o.CustomParams,
		Params:            o.Params,
	}, nil
}

func (s *Service) CreateAnalyzeRecord(ctx context.Context, a entity.AnalyzerPayload) error {
	log.Info("[CLIENT] Creating analyze record")
	if a.Status != "success" {
		s.createStatistic(statistics.PromptFailures, 1)
	}
	s.createStatistic(statistics.AnalyzerFeedbackCount, 1)
	s.createTokenStatistic(a.PromptOutput)
	return s.analyzer.CreateAnalyzeRecord(ctx, a)
}

func (s *Service) CreateFeedbackRecord(ctx context.Context, f entity.FeedbackPayload) error {
	log.Info("[CLIENT] Creating feedback record")
	s.createStatistic(statistics.FeedbackCount, 1)
	return s.feedbacker.CreateFeedbackRecord(ctx, f)
}

func (s *Service) createStatistic(stat statistics.StatName, val int) {
	log.Info("[CLIENT] Creating statistic record")
	go func() {
		err := s.statisticer.Create(context.Background(), stat, val)
		if err != nil {
			log.Errorf("cannot create statistic record, err=%v", err)
		}
	}()
}

func (s *Service) createTokenStatistic(text string) {
	log.Info("[CLIENT] Creating statistic record")
	go func() {
		err := s.statisticer.Create(context.Background(), statistics.Tokens, tokenizer.CountTokens(text))
		if err != nil {
			log.Errorf("cannot create statistic record, err=%v", err)
		}
	}()
}
