package publication

import (
	"context"
	"fmt"
	"prompt-analyzer/internal/entity"
	"time"

	log "github.com/sirupsen/logrus"
)

type prompter interface {
	GetActivatedByGroupID(ctx context.Context, groupID string) ([]entity.Prompt, error)
}

type grouper interface {
	GetByID(ctx context.Context, groupID string) (*entity.Group, error)
}

type Service struct {
	repo     *Repository
	prompter prompter
	grouper  grouper
}

func NewService(repo *Repository, prompter prompter, grouper grouper) *Service {
	return &Service{
		repo:     repo,
		prompter: prompter,
		grouper:  grouper,
	}
}

func (s *Service) PublishPromptsByGroupID(ctx context.Context, groupID string, name string) error {
	log.Info("Publishing prompts by group ID")
	g, err := s.grouper.GetByID(ctx, groupID)
	if err != nil {
		return fmt.Errorf("cannot get group by ID, err=%v", err)
	}
	pp, err := s.repo.GetByPublishIdentifierAndGroupName(ctx, name, g.Name)
	if err != nil {
		return fmt.Errorf("cannot get by publish identifier and group name, err=%v", err)
	}
	if pp != nil {
		return ErrAlreadyPublished
	}
	
	ps, err := s.prompter.GetActivatedByGroupID(ctx, groupID)
	if err != nil {
		return fmt.Errorf("cannot get prompts by group ID, err=%v", err)
	}

	aps := make([]entity.PublishedPrompt, len(ps))
	pt := time.Now()
	for i, p := range ps {
		aps[i] = entity.PublishedPrompt{
			PromptID:          p.PromptID,
			PromptVersionID:   p.ID,
			Name:              p.Name,
			ParentID:          p.ParentID,
			PublishIdentifier: name,
			GroupID:           groupID,
			GroupName:         g.Name,
			PublishedAt:       pt,
			Disabled:          false,
			Deleted:           false,
			DevMode:           false,
			Params:            p.Params,
		}
	}
	return s.repo.AddAll(ctx, aps)
}

func (s *Service) GetAllPublishedGrouped(ctx context.Context, search string) ([]entity.PublishedGroup, int, error) {
	log.Info("Getting grouped and published prompts")
	return s.repo.GetAllPublishedGrouped(ctx, search)
}

func (s *Service) GetPromptPub(ctx context.Context, pubName string, promptName string) (*entity.PublishedPrompt, error) {
	log.Info("Getting prompt by pub name and prompt name")
	return s.repo.GetByPublishIdentifierAndPromptName(ctx, pubName, promptName)
}

func (s *Service) GetGroupPub(ctx context.Context, pubName string, groupName string) (*entity.PublishedPrompt, error) {
	log.Info("Getting prompt by pub name and prompt name")
	return s.repo.GetByPublishIdentifierAndGroupName(ctx, pubName, groupName)
}

func (s *Service) GetByID(ctx context.Context, pID string) (*entity.PublishedPrompt, error) {
	log.Info("Getting prompt by prompt ID")
	return s.repo.GetByID(ctx, pID)
}

func (s *Service) GetByPromptID(ctx context.Context, promptID string) ([]entity.PublishedPrompt, error) {
	log.Info("Getting prompts by prompt ID")
	return s.repo.GetByPromptID(ctx, promptID)
}

func (s *Service) GetByGroupID(ctx context.Context, gID string) ([]entity.PublishedPrompt, error) {
	log.Info("Getting prompts by group ID")
	return s.repo.GetByGroupID(ctx, gID)
}

func (s *Service) DisableAllByPubID(ctx context.Context, name string) error {
	log.Info("Disabling prompts by name")
	p, err := s.repo.GetByPublishIdentifier(ctx, name)
	if err != nil {
		return fmt.Errorf("cannot get by publish identifier, err=%v", err)
	}
	if len(p) == 0 {
		return fmt.Errorf("cannot find by publish identifier")
	}
	if p[0].Deleted {
		return fmt.Errorf("cannot disable deleted publication")
	}
	return s.repo.DisableAllByPubName(ctx, name, !p[0].Disabled)
}

