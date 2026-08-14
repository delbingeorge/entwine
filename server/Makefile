GOLANGCI_LINT_VERSION := v2.6.2
TOOLS_BIN := $(CURDIR)/bin

.PHONY: build run test lint vet tidy-check tools check

build:
	go build -o $(TOOLS_BIN)/api ./cmd/api

run:
	go run ./cmd/api

test:
	go test -race ./...

vet:
	go vet ./...

lint: tools
	$(TOOLS_BIN)/golangci-lint run ./...

tidy-check:
	go mod tidy -diff

tools:
	@test -x $(TOOLS_BIN)/golangci-lint || \
		GOBIN=$(TOOLS_BIN) go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@$(GOLANGCI_LINT_VERSION)

check: vet lint test
