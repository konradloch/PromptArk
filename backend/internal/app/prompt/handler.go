package prompt

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"net/http"
	"prompt-analyzer/internal/entity"
)

type HTTPHandler struct {
	validate *validator.Validate
	svc      *Service
}

func NewHTTPHandler(service *Service) *HTTPHandler {
	return &HTTPHandler{
		svc:      service,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

func (h *HTTPHandler) Create(c echo.Context) error {
	var p templatePayload
	err := json.NewDecoder(c.Request().Body).Decode(&p)
	if err != nil {
		return c.JSON(http.StatusBadRequest, singleError("payload has invalid structure"))
	}
	err = h.validate.Struct(p)
	if err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]apiError, len(ve))
			for i, fe := range ve {
				out[i] = apiError{fe.Field(), "This field is required"}
			}
			return c.JSON(http.StatusBadRequest, map[string]interface{}{"errors": out})
		}
		return c.JSON(http.StatusBadRequest, singleError("payload is invalid"))
	}
	groupID := c.Param("groupId")
	if err != nil {
		return c.JSON(http.StatusBadRequest, singleError(fmt.Sprintf("cannot get groupID, err: %v", err)))
	}
	err = h.svc.CreateNewPrompt(c.Request().Context(), entity.Prompt{ //TODO maybe simple payload will be better?
		Name:          p.Name,
		Description:   p.Description,
		ExecutionType: p.ExecutionType,
		OutputType:    p.OutputType,
		ParentID:      p.ParentID,
		GroupID:       groupID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot save, err: %v", err)))
	}
	return c.NoContent(http.StatusCreated)
}

func (h *HTTPHandler) CreateNewVersion(c echo.Context) error {
	var p payload
	err := json.NewDecoder(c.Request().Body).Decode(&p)
	if err != nil {
		return c.JSON(http.StatusBadRequest, singleError("payload has invalid structure"))
	}
	err = h.validate.Struct(p)
	if err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]apiError, len(ve))
			for i, fe := range ve {
				out[i] = apiError{fe.Field(), "This field is required"}
			}
			return c.JSON(http.StatusBadRequest, map[string]interface{}{"errors": out})
		}
		return c.JSON(http.StatusBadRequest, singleError("payload is invalid"))
	}
	groupID := c.Param("groupId")
	promptID := c.Param("promptId")
	if err != nil {
		return c.JSON(http.StatusBadRequest, singleError(fmt.Sprintf("cannot get groupID, err: %v", err)))
	}

	prompt, err := h.svc.CreateNewPromptVersion(c.Request().Context(), promptID, entity.Prompt{ //TODO maybe simple payload will be better?
		Name:           p.Name,
		System:         p.System,
		Description:    p.Description,
		OutputType:     p.OutputType,
		ExecutionType:  p.ExecutionType,
		Prompt:         p.Prompt,
		OutputPrompt:   p.OutputPrompt,
		Params:         p.Params,
		Temperature:    p.Temperature,
		TopP:           p.P,
		ParentID:       p.ParentID,
		GroupID:        groupID,
		OutputExamples: p.OutputExamples,
		CustomParams:   p.CustomParams,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot save, err: %v", err)))
	}
	return c.JSON(http.StatusOK, response{
		ID:             prompt.ID,
		PromptID:       prompt.PromptID,
		Description:    prompt.Description,
		OutputType:     prompt.OutputType,
		ExecutionType:  prompt.ExecutionType,
		Name:           prompt.Name,
		System:         prompt.System,
		Prompt:         prompt.Prompt,
		OutputPrompt:   prompt.OutputPrompt,
		Params:         prompt.Params,
		Temperature:    prompt.Temperature,
		P:              prompt.TopP,
		ParentID:       prompt.ParentID,
		CreatedAt:      prompt.CreatedAt,
		Activated:      prompt.Activated,
		OutputExamples: prompt.OutputExamples,
		CustomParams:   prompt.CustomParams,
		GroupID:        prompt.GroupID,
	})
}

func (h *HTTPHandler) GetActivatedByGroupID(c echo.Context) error {
	groupID := c.Param("groupId")
	prompts, err := h.svc.GetActivatedByGroupID(c.Request().Context(), groupID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by groupID, err: %v", err)))
	}
	r := make([]response, len(prompts))
	for i, p := range prompts {
		r[i] = response{
			ID:             p.ID,
			PromptID:       p.PromptID,
			Description:    p.Description,
			OutputType:     p.OutputType,
			ExecutionType:  p.ExecutionType,
			Name:           p.Name,
			System:         p.System,
			Prompt:         p.Prompt,
			OutputPrompt:   p.OutputPrompt,
			Params:         p.Params,
			Temperature:    p.Temperature,
			P:              p.TopP,
			ParentID:       p.ParentID,
			CreatedAt:      p.CreatedAt,
			Activated:      p.Activated,
			OutputExamples: p.OutputExamples,
			CustomParams:   p.CustomParams,
			GroupID:        p.GroupID,
		}
	}
	return c.JSON(http.StatusOK, r)
}

