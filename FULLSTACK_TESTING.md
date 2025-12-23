# Full Stack Testing Guide

## Overview

The development server runs **both frontend and backend** on the same port: `http://localhost:5173`

```
npm run dev
  ↓
http://localhost:5173/
  ├── /                    → Frontend (React Router UI)
  ├── /api/ursp/*          → Backend API (Hono)
  └── /__debug             → Cloudflare Workers debug panel
```

## Quick Start

### 1. Start the Full Stack Server

```bash
npm run dev
```

Wait for the server to show:
```
➜  Local:   http://localhost:5173/
➜  Debug:   http://localhost:5173/__debug
```

### 2. Test Frontend

Open in browser: **http://localhost:5173/**

You should see the Policy Editor UI with:
- Templates list (left sidebar)
- JSON editor (center)
- Agent panel (right)

### 3. Test Backend API

While the server is running, open a new terminal and test:

```bash
# Test API
curl http://localhost:5173/api/ursp/policies | jq

# Should return:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "policy-netflix-4k",
#       "name": "Netflix 4K",
#       "rules_count": 4,
#       ...
#     }
#   ]
# }
```

### 4. Test Frontend + Backend Integration

**Option A: Using Browser DevTools**

1. Open http://localhost:5173/
2. Open DevTools (F12) → Network tab
3. In the console, test API calls:

```javascript
// Test API from frontend
fetch('/api/ursp/policies')
  .then(r => r.json())
  .then(console.log)

// Get Netflix policy
fetch('/api/ursp/policies/policy-netflix-4k/full')
  .then(r => r.json())
  .then(console.log)

// Search
fetch('/api/ursp/search?q=gaming')
  .then(r => r.json())
  .then(console.log)
```

**Option B: Using curl in parallel**

Keep the dev server running in one terminal, then in another:

```bash
# Terminal 1: Frontend
open http://localhost:5173/

# Terminal 2: Backend API
curl http://localhost:5173/api/ursp/policies | jq '.data[].name'
curl http://localhost:5173/api/ursp/search?q=Netflix | jq
```

## Complete Test Workflow

### Step 1: Start Server
```bash
npm run dev
```

### Step 2: Test Backend First
```bash
# In a new terminal (keep dev server running)
curl http://localhost:5173/api/ursp/policies | jq '.count'
# Should return: 3

curl http://localhost:5173/api/ursp/policies/policy-netflix-4k/full | jq '.data.name'
# Should return: "Netflix 4K"
```

### Step 3: Test Frontend
```bash
# Open browser
open http://localhost:5173/

# Or using curl to see HTML
curl http://localhost:5173/ | grep -o '<title>.*</title>'
```

### Step 4: Test Integration

In the browser at http://localhost:5173/, open DevTools console and run:

```javascript
// Load policies via API
async function loadPolicies() {
  const response = await fetch('/api/ursp/policies');
  const data = await response.json();
  console.log('Policies:', data.data);
  return data;
}

loadPolicies();

// Create a new policy
async function createPolicy() {
  const response = await fetch('/api/ursp/policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Policy from Frontend',
      mcc: '452',
      mnc: '04',
      description: 'Created via browser'
    })
  });
  const data = await response.json();
  console.log('Created:', data);
  return data;
}

// Uncomment to test:
// createPolicy().then(() => loadPolicies());
```

## Automated Full Stack Test Script

Create `test-fullstack.sh`:

```bash
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
else
  echo "  ❌ Frontend error (HTTP $FRONTEND_STATUS)"
fi

# Test Backend API
echo ""
echo "🔌 Testing Backend API..."
API_STATUS=$(curl -s http://localhost:5173/api/ursp/policies | jq -r '.success')
if [ "$API_STATUS" = "true" ]; then
  POLICY_COUNT=$(curl -s http://localhost:5173/api/ursp/policies | jq -r '.count')
  echo "  ✅ API is working ($POLICY_COUNT policies found)"
else
  echo "  ❌ API error"
fi

# Test specific endpoints
echo ""
echo "📋 Testing API Endpoints..."
curl -s http://localhost:5173/api/ursp/policies | jq -r '.data[] | "  - \(.name): \(.rules_count) rules"'

echo ""
echo "🔍 Testing Search..."
curl -s "http://localhost:5173/api/ursp/search?q=Netflix" | jq -r '"  Found: \(.count) results"'

echo ""
echo "✅ All tests complete!"
echo ""
echo "🌐 Open in browser: http://localhost:5173/"
echo "📚 API documentation: http://localhost:5173/api/ursp/policies"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Keep server running
wait $SERVER_PID
```

Run it:
```bash
chmod +x test-fullstack.sh
./test-fullstack.sh
```

## Common Testing Scenarios

### 1. Load Policy Data in Frontend

In the frontend code (e.g., `welcome.tsx`), you can load from API:

```typescript
useEffect(() => {
  fetch('/api/ursp/policies')
    .then(res => res.json())
    .then(data => {
      console.log('Loaded policies:', data.data);
      // Use the data in your UI
    });
}, []);
```

### 2. Create Policy from Frontend Form

```typescript
async function handleSavePolicy(policyData: any) {
  const response = await fetch('/api/ursp/policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policyData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    message.success('Policy saved!');
  } else {
    message.error(result.error);
  }
}
```

### 3. Update Policy

```typescript
async function updatePolicy(id: string, updates: any) {
  const response = await fetch(`/api/ursp/policies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  return response.json();
}
```

## Debugging

### View Server Logs

When running `npm run dev`, all logs appear in the terminal:
- Frontend build logs
- Backend API logs (from `console.log` in API routes)
- Request logs

### Check Database

While server is running:
```bash
sqlite3 .db/smart-uepolicy.db "SELECT * FROM ue_policies"
```

### Debug Panel

Open http://localhost:5173/__debug to see:
- Environment variables
- Bindings (D1 database)
- Request logs

## Hot Reload

Both frontend and backend support hot reload:

- **Frontend**: Edit any `.tsx` file → auto refresh
- **Backend**: Edit `workers/routes/ursp.ts` → auto restart

## Network Tab Testing

1. Open http://localhost:5173/ in browser
2. Open DevTools → Network tab
3. Filter by "Fetch/XHR"
4. Execute API calls from console
5. See real-time request/response

Example:
```javascript
// This will show in Network tab
fetch('/api/ursp/policies/policy-netflix-4k/full')
  .then(r => r.json())
  .then(console.table)
```

## Production vs Development

### Development (Local)
```bash
npm run dev
```
- Uses `.db/smart-uepolicy.db` (local SQLite)
- Hot reload enabled
- Debug panel available

### Production (Cloudflare)
```bash
npm run deploy
```
- Uses remote D1 database
- Optimized build
- Deployed to Cloudflare Workers

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### API 404 Errors

Check `workers/app.ts` routing:
```typescript
app.route("/api/ursp", urspRouter);  // ✅ Correct
```

### CORS Issues

Not needed for same-origin! Frontend and backend are on same port.

### Database Connection Errors

Verify binding name in `wrangler.jsonc` matches code:
```jsonc
"binding": "smart_uepolicy"  // Must match c.env.smart_uepolicy in code
```

## Summary

✅ **One command starts everything**: `npm run dev`  
✅ **Frontend**: http://localhost:5173/  
✅ **Backend API**: http://localhost:5173/api/ursp/*  
✅ **Same port, no CORS issues**  
✅ **Hot reload for both**  
✅ **Test in browser or curl**

Happy coding! 🚀
