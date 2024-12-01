package feedback

type apiError struct {
	JSONVariable string `json:"jsonVariable,omitempty"`
	Message      string `json:"message,omitempty"`
}

func singleError(text string) map[string]interface{} {
	return map[string]interface{}{"errors": apiError{Message: text}}
}
