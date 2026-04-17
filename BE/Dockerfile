# Build Stage
FROM golang:1.26-alpine AS builder
WORKDIR /app
# Install build dependencies
RUN apk add --no-cache gcc musl-dev curl
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Point build to the correct subdirectory
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./cmd/api

# Download migrate tool binary
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.0/migrate.linux-amd64.tar.gz | tar xvz

# Final Production Stage
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates libc6-compat
COPY --from=builder /app/main .
COPY --from=builder /app/migrate ./migrate
COPY --from=builder /app/db/migrations ./db/migrations
COPY --from=builder /app/start.sh .

# SENIOR FIX: Ensure permissions are set during build time
RUN chmod +x /app/start.sh /app/migrate /app/main

EXPOSE 8080
CMD ["./start.sh"]