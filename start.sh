#!/bin/bash

echo "🚀 Starting NODEJS_AND_REACTJS Application"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

echo "📦 Building and starting all services..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🌐 Application URLs:"
echo "Frontend: http://localhost:2222"
echo "Backend API: http://localhost:1111/api"
echo "MongoDB: localhost:20711"

echo ""
echo "📋 Default Login Credentials:"
echo "Admin: admin@example.com / password"
echo "User: user@example.com / password"

echo ""
echo "✅ Application started successfully!"
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
