# URSP API Documentation

Base URL: `/api/ursp`

All responses follow this format:
```json
{
  "success": true,
  "data": ...,
  "count": ...  // for list endpoints
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

## UE Policies

### List Policies
```
GET /policies?projectId=project-default&search=Netflix
```

**Query Parameters:**
- `projectId` (optional): Filter by project, default: `project-default`
- `search` (optional): Search in name, description, mcc, mnc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "policy-netflix-4k",
      "project_id": "project-default",
      "name": "Netflix 4K",
      "description": "Policy for Netflix 4K streaming",
      "mcc": "452",
      "mnc": "04",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "parts_count": 1,
      "rules_count": 4
    }
  ],
  "count": 1
}
```

### Get Policy (with parts summary)
```
GET /policies/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "policy-netflix-4k",
    "name": "Netflix 4K",
    "mcc": "452",
    "mnc": "04",
    "parts": [
      {
        "id": "part-ursp-1",
        "policy_id": "policy-netflix-4k",
        "part_type": 1,
        "part_name": "URSP Rules",
        "rules_count": 4
      }
    ]
  }
}
```

### Get Policy (full nested structure)
```
GET /policies/:id/full
```

**Response includes:**
- Policy metadata
- All parts
- All rules for each part
- All traffic descriptors for each rule (with parsed JSON values)
- All route descriptors with components (with parsed JSON values)

**Example:**
```json
{
  "success": true,
  "data": {
    "id": "policy-netflix-4k",
    "name": "Netflix 4K",
    "parts": [
      {
        "id": "part-ursp-1",
        "part_type": 1,
        "rules": [
          {
            "id": "rule-0",
            "precedence_value": 0,
            "description": "Video streaming traffic",
            "trafficDescriptors": [
              {
                "id": "td-0",
                "descriptor_type": 144,
                "value": {
                  "connectionCapabilities": [8]
                }
              }
            ],
            "routes": [
              {
                "id": "rd-0",
                "precedence_value": 0,
                "components": [
                  {
                    "id": "rsc-0-1",
                    "component_type": 2,
                    "value": {
                      "sst": 1,
                      "sd": "1"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Create Policy
```
POST /policies
```

**Request Body:**
```json
{
  "name": "New Policy",
  "description": "Policy description",
  "project_id": "project-default",
  "mcc": "452",
  "mnc": "04"
}
```

**Response:** `201 Created` with policy object

### Update Policy
```
PUT /policies/:id
```

**Request Body:**
```json
{
  "name": "Updated Policy",
  "description": "New description",
  "mcc": "452",
  "mnc": "04"
}
```

### Delete Policy
```
DELETE /policies/:id
```

Cascade deletes all parts, rules, traffic descriptors, and route descriptors.

## Policy Parts

### Get Parts for Policy
```
GET /policies/:policyId/parts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "part-ursp-1",
      "policy_id": "policy-netflix-4k",
      "part_type": 1,
      "part_name": "URSP Rules"
    }
  ]
}
```

**Part Types:**
- `1` = URSP
- `2` = ANDSP
- `3` = A2X
- `4` = V2X
- `5` = ProSe

### Create Policy Part
```
POST /policies/:policyId/parts
```

**Request Body:**
```json
{
  "part_type": 1,
  "part_name": "URSP Rules"
}
```

## URSP Rules

### Get Rules for Part
```
GET /parts/:partId/rules
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule-0",
      "part_id": "part-ursp-1",
      "precedence_value": 0,
      "description": "Video streaming traffic",
      "traffic_descriptors_count": 1,
      "routes_count": 1
    }
  ]
}
```

### Get Rule (with full details)
```
GET /rules/:ruleId
```

**Response includes:**
- Rule metadata
- Traffic descriptors (with parsed JSON values)
- Route descriptors with all components (with parsed JSON values)

### Create Rule
```
POST /parts/:partId/rules
```

**Request Body:**
```json
{
  "precedence_value": 0,
  "description": "Rule description"
}
```

### Update Rule
```
PUT /rules/:ruleId
```

**Request Body:**
```json
{
  "precedence_value": 1,
  "description": "Updated description"
}
```

### Delete Rule
```
DELETE /rules/:ruleId
```

Cascade deletes all traffic descriptors and route descriptors.

## Search

### Search Across Policies and Rules
```
GET /search?q=Netflix&type=all
```

**Query Parameters:**
- `q` (required): Search query
- `type` (optional): `all` (default), `policy`, or `rule`

**Response:**
```json
{
  "success": true,
  "data": {
    "policies": [
      {
        "id": "policy-netflix-4k",
        "name": "Netflix 4K",
        "parts_count": 1,
        "rules_count": 4
      }
    ],
    "rules": [
      {
        "id": "rule-0",
        "precedence_value": 0,
        "description": "Video streaming",
        "policy_name": "Netflix 4K",
        "part_name": "URSP Rules"
      }
    ]
  },
  "count": 2
}
```

## Traffic Descriptor Types

| Type | Description | Value Format |
|------|-------------|--------------|
| 1 | Match-all | `null` |
| 8 | OS Id + OS App Id | `{"osId": "...", "osAppId": "..."}` |
| 16 | IP descriptor | `{"destIP": "...", "destPort": 443, "protocol": 6}` |
| 64 | Connection capabilities | `{"connectionCapabilities": [1, 8]}` |
| 144 | Legacy connection capabilities | Same as 64 |

**Connection Capabilities Values:**
- `1` = Internet
- `2` = MMS  
- `4` = IMS
- `8` = IMS video
- `16` = Emergency
- `32` = CBS
- `64` = XCAP

## Route Component Types

| Type | Description | Value Format |
|------|-------------|--------------|
| 2 | S-NSSAI | `{"sst": 1, "sd": "1"}` |
| 4 | DNN | `{"dnn": "internet"}` |
| 5 | PDU session type | `{"pduType": 3}` (1=IPv4, 2=IPv6, 3=IPv4v6) |
| 6 | Access type | `{"accessType": 1}` (1=3GPP, 2=Non-3GPP) |

## Examples

### Example 1: List all policies
```bash
curl http://localhost:5173/api/ursp/policies
```

### Example 2: Search for Netflix policies
```bash
curl "http://localhost:5173/api/ursp/policies?search=Netflix"
```

### Example 3: Get full policy structure
```bash
curl http://localhost:5173/api/ursp/policies/policy-netflix-4k/full
```

### Example 4: Create a new policy
```bash
curl -X POST http://localhost:5173/api/ursp/policies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Policy",
    "description": "Low latency for gaming",
    "mcc": "452",
    "mnc": "04"
  }'
```

### Example 5: Search across all resources
```bash
curl "http://localhost:5173/api/ursp/search?q=gaming&type=all"
```

## Testing with Local Database

The local SQLite database (`.db/smart-uepolicy.db`) contains test data:
- 3 policies: Netflix 4K, Gaming Priority, IoT Devices
- 6 URSP rules with various traffic descriptors
- Multiple route descriptors with S-NSSAI and DNN components

You can query directly:
```bash
sqlite3 .db/smart-uepolicy.db "SELECT * FROM ue_policies"
```
