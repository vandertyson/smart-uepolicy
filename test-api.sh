#!/bin/bash

echo "🚀 Starting dev server..."
npm run dev &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server..."
sleep 12

BASE_URL="http://localhost:5173/api/ursp"

echo ""
echo "=== Testing API Endpoints ==="
echo ""

echo "📋 1. List all policies:"
curl -s "$BASE_URL/policies" | jq -r '.data[] | "  - \(.name) (MCC: \(.mcc), MNC: \(.mnc)) - \(.rules_count) rules"'
echo ""

echo "🔍 2. Get Netflix 4K policy (summary):"
curl -s "$BASE_URL/policies/policy-netflix-4k" | jq '.data | {name, mcc, mnc, parts: (.parts | length)}'
echo ""

echo "📦 3. Get Netflix 4K full details:"
curl -s "$BASE_URL/policies/policy-netflix-4k/full" | jq '.data.parts[0].rules[0] | {precedence: .precedence_value, description, traffic: (.trafficDescriptors | length), routes: (.routes | length)}'
echo ""

echo "🎮 4. Search for 'gaming':"
curl -s "$BASE_URL/search?q=gaming" | jq '{count, policies: .data.policies | length}'
echo ""

echo "⚙️ 5. Get rules for part-ursp-1:"
curl -s "$BASE_URL/parts/part-ursp-1/rules" | jq -r '.data[] | "  Rule \(.precedence_value): \(.description // "No description")"'
echo ""

echo "✅ Tests Complete!"
echo ""

# Kill server
kill $SERVER_PID 2>/dev/null
