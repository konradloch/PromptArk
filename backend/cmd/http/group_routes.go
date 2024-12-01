package http

import (
	"github.com/labstack/echo/v4"
	"prompt-analyzer/internal/app/group"
	"prompt-analyzer/internal/platform/mongo"
)

func AddGroupRouters(echo *echo.Echo) {
	m := mongo.NewConnection()

	groupRepo := group.NewRepository(m)
	groupSvc := group.NewService(groupRepo)

	h := group.NewHTTPHandler(groupSvc)
	echo.POST("group", h.Create)
	echo.GET("group", h.GetAll)
	echo.DELETE("group/:id", h.DeleteByID)
}
