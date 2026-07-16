#!/bin/bash
# NyxBeacon Startup Script for Linux/macOS

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  NyxBeacon Hospital Bed Board System           ║"
echo "║  Starting Development Servers...                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Start servers concurrently
(cd packages/server && npm run dev) &
SERVER_PID=$!

(cd packages/client && npm run dev) &
CLIENT_PID=$!

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  Servers Starting...                           ║"
echo "║                                                ║"
echo "║  Frontend: http://localhost:5173               ║"
echo "║  Backend:  http://localhost:3000               ║"
echo "║  Health:   http://localhost:3000/health        ║"
echo "║                                                ║"
echo "║  Press Ctrl+C to stop the servers.             ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

wait $SERVER_PID $CLIENT_PID
