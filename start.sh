#!/bin/bash
# ─── Gangotri Dham — Start Dev Servers ───
echo ""
echo "🕉️  श्री गंगोत्री धाम — Starting servers..."
echo ""

# Kill any existing processes on ports 5001 & 4000
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null

# Start backend
echo "▶  Starting API server on http://localhost:5001 ..."
cd "$(dirname "$0")/server" && npm run dev &
SERVER_PID=$!

sleep 2

# Start frontend
echo "▶  Starting React app on http://localhost:4000 ..."
cd "$(dirname "$0")/client" && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅  Both servers running!"
echo "   Public site:  http://localhost:4000"
echo "   Admin panel:  http://localhost:4000/admin"
echo "   Admin login:  admin@gangotridham.org / Admin@2025"
echo "   API:          http://localhost:5001/api"
echo ""
echo "   Press Ctrl+C to stop both servers"
echo ""

# Wait and cleanup
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT TERM
wait
