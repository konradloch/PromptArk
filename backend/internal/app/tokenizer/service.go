package tokenizer

import (
	"fmt"

	"github.com/pkoukk/tiktoken-go"
	log "github.com/sirupsen/logrus"
)

func CountTokens(prompt string) int {
	encoding := "cl100k_base"

	tke, err := tiktoken.GetEncoding(encoding)

	if err != nil {
		err = fmt.Errorf("getEncoding: %v", err)
		log.Error(err)
		return 0
	}

	token := tke.Encode(prompt, nil, nil)

	return len(token)
}
