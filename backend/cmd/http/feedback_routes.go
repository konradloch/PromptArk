package http

import (
	"prompt-analyzer/internal/app/feedback"
	"prompt-analyzer/internal/app/group"
	"prompt-analyzer/internal/app/prompt"
	"prompt-analyzer/internal/app/publication"
	"prompt-analyzer/internal/platform/mongo"

	"github.com/labstack/echo/v4"
)

func AddFeedbackRouters(echo *echo.Echo) {
	m := mongo.NewConnection()

	pubRepo := publication.NewRepository(m)
	pRepo := prompt.NewRepository(m)
	pSvc := prompt.NewService(pRepo)
	gRepo := group.NewRepository(m)
	gSvc := group.NewService(gRepo)
	pubSvc := publication.NewService(pubRepo, pSvc, gSvc)

	fRepo := feedback.NewRepository(m)
	fSvc := feedback.NewService(fRepo, pubSvc)

	h := feedback.NewHTTPHandler(fSvc)
	echo.GET("feedback", h.GetAll)
	echo.GET("feedback/group/:gID/publication/:pubID", h.GetSubFeedback)
	echo.GET("feedback/options", h.GetFiltersOptions)
}
