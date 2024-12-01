package server

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func StartServer(routers ...func(echo *echo.Echo)) {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	for _, r := range routers {
		r(e)
	}

	e.Logger.Fatal(e.Start(":8000"))
}
