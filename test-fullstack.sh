#!/bin/bash

echo "🚀 Starting full stack server..."
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to be ready..."
sleep 12

echo ""
echo "=== Testing Full Stack ==="
echo ""

# Test Frontend
echo "🎨 Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "  ✅ Frontend is running (HTTP $FRONTEND_STATUS)"
  echo "     URL: http://localhost:5173/"
else
  echo "  ❌ Frontend error (HTTP $FRONTEND_STATUS)"
fi

# Test Backend API
echo ""
echo "🔌 Testing Backend API..."
API_RESPONSE=$(curl -s http://localhost:5173/api/ursp/policies)
API_STATUS=$(echo "$API_RESPONSE" | jq -r '.success' 2>/dev/null)

if [ "$API_STATUS" = "true" ]; then
  POLICY_COUNT=$(echo "$API_RESPONSE" | jq -r '.count')
  echo "  ✅ API is working ($POLICY_COUNT policies found)"
  echo "     URL: http://localhost:5173/api/ursp/policies"
else
  echo "  ❌ API error"
  echo "  Response: $API_RESPONSE"
fi

# Test specific endpoints
echo ""
echo "📋 Policies in Database:"
curl -s http://localhost:5173/api/ursp/policies | jq -r '.data[]? | "  - \(.name) (MCC: \(.mcc), MNC: \(.mnc)) - \(.rules_count) rules"'

echo ""
echo "🔍 Testing Search Endpoint..."
SEARCH_RESULT=$(curl -s "http://localhost:5173/api/ursp/search?q=Netflix")
SEARCH_COUNT=$(echo "$SEARCH_RESULT" | jq -r '.count' 2>/dev/null)
echo "  Found: $SEARCH_COUNT results for 'Netflix'"

echo ""
echo "📦 Testing Full Policy Endpoint..."
FULL_POLICY=$(curl -s http://localhost:5173/api/ursp/policies/policy-netflix-4k/full)
POLICY_NAME=$(echo "$FULL_POLICY" | jq -r '.data.name' 2>/dev/null)
PARTS_COUNT=$(echo "$FULL_POLICY" | jq -r '.data.parts | length' 2>/dev/null)
echo "  Policy: $POLICY_NAME"
echo "  Parts: $PARTS_COUNT"

echo ""
echo "✅ All tests complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend:        http://localhost:5173/"
echo "🔌 API (list):      http://localhost:5173/api/ursp/policies"
echo "📖 API (full):      http://localhost:5173/api/ursp/policies/policy-netflix-4k/full"
echo "🔍 API (search):    http://localhost:5173/api/ursp/search?q=gaming"
echo "🐛 Debug Panel:     http://localhost:5173/__debug"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tip: Open http://localhost:5173/ in browser and check DevTools Console"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Keep server running
wait $SERVER_PID
