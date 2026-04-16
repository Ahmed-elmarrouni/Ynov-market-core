# Use Go 1.22 Alpine for a modern, minimal image
FROM golang:1.22-alpine

WORKDIR /app

# Install build dependencies required for SQLite (CGO)
RUN apk add --no-cache gcc musl-dev

# Copy dependency manifests first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application
COPY . .

# Build with CGO enabled (required for mattn/go-sqlite3)
RUN CGO_ENABLED=1 GOOS=linux go build -o main .

# Expose the API port
EXPOSE 8080

# Run the compiled binary
CMD ["./main"]