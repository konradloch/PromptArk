package prompt

import (
	"bytes"
	"context"
	"fmt"
	"prompt-analyzer/internal/app/tokenizer"
	"prompt-analyzer/internal/entity"
	"text/template"
	"unicode/utf8"

	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) CreateNewPrompt(ctx context.Context, prompt entity.Prompt) error {
	log.Info("Creating new prompt")
	prompt.PromptID = primitive.NewObjectID().Hex()
	//TODO check name avaliaiblity and disability
	return s.repo.Save(ctx, prompt)
}

func (s *Service) CreateNewPromptVersion(ctx context.Context, promptID string, prompt entity.Prompt) (*entity.Prompt, error) {
	log.Info("Creating new prompt version")
	return s.repo.SaveNewVersion(ctx, promptID, prompt)
}

func (s *Service) GetActivatedByGroupID(ctx context.Context, groupID string) ([]entity.Prompt, error) {
	log.Info("Getting all activated roots prompts")
	return s.repo.GetActivatedByGroupID(ctx, groupID)
}

func (s *Service) GetActivatedByPromptID(ctx context.Context, promptID string) (*entity.Prompt, error) {
	log.Info("Getting activated by promptID")
	return s.repo.GetActivatedByPromptID(ctx, promptID)
}

func (s *Service) GetAllByGroupIDAndPromptID(ctx context.Context, groupID, promptID string) ([]entity.Prompt, error) {
	log.Info("Getting all by group id and prompt id prompts")
	return s.repo.GetAllByGroupIDAndPromptID(ctx, groupID, promptID)
}

func (s *Service) GetByIntID(ctx context.Context, ID string) (*entity.Prompt, error) {
	log.Info("Getting prompt by ID")
	return s.repo.GetByID(ctx, ID)
}

func (s *Service) GetTotalTokenCountByGroupId(ctx context.Context, groupID string) (int, error) {
	log.Info("Getting total token count by group ID")
	prompts, err := s.repo.GetActivatedByGroupID(ctx, groupID)
	if err != nil {
		return 0, fmt.Errorf("cannot get activated prompts by group ID %s: %v", groupID, err)
	}
	total := 0
	for _, p := range prompts {
		rt, err := s.GetFormatedPromptByIntID(ctx, p.ID)
		if err != nil {
			return 0, fmt.Errorf("cannot get formatted prompt by ID %s: %v", p.ID, err)
		}
		total += rt.TokenCount
	}
	return total, nil
}

func (s *Service) GetFormatedPromptByIntID(ctx context.Context, ID string) (*ResponseToken, error) {
	log.Info("Getting prompt by ID")
	p, err := s.repo.GetByID(ctx, ID)
	if err != nil {
		return nil, fmt.Errorf("cannot get prompt by ID %s: %v", ID, err)
	}
	templ :=
		`{{ if .System }}
{{ .System }}
{{ end }}
{{ if .Prompt }}
{{ .Prompt }}
{{ end }}
{{ if .OutputPrompt }}
{{ .OutputPrompt }}
{{ end }}
{{ if .OutputExamples }}
Example outputs:
{{ range .OutputExamples }}
 - {{ . }}
{{ end }}
{{ end }}`
	tmpl, err := template.New("prompt").Parse(templ)
	if err != nil {
		return nil, fmt.Errorf("cannot parse template: %v", err)
	}
	type Inputs struct {
		System         string
		Prompt         string
		OutputPrompt   string
		OutputExamples []string
	}
	buf := new(bytes.Buffer)
	err = tmpl.Execute(buf, Inputs{
		System:         p.System,
		Prompt:         p.Prompt,
		OutputPrompt:   p.OutputPrompt,
		OutputExamples: p.OutputExamples,
	})
	if err != nil {
		return nil, fmt.Errorf("cannot parse template: %v", err)
	}
	return &ResponseToken{
		Prompt:         buf.String(),
		TokenCount:     tokenizer.CountTokens(buf.String()),
		BytesCount:     len(buf.String()),
		CharacterCount: utf8.RuneCountInString(buf.String()),
	}, nil
}

func (s *Service) ChangeActivatedPrompt(ctx context.Context, ID string) error {
	prompt, err := s.repo.GetByID(ctx, ID)
	if err != nil {
		return fmt.Errorf("cannot get prompt by ID %s: %v", ID, err)
	}
	if prompt.Disabled {
		return fmt.Errorf("prompt has been removed")
	}
	err = s.repo.DeactivatePromptByPromptID(ctx, prompt.PromptID)
	if err != nil {
		return fmt.Errorf("cannot deactivate prompt: %v", err)
	}
	err = s.repo.ActivatePromptByID(ctx, ID)
	if err != nil {
		return fmt.Errorf("cannot activate prompt: %v", err)
	}
	return nil
}

func (s *Service) GetByID(ctx context.Context, pID string) (*entity.Prompt, error) {
	log.Info("Getting prompt by ID")
	return s.repo.GetByID(ctx, pID)
}

func (s *Service) SoftDeleteByPromptID(ctx context.Context, promptID string) error {
	log.Info("Deleting prompt by prompt ID")
	chs, err := s.getAllPromptChildrens(ctx, promptID, []string{})
	if err != nil {
		return fmt.Errorf("cannot get children by parent ID %s: %v", promptID, err)
	}
	fmt.Println(chs)
	err = s.repo.DeleteByPromptIDs(ctx, chs)
	if err != nil {
		return fmt.Errorf("cannot soft delete prompt by prompt ID %s: %v", chs, err)
	}
	return nil
}

func (s *Service) getAllPromptChildrens(ctx context.Context, promptID string, ids []string) ([]string, error) {
	ids = append(ids, promptID)
	child, err := s.repo.GetByParentID(ctx, promptID)
	if err != nil {
		return nil, fmt.Errorf("cannot get children by parent ID %s: %v", promptID, err)
	}
	if child != nil {
		return s.getAllPromptChildrens(ctx, child.PromptID, ids)
	}
	return ids, nil
}
