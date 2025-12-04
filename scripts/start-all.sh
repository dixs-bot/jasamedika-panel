#!/bin/bash

# PT Jasamedika Saranatama - Admin Panel Start Script
# This script starts both backend and frontend services

echo "=========================================="
echo "🚀 Starting PT Jasamedika Admin Panel"
echo "=========================================="

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  .env file not found in backend directory"
    echo "📝 Creating .env file from template..."
    
    # Generate random JWT_SECRET
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-64)
    
    cat > backend/.env << EOF
JWT_SECRET=${JWT_SECRET}
PORT=8080
NODE_ENV=development
EOF
    
    echo "✅ .env file created with random JWT_SECRET"
    echo "🔑 JWT_SECRET: ${JWT_SECRET}"
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Kill existing processes on ports 8080 and 5173
echo "🧹 Cleaning up existing processes..."
if check_port 8080; then
    echo "🛑 Stopping backend on port 8080..."
    pkill -f "node.*server.js" 2>/dev/null || true
    sleep 2
fi

if check_port 5173; then
    echo "🛑 Stopping frontend on port 5173..."
    pkill -f "vite" 2>/dev/null || true
    sleep 2
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend
export $(cat .env | xargs)
nohup node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "📡 Backend started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Check if backend is running
if check_port 8080; then
    echo "✅ Backend is running on port 8080"
else
    echo "❌ Backend failed to start"
    echo "📋 Check logs/backend.log for details"
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
nohup npm run dev -- --host > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "🖥️  Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5

# Check if frontend is running
if check_port 5173; then
    echo "✅ Frontend is running on port 5173"
else
    echo "❌ Frontend failed to start"
    echo "📋 Check logs/frontend.log for details"
    exit 1
fi

echo ""
echo "=========================================="
echo "🎉 PT Jasamedika Admin Panel is running!"
echo "=========================================="
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:8080"
echo "❤️  Health Check: http://localhost:8080/health"
echo ""
echo "📋 Useful commands:"
echo "  View backend logs: tail -f logs/backend.log"
echo "  View frontend logs: tail -f logs/frontend.log"
echo "  Stop all services: ./scripts/stop-all.sh"
echo ""
echo "🔑 To initialize admin data:"
echo "  curl -X POST http://localhost:8080/api/auth/init-data \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"namaAdmin\":\"Admin User\",\"perusahaan\":\"PT Jasamedika Saranatama\"}'"
echo "=========================================="