#!/bin/sh
set -e

echo "Running database migrations..."
# Port is 5432 because we are inside the Docker network
/app/migrate -path /app/db/migrations -database "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?sslmode=disable" up

echo "Starting application..."
exec /app/main