func (h *HTTPHandler) GetActivatedByPromptID(c echo.Context) error {
	promptID := c.Param("promptId")
	p, err := h.svc.GetActivatedByPromptID(c.Request().Context(), promptID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by promptID, err: %v", err)))
	}
	r := response{
		ID:             p.ID,
		PromptID:       p.PromptID,
		Description:    p.Description,
		OutputType:     p.OutputType,
		ExecutionType:  p.ExecutionType,
		Name:           p.Name,
		System:         p.System,
		Prompt:         p.Prompt,
		OutputPrompt:   p.OutputPrompt,
		Params:         p.Params,
		Temperature:    p.Temperature,
		P:              p.TopP,
		ParentID:       p.ParentID,
		CreatedAt:      p.CreatedAt,
		Activated:      p.Activated,
		OutputExamples: p.OutputExamples,
		CustomParams:   p.CustomParams,
		GroupID:        p.GroupID,
	}
	return c.JSON(http.StatusOK, r)
}

func (h *HTTPHandler) GetByGroupIDAndPromptID(c echo.Context) error {
	groupID := c.Param("groupId")
	promptID := c.Param("promptId")
	prompts, err := h.svc.GetAllByGroupIDAndPromptID(c.Request().Context(), groupID, promptID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by groupID and promptID, err: %v", err)))
	}
	r := make([]response, len(prompts))
	for i, p := range prompts {
		r[i] = response{
			ID:             p.ID,
			PromptID:       p.PromptID,
			Description:    p.Description,
			OutputType:     p.OutputType,
			ExecutionType:  p.ExecutionType,
			Name:           p.Name,
			System:         p.System,
			Prompt:         p.Prompt,
			OutputPrompt:   p.OutputPrompt,
			Params:         p.Params,
			Temperature:    p.Temperature,
			P:              p.TopP,
			ParentID:       p.ParentID,
			CreatedAt:      p.CreatedAt,
			Activated:      p.Activated,
			OutputExamples: p.OutputExamples,
			CustomParams:   p.CustomParams,
			GroupID:        p.GroupID,
		}
	}
	return c.JSON(http.StatusOK, r)
}

func (h *HTTPHandler) GetByID(c echo.Context) error {
	ID := c.Param("id")
	p, err := h.svc.GetByIntID(c.Request().Context(), ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by ID, err: %v", err)))
	}
	return c.JSON(http.StatusOK, response{
		ID:             p.ID,
		PromptID:       p.PromptID,
		Description:    p.Description,
		OutputType:     p.OutputType,
		ExecutionType:  p.ExecutionType,
		Name:           p.Name,
		System:         p.System,
		Prompt:         p.Prompt,
		OutputPrompt:   p.OutputPrompt,
		Params:         p.Params,
		Temperature:    p.Temperature,
		P:              p.TopP,
		ParentID:       p.ParentID,
		CreatedAt:      p.CreatedAt,
		Activated:      p.Activated,
		OutputExamples: p.OutputExamples,
		CustomParams:   p.CustomParams,
		GroupID:        p.GroupID,
	})
}

func (h *HTTPHandler) GetTotalTokenCountByGroupId(c echo.Context) error {
	ID := c.Param("id")
	p, err := h.svc.GetTotalTokenCountByGroupId(c.Request().Context(), ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by ID, err: %v", err)))
	}
	return c.JSON(http.StatusOK, responseTokenTotal{TotalTokens: p})
}

func (h *HTTPHandler) GetPromptTemplateByID(c echo.Context) error {
	ID := c.Param("id")
	p, err := h.svc.GetFormatedPromptByIntID(c.Request().Context(), ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by ID, err: %v", err)))
	}
	return c.JSON(http.StatusOK, *p)
}

func (h *HTTPHandler) ChangeActivatedPrompt(c echo.Context) error {
	ID := c.Param("id")
	err := h.svc.ChangeActivatedPrompt(c.Request().Context(), ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot change activated by ID, err: %v", err)))
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *HTTPHandler) DisablePrompt(c echo.Context) error {
	ID := c.Param("promptId")
	err := h.svc.SoftDeleteByPromptID(c.Request().Context(), ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot disable by ID, err: %v", err)))
	}
	return c.NoContent(http.StatusNoContent)
}
