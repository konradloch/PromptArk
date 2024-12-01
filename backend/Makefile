SVC_NAME = prompt-analyzer

BUILD_VERSION := `git rev-parse HEAD`
BUILD_DIR=.build
DOCKER_IMAGE = $(SVC_NAME):$(BUILD_VERSION)

all: build run

build:
	go build -o $(BUILD_DIR)/$(SVC_NAME) ./cmd/.

run:
	env $$(cat default.env) $(BUILD_DIR)/$(SVC_NAME)

build-docker:
	go mod vendor
	docker build -t $(DOCKER_IMAGE) .
	rm -rf vendor

env:
	docker run -d --network host --name prompt-analyzer-mongo -e MONGO_INITDB_DATABASE=prompt-analyzer -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=secret mongo

clean-env:
	docker rm -f prompt-analyzer-mongo