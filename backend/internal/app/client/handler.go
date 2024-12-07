package client

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"prompt-analyzer/internal/entity"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type HTTPHandler struct {
	s        *Service
	validate *validator.Validate
}

func NewHTTPHandler(service *Service) *HTTPHandler {
	return &HTTPHandler{
		s:        service,
		validate: validator.New(validator.WithRequiredStructEnabled()),
	}
}

func (h *HTTPHandler) GetPublishedPrompt(c echo.Context) error {
	groupID := c.Param("groupId")
	versionID := c.Param("verId")
	promptId := c.Param("promptId")
	if groupID == "" || versionID == "" || promptId == "" {
		return echo.ErrBadRequest
	}

	var params map[string]interface{}
	err := json.NewDecoder(c.Request().Body).Decode(&params)
	if err != nil {
		if err == io.EOF {
			params = make(map[string]interface{})
		} else {
			return echo.NewHTTPError(400, "payload has invalid structure")
		}
	}

	p, err := h.s.GetPublishedPrompt(c.Request().Context(), groupID, versionID, promptId, params)
	if err != nil {
		if errors.Is(err, entity.ErrNotFound) {
			return echo.NewHTTPError(404, "prompt not found")
		}
		return echo.NewHTTPError(500, "internal server error")
	}
	return c.JSON(200, p)
}

func (h *HTTPHandler) CreateAnalyzeRecord(c echo.Context) error {
	var p entity.AnalyzerPayload
	err := json.NewDecoder(c.Request().Body).Decode(&p)

	if err != nil {
		return echo.NewHTTPError(400, "payload has invalid structure")
	}

	if p.Status != "success" && p.Status != "error" {
		return echo.NewHTTPError(400, "payload has invalid status")
	}
	if p.PromptID != "" {
		err = h.validate.Struct(p)
		if err != nil {
			var ve validator.ValidationErrors
			if errors.As(err, &ve) {
				out := make([]apiError, len(ve))
				for i, fe := range ve {
					out[i] = apiError{fe.Field(), "This field is required"}
				}
				return echo.NewHTTPError(400, map[string]interface{}{"errors": out})
			}
			return echo.NewHTTPError(400, "payload is invalid")
		}
	}
	err = h.s.CreateAnalyzeRecord(c.Request().Context(), p)
	if err != nil {
		fmt.Println(err)
		return echo.NewHTTPError(500, "cannot create analyze record")
	}
	return c.NoContent(204)
}

func (h *HTTPHandler) CreateFeedbackRecord(c echo.Context) error {
	var p entity.FeedbackPayload
	err := json.NewDecoder(c.Request().Body).Decode(&p)
	if err != nil {
		return echo.NewHTTPError(400, "payload has invalid structure")
	}
	err = h.validate.Struct(p)
	if err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]apiError, len(ve))
			for i, fe := range ve {
				out[i] = apiError{fe.Field(), "This field is required"}
			}
			return echo.NewHTTPError(400, map[string]interface{}{"errors": out})
		}
		return echo.NewHTTPError(400, "payload is invalid")
	}
	err = h.s.CreateFeedbackRecord(c.Request().Context(), p)
	if err != nil {
		return echo.NewHTTPError(500, "cannot create feedback record")
	}
	return c.NoContent(204)
}
