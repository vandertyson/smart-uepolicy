# Local Development Guide

## Starting the Development Server

1. **Start the dev server:**
```bash
npm run dev
```

The server will start at `http://localhost:5173/`

## Testing the API

### Using curl

**1. List all policies:**
```bash
curl http://localhost:5173/api/ursp/policies
```

**2. Get policy with full details:**
```bash
curl http://localhost:5173/api/ursp/policies/policy-netflix-4k/full
```

**3. Search policies:**
```bash
curl "http://localhost:5173/api/ursp/policies?search=Netflix"
```

**4. Get rules for a part:**
```bash
curl http://localhost:5173/api/ursp/parts/part-ursp-1/rules
```

**5. Get rule details:**
```bash
curl http://localhost:5173/api/ursp/rules/rule-0
```

**6. Search across all:**
```bash
curl "http://localhost:5173/api/ursp/search?q=gaming"
```

### Using Browser

Open these URLs directly in your browser:

- All policies: http://localhost:5173/api/ursp/policies
- Netflix policy full: http://localhost:5173/api/ursp/policies/policy-netflix-4k/full
- Search: http://localhost:5173/api/ursp/search?q=gaming

### Using HTTPie (if installed)

```bash
# List policies
http :5173/api/ursp/policies

# Get full policy
http :5173/api/ursp/policies/policy-netflix-4k/full

# Create new policy
http POST :5173/api/ursp/policies name="Test Policy" mcc="452" mnc="04"
```

### Using VS Code REST Client

Create a file `api-test.http`:

```http
### List all policies
GET http://localhost:5173/api/ursp/policies

### Get Netflix policy with full details
GET http://localhost:5173/api/ursp/policies/policy-netflix-4k/full

### Search policies
GET http://localhost:5173/api/ursp/policies?search=Netflix

### Create new policy
POST http://localhost:5173/api/ursp/policies
Content-Type: application/json

{
  "name": "Test Policy",
  "description": "Testing policy creation",
  "mcc": "452",
  "mnc": "04"
}

### Search
GET http://localhost:5173/api/ursp/search?q=gaming&type=all
```

## Database Configuration

### Local Database (Development)

The dev server uses the local SQLite database at `.db/smart-uepolicy.db`.

**View data directly:**
```bash
# List all policies
sqlite3 .db/smart-uepolicy.db "SELECT * FROM ue_policies"

# Count rules by policy
sqlite3 .db/smart-uepolicy.db "
SELECT p.name, COUNT(ur.id) as rules
FROM ue_policies p
JOIN ue_policy_parts pp ON p.id = pp.policy_id
JOIN ursp_rules ur ON pp.id = ur.part_id
GROUP BY p.id
"

# View with JSON formatting
sqlite3 .db/smart-uepolicy.db -json "SELECT * FROM ue_policies" | jq
```

**Reset local database:**
```bash
# Recreate schema and seed data
rm .db/smart-uepolicy.db
sqlite3 .db/smart-uepolicy.db < schema/ursp_v3.sql
sqlite3 .db/smart-uepolicy.db < schema/seed_data.sql
```

### Remote Database (Production)

To use the remote Cloudflare D1 database, you need to be logged in:

```bash
npx wrangler login
```

Then deploy:
```bash
npm run deploy
```

## Quick Test Script

Create `test-api.sh`:

```bash
#!/bin/bash
BASE_URL="http://localhost:5173/api/ursp"

echo "=== Testing API Endpoints ==="
echo ""

echo "1. List all policies:"
curl -s "$BASE_URL/policies" | jq '.data[] | {id, name, rules_count}'
echo ""

echo "2. Get Netflix 4K policy (full):"
curl -s "$BASE_URL/policies/policy-netflix-4k/full" | jq '.data | {name, mcc, mnc, parts_count: (.parts | length)}'
echo ""

echo "3. Search for 'gaming':"
curl -s "$BASE_URL/search?q=gaming" | jq '.data.policies[] | {id, name, rules_count}'
echo ""

echo "4. Get URSP rules for part-ursp-1:"
curl -s "$BASE_URL/parts/part-ursp-1/rules" | jq '.data[] | {precedence_value, description}'
echo ""

echo "=== Tests Complete ==="
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Expected Test Data

The local database contains:

1. **Netflix 4K** policy (policy-netflix-4k)
   - 4 URSP rules (precedence 0-3)
   - Traffic descriptors: IMS video, Internet, OS App ID, Match-all
   - Routes with S-NSSAI and DNN combinations

2. **Gaming Priority** policy (policy-gaming)
   - 1 URSP rule for low latency
   - S-NSSAI: sst=2, sd=100

3. **IoT Devices** policy (policy-iot)
   - 1 URSP rule for sensor data
   - IP descriptor with UDP port 8883
   - S-NSSAI: sst=3, sd=200

## Troubleshooting

### Server won't start
```bash
# Kill any existing processes
pkill -f "react-router dev"

# Clear node_modules if needed
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev
```

### Database errors
```bash
# Verify database exists
ls -lh .db/smart-uepolicy.db

# Check database structure
sqlite3 .db/smart-uepolicy.db ".tables"

# Verify data
sqlite3 .db/smart-uepolicy.db "SELECT COUNT(*) FROM ue_policies"
```

### API returns 500 errors

Check server logs in the terminal where `npm run dev` is running. Common issues:
- Database binding name mismatch (should be `smart_uepolicy`)
- Missing tables (run schema/seed scripts)
- JSON parse errors (check descriptor_value format)

## VS Code Extensions (Optional)

Install these for better API testing experience:

1. **REST Client** - Test HTTP requests directly in VS Code
2. **Thunder Client** - GUI-based API testing
3. **SQLite Viewer** - View database tables visually

## Production Deployment

When ready to deploy:

```bash
# Build and deploy to Cloudflare
npm run deploy

# View deployment URL
npx wrangler deployments list

# Test production API
curl https://smart-uepolicy.YOUR-SUBDOMAIN.workers.dev/api/ursp/policies
```
