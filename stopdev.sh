#!/bin/bash

echo "🛑 Stopping development servers..."

# Load frontend env for ports if available
FRONTEND_ENV_FILE="./frontend/.env"
if [ -f "$FRONTEND_ENV_FILE" ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$FRONTEND_ENV_FILE" | xargs)
fi
FRONTEND_PORT=${PORT:-2222}
TOUR_PORT=${REACT_APP_TOUR_PORT:-5503}
BACKEND_PORT=${BACKEND_PORT:-1111}

# Read PIDs from files
if [ -f .backend.pid ]; then
  BACKEND_PID=$(cat .backend.pid)
  echo "⏹️  Stopping Backend (PID: $BACKEND_PID)..."
  kill $BACKEND_PID 2>/dev/null && rm .backend.pid || echo "Backend already stopped"
else
  echo "⚠️  No backend PID file found"
fi

if [ -f .frontend.pid ]; then
  FRONTEND_PID=$(cat .frontend.pid)
  echo "⏹️  Stopping Frontend (PID: $FRONTEND_PID)..."
  kill $FRONTEND_PID 2>/dev/null && rm .frontend.pid || echo "Frontend already stopped"
else
  echo "⚠️  No frontend PID file found"
fi

if [ -f .tour.pid ]; then
  TOUR_PID=$(cat .tour.pid)
  echo "⏹️  Stopping Tour Static Server (PID: $TOUR_PID)..."
  kill $TOUR_PID 2>/dev/null && rm .tour.pid || echo "Tour server already stopped"
else
  echo "⚠️  No tour PID file found"
fi

# Also kill by port just in case
echo "🧹 Cleaning up processes on ports $BACKEND_PORT and $FRONTEND_PORT..."
lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
echo "🧹 Cleaning up tour static server on port $TOUR_PORT..."
lsof -ti:$TOUR_PORT | xargs kill -9 2>/dev/null
# Also kill any node server.js processes (tour static server)
pkill -f "node server.js" 2>/dev/null

echo "✅ All servers stopped!"
echo ""
echo "📝 Log files remain:"
echo "   - ./backend.log"
echo "   - ./frontend.log"
echo "   - ./tour.log"

