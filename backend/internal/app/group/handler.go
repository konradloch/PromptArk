package group

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"prompt-analyzer/internal/entity"
	"prompt-analyzer/internal/platform/pagination"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
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
	err = h.svc.CreateNewGroup(c.Request().Context(), entity.Group{
		Name:         p.Name,
		Description:  p.Description,
		TimeCreation: time.Now(),
	})
	if err != nil {
		if errors.Is(err, ErrAlreadyExists) {
			return c.JSON(http.StatusConflict, singleError(err.Error()))
		}
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot save, err: %v", err)))
	}
	return c.JSON(http.StatusCreated, document{
		ID:          "",
		Name:        "",
		Description: "",
		CreatedAt:   time.Time{},
	})
}

func (h *HTTPHandler) GetAll(c echo.Context) error {
	ctx := pagination.SetPaginationParams(c.Request().Context(), c.QueryParam("page"), c.QueryParam("limit"))
	groups, ctr, err := h.svc.GetAll(ctx, c.QueryParam("name"))
	if err != nil {
		return err
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot save, err: %v", err)))
	}
	resp := make([]responseData, len(groups))
	for i, p := range groups {
		resp[i] = responseData{
			ID:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			TimeCreation: p.TimeCreation,
		}
	}
	p, l := pagination.GetPaginationParams(ctx)
	return c.JSON(http.StatusOK, response{Data: resp, Pagination: responsePagination{Page: int(p), Limit: int(l), Size: ctr}})
}

func (h *HTTPHandler) DeleteByID(c echo.Context) error {
	err := h.svc.DeleteByID(c.Request().Context(), c.Param("id"))
	if err != nil {
		return err
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot delete, err: %v", err)))
	}
	return c.NoContent(http.StatusOK)
}
