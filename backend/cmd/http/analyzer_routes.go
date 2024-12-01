package http

import (
	"prompt-analyzer/internal/app/analyzer"
	"prompt-analyzer/internal/app/group"
	"prompt-analyzer/internal/app/output"
	"prompt-analyzer/internal/app/prompt"
	"prompt-analyzer/internal/app/publication"
	"prompt-analyzer/internal/platform/mongo"

	"github.com/labstack/echo/v4"
)

func AddAnalyzerRouters(echo *echo.Echo) {
	m := mongo.NewConnection()
	or := output.NewRepository(m)
	groupRepo := group.NewRepository(m)
	groupSvc := group.NewService(groupRepo)
	promptRepo := prompt.NewRepository(m)
	promptSvc := prompt.NewService(promptRepo)
	pubRepo := publication.NewRepository(m)
	pubSvc := publication.NewService(pubRepo, promptSvc, groupSvc)
	osvc := output.NewService(groupSvc, promptSvc, pubSvc, or)

	aRepo := analyzer.NewRepository(m)

	aSvc := analyzer.NewService(aRepo, osvc)

	h := analyzer.NewHTTPHandler(aSvc)
	echo.GET("analyzer", h.GetAll)
	echo.GET("analyzer/options", h.GetFiltersOptions)
}
