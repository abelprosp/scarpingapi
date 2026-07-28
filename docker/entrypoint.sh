#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

MAIN_FILE="dist/main.js"
if [ ! -f "$MAIN_FILE" ]; then
  MAIN_FILE="dist/src/main.js"
fi

if [ ! -f "$MAIN_FILE" ]; then
  echo "ERROR: Build output not found (dist/main.js or dist/src/main.js)"
  ls -la dist/ 2>/dev/null || echo "dist/ directory missing"
  exit 1
fi

echo "Starting API ($MAIN_FILE)..."
exec node "$MAIN_FILE"
