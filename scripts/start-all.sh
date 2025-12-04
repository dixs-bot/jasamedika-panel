#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_ROOT/logs"
FRONTEND_DIR="$REPO_ROOT/frontend"
BACKEND_DIR="$REPO_ROOT/backend"

mkdir -p "$LOG_DIR"

echo "=========================================="
echo "🚀 Starting PT Jasamedika Admin Panel"
echo "=========================================="

echo "🧹 Cleaning up existing processes (best-effort)..."
# stop previous instances started the same way
pkill -f "frontend/node_modules/.bin/vite" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
sleep 1

echo "📦 Ensure dependencies (only if missing)"
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  (cd "$BACKEND_DIR" && npm install)
fi
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  (cd "$FRONTEND_DIR" && npm install)
fi

echo "🔧 Starting backend..."
cd "$BACKEND_DIR"
nohup node server.js > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "📡 Backend started with PID: $BACKEND_PID"
# wait backend port
BACKEND_TIMEOUT=30
echo "⏳ Waiting backend on port 8080 (timeout ${BACKEND_TIMEOUT}s)..."
for i in $(seq 1 $BACKEND_TIMEOUT); do
  if nc -z 127.0.0.1 8080 2>/dev/null; then
    # also check HTTP response briefly
    if curl -sI http://127.0.0.1:8080/ | head -n1 | grep -E "HTTP/1.[01] 200|HTTP/1.[01] 3" >/dev/null 2>&1; then
      echo "✅ Backend responding (pid $BACKEND_PID)"
      break
    fi
  fi
  sleep 1
done
if ! nc -z 127.0.0.1 8080 2>/dev/null; then
  echo "❌ Backend failed to start (port 8080 not responding). See $LOG_DIR/backend.log"
  exit 1
fi

echo "🎨 Starting frontend..."
# skip if already running
if pgrep -f "frontend/node_modules/.bin/vite" >/dev/null 2>&1 || pgrep -f "vite --host" >/dev/null 2>&1; then
  echo "Frontend already running (pgrep detected). Skipping start."
else
  cd "$FRONTEND_DIR"
  nohup npm run dev -- --host > "$LOG_DIR/frontend.log" 2>&1 &
  FRONTEND_PID=$!
  echo "🖥️  Frontend started with PID: $FRONTEND_PID"

  FRONTEND_TIMEOUT=30
  echo "⏳ Waiting frontend on port 5173 (timeout ${FRONTEND_TIMEOUT}s)..."
  for i in $(seq 1 $FRONTEND_TIMEOUT); do
    if nc -z 127.0.0.1 5173 2>/dev/null; then
      # check HTTP header quickly
      if curl -sI http://127.0.0.1:5173/ | head -n1 | grep -E "HTTP/1.[01] 200|HTTP/1.[01] 3" >/dev/null 2>&1; then
        echo "✅ Frontend responding (pid $FRONTEND_PID)"
        break
      fi
    fi
    sleep 1
  done

  if ! nc -z 127.0.0.1 5173 2>/dev/null; then
    echo "❌ Frontend failed to start (port 5173 not responding). Check $LOG_DIR/frontend.log"
    # emit last 30 lines for quick debug
    echo "---- last lines of frontend.log ----"
    tail -n 30 "$LOG_DIR/frontend.log" || true
    exit 1
  fi
fi

echo "=========================================="
echo "All services started successfully."
echo "Backend PID: ${BACKEND_PID:-existing}"
echo "Frontend PID: ${FRONTEND_PID:-existing}"
echo "Logs: $LOG_DIR"
echo "=========================================="
