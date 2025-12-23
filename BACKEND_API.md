# URSP Backend API Documentation

## Database Schema

The URSP backend uses Cloudflare D1 (SQLite) to store URSP policy configurations.

### Tables

#### `ursp_policies`
Top-level URSP policies containing MCC/MNC (Mobile Country Code / Mobile Network Code).

```sql
CREATE TABLE ursp_policies (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mcc TEXT NOT NULL,
  mnc TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `ursp_rules`
Routing rules within a policy, ordered by precedence.

```sql
CREATE TABLE ursp_rules (
  id TEXT PRIMARY KEY,
  policy_id TEXT NOT NULL,
  name TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `traffic_descriptors`
Conditions that match traffic flows (e.g., match-all, osId-osAppId, connectionCapabilities).

```sql
CREATE TABLE traffic_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT,
  name TEXT NOT NULL,
  type INTEGER NOT NULL,
  data_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `route_descriptors`
How matched traffic should be routed (S-NSSAI, DNN, etc.).

```sql
CREATE TABLE route_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  name TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  description TEXT,
  data_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `s_nssais` & `dnns`
Network slice and data network name references for route descriptors.

---

## API Endpoints

### Base URL
```
/api/ursp
```

### Policies

#### GET `/policies`
List all policies for a project.

**Query Parameters:**
- `projectId` (optional, default: "default")

**Response:**
```json
[
  {
    "id": "1234567890-abc123",
    "project_id": "default",
    "name": "Netflix 4K",
    "mcc": "452",
    "mnc": "04",
    "description": "URSP for HD video streaming",
    "is_active": 1,
    "created_at": "2025-12-23T04:30:00Z",
    "updated_at": "2025-12-23T04:30:00Z"
  }
]
```

#### GET `/policies/:id`
Get a specific policy by ID.

**Response:** Single policy object

#### POST `/policies`
Create a new policy.

**Request Body:**
```json
{
  "projectId": "default",
  "name": "Netflix 4K",
  "mcc": "452",
  "mnc": "04",
  "description": "URSP for HD video streaming"
}
```

**Response:** Created policy object (201)

#### PUT `/policies/:id`
Update a policy.

**Request Body:**
```json
{
  "name": "Netflix 4K Updated",
  "mcc": "452",
  "mnc": "04",
  "description": "Updated description"
}
```

**Response:** Updated policy object

#### DELETE `/policies/:id`
Delete a policy and all associated rules/descriptors.

**Response:**
```json
{
  "success": true
}
```

### Rules

#### GET `/policies/:policyId/rules`
List all rules for a policy, ordered by precedence.

**Response:**
```json
[
  {
    "id": "rule-1234567890",
    "policy_id": "policy-123",
    "name": "Video Traffic",
    "precedence_value": 0,
    "description": "Route HD video streams",
    "created_at": "2025-12-23T04:30:00Z",
    "updated_at": "2025-12-23T04:30:00Z"
  }
]
```

#### POST `/policies/:policyId/rules`
Create a new rule within a policy.

**Request Body:**
```json
{
  "name": "Video Traffic",
  "precedence_value": 0,
  "description": "Route HD video streams"
}
```

**Response:** Created rule object (201)

#### PUT `/rules/:id`
Update a rule.

**Request Body:**
```json
{
  "name": "Video Traffic Updated",
  "precedence_value": 1,
  "description": "Updated description"
}
```

**Response:** Updated rule object

#### DELETE `/rules/:id`
Delete a rule and all associated descriptors.

**Response:**
```json
{
  "success": true
}
```

### Traffic Descriptors

#### GET `/rules/:ruleId/traffic-descriptors`
List all traffic descriptors for a rule.

**Response:**
```json
[
  {
    "id": "td-1234567890",
    "rule_id": "rule-123",
    "name": "Connection Capabilities",
    "type": 144,
    "data_json": {
      "connectionCapabilities": [8]
    },
    "created_at": "2025-12-23T04:30:00Z",
    "updated_at": "2025-12-23T04:30:00Z"
  }
]
```

#### POST `/rules/:ruleId/traffic-descriptors`
Create a new traffic descriptor.

**Request Body:**
```json
{
  "name": "Connection Capabilities",
  "type": 144,
  "data": {
    "connectionCapabilities": [8]
  }
}
```

**Response:** Created traffic descriptor object (201)

### Route Descriptors

#### GET `/rules/:ruleId/route-descriptors`
List all route descriptors for a rule, ordered by precedence.

**Response:**
```json
[
  {
    "id": "rd-1234567890",
    "rule_id": "rule-123",
    "name": "Primary Route",
    "precedence_value": 0,
    "description": "Primary S-NSSAI route",
    "data_json": {
      "routeSelectionDescriptor": {
        "precedenceValue": 0,
        "routeSelectionDescriptorContents": [
          {
            "routeSelectionType": 2,
            "routeSelectionValue": {
              "s-NSSAI": {
                "sst": 1,
                "sd": "1"
              }
            }
          }
        ]
      }
    },
    "created_at": "2025-12-23T04:30:00Z",
    "updated_at": "2025-12-23T04:30:00Z"
  }
]
```

#### POST `/rules/:ruleId/route-descriptors`
Create a new route descriptor.

**Request Body:**
```json
{
  "name": "Primary Route",
  "precedence_value": 0,
  "description": "Primary S-NSSAI route",
  "data": {
    "routeSelectionDescriptor": {
      "precedenceValue": 0,
      "routeSelectionDescriptorContents": [
        {
          "routeSelectionType": 2,
          "routeSelectionValue": {
            "s-NSSAI": {
              "sst": 1,
              "sd": "1"
            }
          }
        }
      ]
    }
  }
}
```

**Response:** Created route descriptor object (201)

#### PUT `/route-descriptors/:id`
Update a route descriptor.

**Request Body:**
```json
{
  "name": "Primary Route Updated",
  "precedence_value": 0,
  "description": "Updated description",
  "data": { ... }
}
```

**Response:** Updated route descriptor object

#### DELETE `/route-descriptors/:id`
Delete a route descriptor.

**Response:**
```json
{
  "success": true
}
```

---

## Setup Instructions

### 1. Initialize D1 Database

```bash
# Create the database
wrangler d1 create smart-uepolicy

# Update wrangler.jsonc with the database_id

# Apply schema
wrangler d1 execute smart-uepolicy --file schema/ursp.sql
```

### 2. Run Locally

```bash
npm run dev
```

### 3. Deploy

```bash
npm run deploy
```

---

## Notes

- All timestamps are stored in ISO 8601 format (DATETIME)
- JSON data in `data_json` fields must be stringified when stored
- Foreign key constraints ensure referential integrity
- Indexes on foreign keys improve query performance
- Precedence values determine order of evaluation (ascending)
