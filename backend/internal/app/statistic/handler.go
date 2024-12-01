package statistics

import (
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type HTTPHandler struct {
	svc *Service
}

func NewHTTPHandler(service *Service) *HTTPHandler {
	return &HTTPHandler{
		svc: service,
	}
}

func (h *HTTPHandler) GetStatistics(c echo.Context) error {
	stats, err := h.svc.GetByNamesAndDuration(c.Request().Context(), nil, time.Hour*24)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, singleError(fmt.Sprintf("cannot get stats, err: %v", err)))
	}
	return c.JSON(http.StatusOK, stats)
}
