GOLANGCI_LINT_VERSION := v2.6.2
MIGRATE_VERSION := v4.18.1
TOOLS_BIN := $(CURDIR)/bin
DATABASE_URL ?= postgres://entwine:entwine@localhost:5432/entwine?sslmode=disable

.PHONY: build run test lint vet tidy-check tools check migrate-tool migrate-up migrate-down migrate-version

build:
	go build -o $(TOOLS_BIN)/api ./cmd/api

run:
	@set -a; [ -f .env ] && . ./.env; set +a; go run ./cmd/api

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

migrate-tool:
	@test -x $(TOOLS_BIN)/migrate || \
		GOBIN=$(TOOLS_BIN) go install -tags postgres github.com/golang-migrate/migrate/v4/cmd/migrate@$(MIGRATE_VERSION)

migrate-up: migrate-tool
	$(TOOLS_BIN)/migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down: migrate-tool
	$(TOOLS_BIN)/migrate -path migrations -database "$(DATABASE_URL)" down 1

migrate-version: migrate-tool
	$(TOOLS_BIN)/migrate -path migrations -database "$(DATABASE_URL)" version

check: vet lint test
