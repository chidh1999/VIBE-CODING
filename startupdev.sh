#!/bin/bash

echo "🚀 Starting Backend Server in Dev Mode (Port 1111)..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

echo "🔧 Loading frontend environment (.env) if present..."
FRONTEND_ENV_FILE="../frontend/.env"
if [ -f "$FRONTEND_ENV_FILE" ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$FRONTEND_ENV_FILE" | xargs)
fi
FRONTEND_PORT=${PORT:-2222}
TOUR_PORT=${REACT_APP_TOUR_PORT:-5503}
BACKEND_PORT=${BACKEND_PORT:-1111}

echo "🚀 Starting Frontend Server (Port $FRONTEND_PORT)..."
cd ../frontend || exit 1
PORT=$FRONTEND_PORT npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"

# Start Tour Static Server (Port 5503) - serve from /360/ folder to support multiple tours
echo "🚀 Starting Tour Static Server (Port $TOUR_PORT)..."
cd ../frontend/public/360 || exit 1
PORT=$TOUR_PORT node server.js > ../../../tour.log 2>&1 &
TOUR_PID=$!
echo $TOUR_PID > ../../../.tour.pid
echo "✅ Tour Static Server started with PID: $TOUR_PID"
cd ../../..

echo ""
echo "📝 Logs will be saved to:"
echo "   - Backend:  ./backend.log"
echo "   - Frontend: ./frontend.log"
echo "   - Tour:     ./tour.log"
echo ""
echo "🎉 Servers are starting..."
echo "   - Backend:  http://localhost:$BACKEND_PORT"
echo "   - Frontend: http://localhost:$FRONTEND_PORT"
echo "   - Tour:     http://localhost:$TOUR_PORT/beginner/index.html (Beginner)"
echo "               http://localhost:$TOUR_PORT/museum/index.html (Museum)"
echo ""
echo "💡 To stop servers, run: ./stopdev.sh"
echo "   Or manually kill processes: kill $BACKEND_PID $FRONTEND_PID $TOUR_PID"

# Save PIDs to file for easy stopping
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
echo "$TOUR_PID" > .tour.pid

