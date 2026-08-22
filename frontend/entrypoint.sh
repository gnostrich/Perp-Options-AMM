#!/bin/sh

set -e

echo "🚀 Starting Next.js application..."

# ECS automatically loads env vars from S3 via environmentFiles
# No need to manually download

cd /app
exec npm start