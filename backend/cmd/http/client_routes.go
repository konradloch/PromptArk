package http

import (
	"prompt-analyzer/internal/app/analyzer"
	"prompt-analyzer/internal/app/client"
	"prompt-analyzer/internal/app/feedback"
	"prompt-analyzer/internal/app/group"
	"prompt-analyzer/internal/app/output"
	"prompt-analyzer/internal/app/prompt"
	"prompt-analyzer/internal/app/publication"
	statistics "prompt-analyzer/internal/app/statistic"
	"prompt-analyzer/internal/platform/mongo"

	"github.com/labstack/echo/v4"
)

func AddClientRoutes(echo *echo.Echo) {
	m := mongo.NewConnection()
	or := output.NewRepository(m)
	groupRepo := group.NewRepository(m)
	groupSvc := group.NewService(groupRepo)
	promptRepo := prompt.NewRepository(m)
	promptSvc := prompt.NewService(promptRepo)
	pubRepo := publication.NewRepository(m)
	pubSvc := publication.NewService(pubRepo, promptSvc, groupSvc)
	osvc := output.NewService(groupSvc, promptSvc, pubSvc, or)
	arepo := analyzer.NewRepository(m)
	asvc := analyzer.NewService(arepo, osvc)
	frepo := feedback.NewRepository(m)
	fsvc := feedback.NewService(frepo, pubSvc)
	statDao := statistics.NewRepository(m)
	ssvc := statistics.NewService(statDao)
	csvc := client.NewService(osvc, asvc, fsvc, ssvc)
	ch := client.NewHTTPHandler(csvc)
	echo.POST("/group/:groupId/publisher/:verId/prompt/:promptId", ch.GetPublishedPrompt)
	echo.POST("/prompt/analyzer", ch.CreateAnalyzeRecord)
	echo.POST("/prompt/feedback", ch.CreateFeedbackRecord)
}
