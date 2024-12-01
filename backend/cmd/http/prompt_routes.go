package http

import (
	"github.com/labstack/echo/v4"
	"prompt-analyzer/internal/app/prompt"
	"prompt-analyzer/internal/platform/mongo"
)

func AddPromptRouters(echo *echo.Echo) {
	m := mongo.NewConnection()
	promptRepo := prompt.NewRepository(m)
	promptSvc := prompt.NewService(promptRepo)
	h := prompt.NewHTTPHandler(promptSvc)
	echo.POST("group/:groupId/prompts", h.Create)
	echo.POST("group/:groupId/prompts/:promptId", h.CreateNewVersion)
	echo.GET("group/:groupId/prompts", h.GetActivatedByGroupID)
	echo.GET("group/:id/token/total", h.GetTotalTokenCountByGroupId)
	echo.GET("prompts/:promptId/active", h.GetActivatedByPromptID)
	echo.GET("group/:groupId/prompts/:promptId", h.GetByGroupIDAndPromptID)
	echo.GET("prompts/:id", h.GetByID)
	echo.GET("prompts/:id/template", h.GetPromptTemplateByID)
	echo.PATCH("prompts/:id/activate", h.ChangeActivatedPrompt)
	echo.DELETE("prompts/:promptId", h.DisablePrompt)
}
