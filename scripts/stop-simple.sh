#!/bin/bash

echo "🛑 Stopping PT Jasamedika Admin Panel..."

# Stop backend
pkill -f "node.*server.js" 2>/dev/null || true

# Stop frontend  
pkill -f "vite" 2>/dev/null || true

echo "✅ All services stopped"