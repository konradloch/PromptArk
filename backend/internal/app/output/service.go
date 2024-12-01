package output

import (
	"bytes"
	"cmp"
	"context"
	"fmt"
	"math/rand/v2"
	"prompt-analyzer/internal/entity"
	"slices"
	"text/template"
	"time"

	log "github.com/sirupsen/logrus"
)

type grouper interface {
	GetByID(ctx context.Context, ID string) (*entity.Group, error)
}

type prompter interface {
	GetByIntID(ctx context.Context, ID string) (*entity.Prompt, error)
	GetActivatedByPromptID(ctx context.Context, promptID string) (*entity.Prompt, error)
}
type publisher interface {
	GetByGroupIDAndVersionIDAndPromptID(ctx context.Context, gID, vID, pID string) (*entity.PublishedPrompt, error)
	GetABTest(ctx context.Context, pubName string) (*entity.PublicationABTest, error)
}

type Service struct {
	gr   grouper
	pr   prompter
	pub  publisher
	repo *Repository
}

func NewService(gr grouper, pr prompter, pub publisher, repo *Repository) *Service {
	return &Service{
		gr:   gr,
		pr:   pr,
		pub:  pub,
		repo: repo,
	}
}

func (s *Service) CreateAndSavePrompt(ctx context.Context, groupID, pubName, promptID string, pp map[string]interface{}) (*entity.PromptParsedOutput, error) {
	log.Info("Creating and saving prompt, groupID: ", groupID, ", pubName: ", pubName, ", promptID: ", promptID)
	abTest, err := s.pub.GetABTest(ctx, pubName)
	if err != nil {
		return nil, fmt.Errorf("cannot get AB test by name, err=%w", err)
	}
	if abTest != nil {
		slices.SortFunc(abTest.PublicationsRatio, func(i, j entity.PublicationRatio) int {
			return cmp.Compare(i.HitRatio, j.HitRatio)
		})
		rn := rand.IntN(100)

		for _, p := range abTest.PublicationsRatio {
			if rn < p.HitRatio {
				pubName = p.PublicationIdentifier
				break
			}
		}
	}
	pub, err := s.pub.GetByGroupIDAndVersionIDAndPromptID(ctx, groupID, pubName, promptID)
	if err != nil {
		return nil, fmt.Errorf("cannot get published prompt by groupID, versionID and promptID, err=%w", err)
	}

	g, err := s.gr.GetByID(ctx, pub.GroupID)
	if err != nil {
		return nil, fmt.Errorf("cannot get group by ID, err=%v", err)
	}

	var p *entity.Prompt

	if pub.DevMode {
		p, err = s.pr.GetActivatedByPromptID(ctx, pub.PromptID)
		if err != nil {
			return nil, fmt.Errorf("cannot get activated prompt by ID, err=%v", err)
		}
		if p.Disabled {
			p, err = s.pr.GetByIntID(ctx, pub.PromptVersionID)
			if err != nil {
				return nil, fmt.Errorf("cannot get prompt by ID, err=%v", err)
			}
		}

	} else {
		p, err = s.pr.GetByIntID(ctx, pub.PromptVersionID)
		if err != nil {
			return nil, fmt.Errorf("cannot get prompt by ID, err=%v", err)
		}
	}

	fp, err := s.getFullPrompt(p, pp)
	if err != nil {
		return nil, fmt.Errorf("cannot get full prompt, err=%v", err)
	}
	sp, err := s.parsePromptParams(p.System, p.Params, pp)
	if err != nil {
		return nil, fmt.Errorf("cannot get system role prompt, err=%v", err)
	}
	up, err := s.getUserPrompt(p, pp)
	if err != nil {
		return nil, fmt.Errorf("cannot get user prompt, err=%v", err)
	}
	result := &entity.PromptParsedOutput{
		PromptName:        p.Name,
		GroupName:         g.Name,
		PromptVersionID:   p.ID,
		PublishIdentifier: pubName,
		Temerature:        p.Temperature,
		TopP:              p.TopP,
		CustomParams:      p.CustomParams,
		PromptParams:      pp,
		Disabled:          pub.Disabled,
		DevVersion:        pub.DevMode,
		FullPrompt:        fp,
		SystemRolePrompt:  sp,
		UserPrompt:        up,
		Prompt:            p.Prompt,
		OutputPrompt:      p.OutputPrompt,
		Params:            p.Params,
		CreatedAt:         time.Now(),
		OutputExamples:    p.OutputExamples,
		ExecutionType:     p.ExecutionType,
		OutputType:        p.OutputType,
		System:            p.System,
		ParentName:        "", //TODO add to pub and pass here
	}
	oID, err := s.repo.Save(ctx, result)
	if err != nil {
		return nil, fmt.Errorf("cannot save prompt, err=%v", err)
	}
	result.ID = oID
	return result, nil
}

func (s *Service) getFullPrompt(p *entity.Prompt, pp map[string]interface{}) (string, error) {
	templ :=
		`{{ if .System }}
{{ .System }}
{{ end }}
{{ if .Prompt }}
{{ .Prompt }}
{{ end }}
{{ if .OutputPrompt }}
 Response only in format:
{{ .OutputPrompt }}
{{ end }}
{{ if .OutputExamples }}
Example outputs:
{{ range .OutputExamples }}
- {{ . }}
{{ end }}
{{ end }}`
	tmpl, err := template.New("promptfull").Parse(templ)
	if err != nil {
		return "", fmt.Errorf("cannot parse template: %v", err)
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
		return "", fmt.Errorf("cannot parse template: %v", err)
	}
	return s.parsePromptParams(buf.String(), p.Params, pp)
}

func (s *Service) parsePromptParams(prompt string, params []string, pp map[string]interface{}) (string, error) {
	if len(pp) == 0 {
		return prompt, nil
	}
	tmpl, err := template.New("promptparams").Parse(prompt)
	if err != nil {
		return "", fmt.Errorf("cannot parse template: %v", err)
	}
	npp := make(map[string]interface{})
	for _, par := range params {
		v, ok := pp[par]
		if ok {
			npp[par] = v
		}
	}
	buf := new(bytes.Buffer)
	err = tmpl.Execute(buf, npp)
	if err != nil {
		return "", fmt.Errorf("cannot parse template: %v", err)
	}
	return buf.String(), nil
}

func (s *Service) getUserPrompt(p *entity.Prompt, pp map[string]interface{}) (string, error) {
	templ :=
		`{{ if .Prompt }}
{{ .Prompt }}
{{ end }}
{{ if .OutputPrompt }}
Response only in format:
{{ .OutputPrompt }}
{{ end }}
{{ if .OutputExamples }}
Example outputs:
{{ range .OutputExamples }}
- {{ . }}
{{ end }}
{{ end }}`
	tmpl, err := template.New("promptuser").Parse(templ)
	if err != nil {
		return "", fmt.Errorf("cannot parse template: %v", err)
	}
	type Inputs struct {
		Prompt         string
		OutputPrompt   string
		OutputExamples []string
	}
	buf := new(bytes.Buffer)
	err = tmpl.Execute(buf, Inputs{
		Prompt:         p.Prompt,
		OutputPrompt:   p.OutputPrompt,
		OutputExamples: p.OutputExamples,
	})
	if err != nil {
		return "", fmt.Errorf("cannot parse template: %v", err)
	}
	return s.parsePromptParams(buf.String(), p.Params, pp)
}

func (s *Service) GetByID(ctx context.Context, pID string) (*entity.PromptParsedOutput, error) {
	return s.repo.GetByID(ctx, pID)
}
