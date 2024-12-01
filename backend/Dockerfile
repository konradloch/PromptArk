FROM golang:1.22-alpine AS builder

RUN apk add --update make
WORKDIR /app
COPY . .

ENV GOOS linux
ENV GOARCH amd64
ENV CGO_ENABLED 0

RUN go build -tags timetzdata -ldflags="-s -w" -o .build/prompt-analyzer ./cmd/main.go

FROM alpine:latest

COPY --from=builder /app/.build/prompt-analyzer /usr/bin/prompt-analyzer

ENTRYPOINT ["prompt-analyzer"]
