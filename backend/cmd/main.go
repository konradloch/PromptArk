package main

import (
	"prompt-analyzer/cmd/http"
	"prompt-analyzer/cmd/openapi"
	"prompt-analyzer/internal/platform/server"
)

func main() {
	go openapi.OpenAPI2()
	server.StartServer(http.AddPromptRouters, http.AddGroupRouters, http.AddPublicationRouters, http.AddFeedbackRouters, http.AddAnalyzerRouters, http.AddClientRoutes, http.AddStatisticsRoutes)
}
