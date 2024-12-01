package publication

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"prompt-analyzer/internal/platform/pagination"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	log "github.com/sirupsen/logrus"
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

func (h *HTTPHandler) GetPrompt(c echo.Context) error {
	promptName := c.Param("promptName")
	pubName := c.Param("pubName")
	prompt, err := h.svc.GetPromptPub(c.Request().Context(), pubName, promptName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by pubName and promptName, err: %v", err)))
	}
	return c.JSON(http.StatusOK, prompt)
}

func (h *HTTPHandler) GetABTestAvaliablePublications(c echo.Context) error {
	promptName := c.Param("pubName")
	prompt, err := h.svc.GetABTestAvaliablePrompts(c.Request().Context(), promptName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get avaliable a/b tests by pubName, err: %v", err)))
	}
	return c.JSON(http.StatusOK, prompt)
}

func (h *HTTPHandler) Publish(c echo.Context) error {
	var p payload
	err := json.NewDecoder(c.Request().Body).Decode(&p)
	if err != nil {
		log.Error("cannot publish", err)
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
			log.Error("cannot publish", out)
			return c.JSON(http.StatusBadRequest, map[string]interface{}{"errors": out})
		}
		log.Error("cannot publish", err)
		return c.JSON(http.StatusBadRequest, singleError("payload is invalid"))
	}
	err = h.svc.PublishPromptsByGroupID(c.Request().Context(), p.GroupID, p.Name)
	if err != nil {
		log.Error("cannot publish", err)
		if errors.Is(err, ErrAlreadyPublished) {
			return c.JSON(http.StatusConflict, singleError("already published"))
		}
		return c.JSON(http.StatusInternalServerError, singleError("cannot publish"))
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *HTTPHandler) AddABTest(c echo.Context) error {
	pubName := c.Param("pubName")
	if pubName == "" {
		return c.JSON(http.StatusBadRequest, singleError("pubName is required"))
	}
	var p []abTestPayload
	err := json.NewDecoder(c.Request().Body).Decode(&p)
	if err != nil {
		log.Error("cannot add ab tests", err)
		return c.JSON(http.StatusBadRequest, singleError("payload has invalid structure"))
	}
	err = h.svc.AddABTest(c.Request().Context(), pubName, p)
	if err != nil {
		log.Error("cannot publish", err)
		return c.JSON(http.StatusInternalServerError, singleError("cannot publish"))
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *HTTPHandler) GetABTestByPublicationName(c echo.Context) error {
	promptID := c.Param("pubName")
	ps, err := h.svc.GetABTest(c.Request().Context(), promptID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by promptID, err: %v", err)))
	}
	return c.JSON(http.StatusOK, ps)
}

func (h *HTTPHandler) GetABTest(c echo.Context) error {
	pubName := c.Param("pubName")
	abTest, err := h.svc.GetABTest(c.Request().Context(), pubName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get ab test by pubName, err: %v", err)))
	}
	if abTest == nil {
		return c.JSON(http.StatusNotFound, singleError(fmt.Sprintf("cannot find ab test by pubName, err: %v", err)))
	}
	return c.JSON(http.StatusOK, abTest)
}

func (h *HTTPHandler) GetAll(c echo.Context) error {
	ctx := pagination.SetPaginationParams(c.Request().Context(), c.QueryParam("page"), c.QueryParam("limit"))
	groups, ctr, err := h.svc.GetAllPublishedGrouped(ctx, c.QueryParam("search"))
	if err != nil {
		return err
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot save, err: %v", err)))
	}
	p, l := pagination.GetPaginationParams(ctx)
	return c.JSON(http.StatusOK, response{Data: groups, Pagination: responsePagination{Size: ctr, Page: int(p), Limit: int(l)}})
}

func (h *HTTPHandler) GetByPromptID(c echo.Context) error {
	promptID := c.Param("promptId")
	ps, err := h.svc.GetByPromptID(c.Request().Context(), promptID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by promptID, err: %v", err)))
	}
	return c.JSON(http.StatusOK, ps)
}

func (h *HTTPHandler) DisableAllByPubName(c echo.Context) error {
	pubName := c.Param("pubName")
	err := h.svc.DisableAllByPubID(c.Request().Context(), pubName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by promptID, err: %v", err)))
	}
	return c.NoContent(http.StatusOK)
}

func (h *HTTPHandler) DevModeAllByPubName(c echo.Context) error {
	pubName := c.Param("pubName")
	err := h.svc.DevModeAllByPubID(c.Request().Context(), pubName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by promptID, err: %v", err)))
	}
	return c.NoContent(http.StatusOK)
}

func (h *HTTPHandler) SoftDeleteByName(c echo.Context) error {
	pubName := c.Param("pubName")
	err := h.svc.SoftDeleteByName(c.Request().Context(), pubName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get by promptID, err: %v", err)))
	}
	return c.NoContent(http.StatusOK)
}