func (s *Service) DevModeAllByPubID(ctx context.Context, name string) error {
	log.Info("DevMode prompts by name")
	p, err := s.repo.GetByPublishIdentifier(ctx, name)
	if err != nil {
		return fmt.Errorf("cannot get by publish identifier, err=%v", err)
	}
	if len(p) == 0 {
		return fmt.Errorf("cannot find by publish identifier")
	}
	if p[0].Deleted {
		return fmt.Errorf("cannot dev mode deleted publication")
	}
	return s.repo.DevModeAllByPubName(ctx, name, !p[0].DevMode)
}

func (s *Service) SoftDeleteByName(ctx context.Context, name string) error {
	log.Info("Deleting prompts by name")
	err := s.repo.DeleteABTestByContainingPubName(ctx, name)
	if err != nil {
		return fmt.Errorf("cannot remove ab test by containing pub name, err=%v", err)
	}
	return s.repo.DeleteAllByPubName(ctx, name)
}

func (s *Service) GetByGroupIDAndVersionID(ctx context.Context, gID, vID string) ([]entity.PublishedPrompt, error) {
	log.Info("Getting prompts by group ID")
	return s.repo.GetByGroupIDAndVersionID(ctx, gID, vID)
}

func (s *Service) GetByGroupIDAndVersionIDAndPromptID(ctx context.Context, gID, vID, pID string) (*entity.PublishedPrompt, error) {
	log.Info("Getting prompts by group ID and version ID and prompt ID")
	return s.repo.GetByGroupIDAndVersionIDAndPromptID(ctx, gID, vID, pID)
}

func (s *Service) GetABTestAvaliablePrompts(ctx context.Context, pubName string) (*avaliabilityABTestResponse, error) {
	res, _, err := s.repo.GetAllPublishedGrouped(ctx, "")
	if err != nil {
		return nil, fmt.Errorf("cannot get all published prompts for ab test avaliability, err=%v", err)
	}
	var prompt *entity.PublishedGroup
	for _, r := range res {
		if r.PublishIdentifier == pubName {
			prompt = &r
			break
		}
	}
	if prompt == nil {
		return nil, fmt.Errorf("cannot find published prompts by name")
	}
	availABTestPrompts := make([]entity.PublishedGroup, 0)
	for _, p := range res {
		if p.GroupID == prompt.GroupID && p.PublishIdentifier != pubName {
			if len(p.Prompts) == len(prompt.Prompts) {
				counter := 0
				for _, pr := range p.Prompts {
					for _, pp := range prompt.Prompts {
						if pr.Name == pp.Name { //&& len(pr.Params) == len(pp.Params)
							counter++
							break
						}
					}
				}
				if counter == len(p.Prompts) {
					availABTestPrompts = append(availABTestPrompts, p)
				}
			}
		}
	}
	resp := make([]string, 0)
	for _, p := range availABTestPrompts {
		resp = append(resp, p.PublishIdentifier)
	}
	return &avaliabilityABTestResponse{
		AvaliablePrompts: resp,
	}, nil
}

func (s *Service) AddABTest(ctx context.Context, pubName string, pubs []abTestPayload) error {
	log.Info(fmt.Sprintf("Adding AB test for publication=%s", pubName))
	ratios := make([]entity.PublicationRatio, len(pubs))
	for i, p := range pubs {
		ratios[i] = entity.PublicationRatio{
			PublicationIdentifier: p.PublicationID,
			HitRatio:              p.HitRatio,
		}
	}
	return s.repo.AddABTest(ctx, entity.PublicationABTest{
		PublicationIdentifier: pubName,
		PublicationsRatio:     ratios,
	})
}

func (s *Service) GetABTest(ctx context.Context, pubName string) (*entity.PublicationABTest, error) {
	log.Info(fmt.Sprintf("Getting AB test for publication=%s", pubName))
	return s.repo.GetABTestByPubID(ctx, pubName)
}
