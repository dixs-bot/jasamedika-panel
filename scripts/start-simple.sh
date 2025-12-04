#!/bin/bash

echo "🚀 Starting PT Jasamedika Admin Panel..."

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cat > backend/.env << EOF
JWT_SECRET=JasamedikaSecretKeyForJWTToken2024VeryLongStringForSecurityPurposes
PORT=8080
NODE_ENV=development
EOF
    echo "✅ .env file created"
fi

# Start backend
echo "🔧 Starting backend..."
cd backend
nohup node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
nohup npm run dev -- --host > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend
sleep 5

echo ""
echo "🎉 PT Jasamedika Admin Panel is running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:8080"
echo "❤️  Health Check: http://localhost:8080/health"
echo ""
echo "📋 Admin credentials (run init-data first):"
echo "  curl -X POST http://localhost:8080/api/auth/init-data \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"namaAdmin\":\"Admin User\",\"perusahaan\":\"PT Jasamedika Saranatama\"}'"
echo ""
echo "📋 View logs:"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/frontend.log"