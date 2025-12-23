# Smart UEPolicy Backend Setup

## Quick Start

### 1. Initialize Local Database

For **local development**, use the local D1 database:

```bash
# Create local D1 database
bash scripts/init-db.sh

# Apply schema migrations
bash scripts/migrate-db.sh
```

### 2. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5173/api/ursp/`

### 3. Test API

```bash
# Create a policy
curl -X POST http://localhost:5173/api/ursp/policies \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "default",
    "name": "Netflix 4K",
    "mcc": "452",
    "mnc": "04",
    "description": "URSP for HD video streaming"
  }'

# List policies
curl http://localhost:5173/api/ursp/policies
```

## Production Deployment

When deploying to Cloudflare Workers with D1:

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Create Remote Database

```bash
npx wrangler d1 create smart-uepolicy
```

### 3. Update Configuration

Update `wrangler.jsonc` with the returned database ID:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "smart-uepolicy",
    "database_id": "YOUR_DATABASE_ID"  // Add this
  }
]
```

### 4. Apply Schema

```bash
npx wrangler d1 execute smart-uepolicy --file schema/ursp.sql
```

### 5. Deploy

```bash
npm run deploy
```

## API Reference

See [BACKEND_API.md](../BACKEND_API.md) for complete API documentation.

## Database Structure

The schema supports:
- **Policies**: Top-level URSP configurations (MCC/MNC)
- **Rules**: Routing rules with precedence
- **Traffic Descriptors**: Traffic matching conditions
- **Route Descriptors**: Route selection criteria
- **S-NSSAIs & DNNs**: Network slice and data network references

See [schema/ursp.sql](../schema/ursp.sql) for details.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Cloudflare Workers + D1
- `npm run typecheck` - Run TypeScript check and generate Cloudflare types
- `bash scripts/init-db.sh` - Initialize local database
- `bash scripts/migrate-db.sh` - Apply schema migrations
