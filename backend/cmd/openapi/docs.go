package openapi

import (
	"encoding/json"
	"log"
	"time"

	"net/http"
	http2 "net/http"

	"github.com/kelseyhightower/envconfig"
	"github.com/swaggest/openapi-go"
	"github.com/swaggest/openapi-go/openapi31"
	"github.com/swaggest/rest/web"
	swgui "github.com/swaggest/swgui/v5emb"
)

type CustomErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"detail,omitempty"`
}

func ErrorHandler(err error, w http.ResponseWriter, r *http.Request) {
	response := CustomErrorResponse{
		Code:    http.StatusInternalServerError,
		Message: "Internal Server Error",
	}

	w.WriteHeader(response.Code)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)

}

type config struct {
	ApiUrl string `required:"true" split_words:"true"`
}

func OpenAPI2() {
	var config config
	envconfig.MustProcess("OPENAPI", &config)
	reflector := openapi31.NewReflector()
	s := web.NewService(reflector)
	reflector.Spec.WithServers(openapi31.Server{
		URL: config.ApiUrl,
	})
	reflector.Spec.Info.
		WithTitle("PromptArk API").
		WithVersion("v0.0.1").
		WithDescription("PromptArk API. Get published prompts, save analyze records, and save feedback records.")

	handleError(reflector.AddOperation(PromptGetter(reflector)))
	handleError(reflector.AddOperation(AnalyzerRecordSaver(reflector)))
	handleError(reflector.AddOperation(FeedbackRecordSaver(reflector)))

	s.Docs("/docs", swgui.New)
	if err := http2.ListenAndServe(":8011", s); err != nil {
		log.Fatal(err)
	}
}

func PromptGetter(reflector *openapi31.Reflector) openapi.OperationContext {
	type req struct {
		GroupName     string                 `path:"groupName" description:"Published group name."`
		PublisherName string                 `path:"publisherName" description:"Publication name."`
		PromptName    string                 `path:"promptName" description:"Published prompt name."`
		Mode          string                 `query:"mode" enum:"prod,dev" default:"prod" description:"Dev mode will fetch the most recent prompt version. Prod mode will fetch prompt version set in publication."`
		Params        map[string]interface{} `json:"params" description:"Parameters defined in prompt builder."`
	}

	type resp struct {
		ID                string                 `json:"id"`
		PromptName        string                 `json:"name"`
		PromptVersionID   string                 `json:"promptVersionId"`
		ParentName        string                 `json:"parentName"`
		PublishIdentifier string                 `json:"publishIdentifier"`
		GroupName         string                 `json:"groupName"`
		Disabled          bool                   `json:"disabled"`
		DevVersion        bool                   `json:"devVersion"`
		SystemRolePrompt  string                 `json:"systemRolePrompt"`
		UserPrompt        string                 `json:"userPrompt"`
		FullPrompt        string                 `json:"fullPrompt"`
		Temerature        int                    `json:"temperature"`
		TopP              int                    `json:"topP"`
		Params            []string               `json:"params"`
		PromptParams      map[string]interface{} `json:"promptParams"`
		CustomParams      map[string]string      `json:"customParams"`
	}

	type errReq struct {
		Message string `json:"message"`
	}

	postOp, _ := reflector.NewOperationContext(http.MethodPost, "/group/{groupName}/publisher/{publisherName}/prompt/{promptName}")
	postOp.SetDescription("Get published prompt by group, publisher, and prompt name.")
	postOp.SetSummary("Get published prompt by group, publisher, and prompt name.")
	postOp.SetTags("Prompt")
	postOp.AddReqStructure(new(req))
	postOp.AddRespStructure(new(resp))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusBadRequest))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusNotFound))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusInternalServerError))
	return postOp
}

func AnalyzerRecordSaver(reflector *openapi31.Reflector) openapi.OperationContext {
	type req struct {
		PromptID      string    `json:"promptId"`
		Status        string    `json:"status"`
		StatusMessage string    `json:"statusMessage"`
		CorrelationID string    `json:"correlationId"`
		ExecutionTime time.Time `json:"executionTime"`
		PromptOutput  string    `json:"promptOutput"`
	}
	type errReq struct {
		Message string `json:"message"`
	}

	postOp, _ := reflector.NewOperationContext(http.MethodPost, "/prompt/analyzer")
	postOp.SetDescription("Create analyze record.")
	postOp.SetSummary("Create analyze record.")
	postOp.SetTags("Analyzer")
	postOp.AddReqStructure(new(req))
	postOp.AddRespStructure(nil, openapi.WithHTTPStatus(http.StatusNoContent))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusBadRequest))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusNotFound))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusInternalServerError))
	return postOp
}

func FeedbackRecordSaver(reflector *openapi31.Reflector) openapi.OperationContext {
	type req struct {
		Positive           *bool  `json:"positive"`
		Type               string `json:"type"`
		ObjectName         string `json:"objectName"`
		PublicationVersion string `json:"publicationVersion"`
	}

	type errReq struct {
		Message string `json:"message"`
	}

	postOp, _ := reflector.NewOperationContext(http.MethodPost, "/prompt/feedback")
	postOp.SetDescription("Create feedback record.")
	postOp.SetSummary("Create feedback record.")
	postOp.SetTags("Feedback")
	postOp.AddReqStructure(new(req))
	postOp.AddRespStructure(nil, openapi.WithHTTPStatus(http.StatusNoContent))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusBadRequest))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusNotFound))
	postOp.AddRespStructure(new(errReq), openapi.WithHTTPStatus(http.StatusInternalServerError))
	return postOp
}

func handleError(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
