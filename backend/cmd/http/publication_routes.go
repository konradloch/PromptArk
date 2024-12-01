package http

import (
	"prompt-analyzer/internal/app/group"
	"prompt-analyzer/internal/app/prompt"
	"prompt-analyzer/internal/app/publication"
	"prompt-analyzer/internal/platform/mongo"

	"github.com/labstack/echo/v4"
)

func AddPublicationRouters(echo *echo.Echo) {
	m := mongo.NewConnection()

	pubRepo := publication.NewRepository(m)
	pRepo := prompt.NewRepository(m)
	pSvc := prompt.NewService(pRepo)
	gRepo := group.NewRepository(m)
	gSvc := group.NewService(gRepo)
	pubSvc := publication.NewService(pubRepo, pSvc, gSvc)

	h := publication.NewHTTPHandler(pubSvc)
	echo.POST("publish", h.Publish)
	echo.GET("publications", h.GetAll)
	echo.GET("publications/:pubName/prompt/:promptName", h.GetPrompt)
	echo.GET("publications/prompt/:promptId", h.GetByPromptID)
	echo.GET("publications/abtest/availability/:pubName", h.GetABTestAvaliablePublications)
	echo.POST("publications/abtest/:pubName", h.AddABTest)
	echo.GET("publications/abtest/:pubName", h.GetABTest)
	echo.DELETE("publications/:pubName", h.SoftDeleteByName)
	echo.PATCH("publications/:pubName/devmode", h.DevModeAllByPubName)
	echo.PATCH("publications/:pubName/disable", h.DisableAllByPubName)
}
