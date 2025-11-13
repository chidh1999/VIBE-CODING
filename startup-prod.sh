#!/bin/bash

# Production Startup Script
# This script starts the application using Docker Compose

echo "🚀 Starting Production Environment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found!"
    echo "📝 Creating from example..."
    if [ -f "env.production.example" ]; then
        cp env.production.example .env.production
        echo "✅ Created .env.production - Please update with your production values!"
        echo "   Edit .env.production and run this script again."
        exit 1
    else
        echo "❌ env.production.example not found!"
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

echo "📦 Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Production environment started!"
    echo ""
    echo "📝 Services:"
    echo "   - MongoDB:    localhost:${MONGO_PORT:-20711}"
    echo "   - Backend:    localhost:${BACKEND_PORT:-1111}"
    echo "   - Frontend:   localhost:${FRONTEND_PORT:-2222}"
    echo ""
    echo "🌐 URLs:"
    echo "   - Frontend:   http://localhost:${FRONTEND_PORT:-2222}"
    echo "   - Tour (Beginner): http://localhost:${FRONTEND_PORT:-2222}/360/beginner/"
    echo "   - Tour (Museum):   http://localhost:${FRONTEND_PORT:-2222}/360/museum/"
    echo ""
    echo "📊 View logs:"
    echo "   docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Failed to start production environment!"
    exit 1
fi

