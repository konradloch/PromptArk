package analyzer

import (
	"fmt"
	"net/http"
	"prompt-analyzer/internal/platform/pagination"
	"strings"
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

func (h *HTTPHandler) GetAll(c echo.Context) error {
	ctx := pagination.SetPaginationParams(c.Request().Context(), c.QueryParam("page"), c.QueryParam("limit"))
	var from, to time.Time
	var err error
	if c.QueryParam("from") != "" {
		from, err = time.Parse(time.RFC3339, c.QueryParam("from"))
		if err != nil {
			fmt.Println(err)
			return c.JSON(http.StatusBadRequest, singleError("from query parameter is invalid"))
		}
	}
	if c.QueryParam("to") != "" {
		to, err = time.Parse(time.RFC3339, c.QueryParam("to"))
		if err != nil {
			return c.JSON(http.StatusBadRequest, singleError("to query parameter is invalid"))
		}
	}

	f := Filter{
		PromptName:          c.QueryParam("promptName"),
		GroupName:           c.QueryParam("groupName"),
		Status:              c.QueryParam("status"),
		CorrelationID:       c.QueryParam("correlationId"),
		PublisherIdentifier: c.QueryParam("publisherIdentifier"),
		From:                from,
		To:                  to,
	}

	groups, ctr, err := h.svc.GetAllDetailedByFilter(ctx, f)
	if err != nil {
		return err
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot save, err: %v", err)))
	}
	p, l := pagination.GetPaginationParams(ctx)
	return c.JSON(http.StatusOK, response{
		Data: groups,
		Pagination: responsePagination{
			Page:  int(p),
			Limit: int(l),
			Size:  ctr,
		},
	})
}

func (h *HTTPHandler) GetFiltersOptions(c echo.Context) error {
	qp := c.QueryParam("names")
	if qp == "" {
		return c.JSON(http.StatusBadRequest, singleError("names query parameter is required"))
	}
	groups, err := h.svc.GetFilterOptions(c.Request().Context(), strings.Split(qp, ","))
	if err != nil {
		return err
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get, err: %v", err)))
	}
	return c.JSON(http.StatusOK, groups)
}
