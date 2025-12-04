#!/bin/bash

# PT Jasamedika Saranatama - Admin Panel Stop Script
# This script stops both backend and frontend services

echo "=========================================="
echo "🛑 Stopping PT Jasamedika Admin Panel"
echo "=========================================="

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Stop backend
if check_port 8080; then
    echo "🛑 Stopping backend on port 8080..."
    pkill -f "node.*server.js" 2>/dev/null || true
    
    # Wait a moment and force kill if still running
    sleep 2
    if check_port 8080; then
        echo "⚡ Force killing backend..."
        pkill -9 -f "node.*server.js" 2>/dev/null || true
    fi
    
    echo "✅ Backend stopped"
else
    echo "ℹ️  Backend is not running"
fi

# Stop frontend
if check_port 5173; then
    echo "🛑 Stopping frontend on port 5173..."
    pkill -f "vite" 2>/dev/null || true
    
    # Wait a moment and force kill if still running
    sleep 2
    if check_port 5173; then
        echo "⚡ Force killing frontend..."
        pkill -9 -f "vite" 2>/dev/null || true
    fi
    
    echo "✅ Frontend stopped"
else
    echo "ℹ️  Frontend is not running"
fi

# Clean up any remaining node processes related to this project
echo "🧹 Cleaning up remaining processes..."
pkill -f "jasamedika" 2>/dev/null || true

echo ""
echo "=========================================="
echo "✅ All services stopped successfully"
echo "=========================================="