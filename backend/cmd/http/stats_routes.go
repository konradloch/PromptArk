package http

import (
	statistics "prompt-analyzer/internal/app/statistic"
	"prompt-analyzer/internal/platform/mongo"

	"github.com/labstack/echo/v4"
)

func AddStatisticsRoutes(echo *echo.Echo) {
	m := mongo.NewConnection()

	pRepo := statistics.NewRepository(m)
	sSvc := statistics.NewService(pRepo)

	h := statistics.NewHTTPHandler(sSvc)
	echo.GET("statistics", h.GetStatistics)
}
