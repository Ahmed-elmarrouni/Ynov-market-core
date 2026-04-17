#!/bin/sh
set -e

echo "Running database migrations..."
# Use the environment variables from docker-compose
/app/migrate -path /app/db/migrations -database "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?sslmode=disable" up

echo "Starting application..."
exec /app/main