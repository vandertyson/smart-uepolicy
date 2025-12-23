# Frontend API Integration Guide

## Overview
The frontend is now fully integrated with the backend API. You can load policies from the database, edit them in the UI, and save changes back to the database.

## Changes Made

### 1. API Client (`app/api/ursp-api.ts`)
- Complete TypeScript API client with all URSP endpoints
- `policyApi.list()`, `.get()`, `.getFull()`, `.create()`, `.update()`, `.delete()`
- `searchApi.search()` for cross-resource search
- Conversion helpers:
  - `convertToLegacyFormat()` - Converts API response to editor format
  - `convertFromLegacyFormat()` - Converts editor data to API format

### 2. Welcome Page (`app/welcome/welcome.tsx`)
Updated with complete API integration:
- **State Management**: Added `loadedPolicies`, `currentPolicyId`, `currentPartId`, `loading`
- **Load on Mount**: `useEffect` loads all policies from database when page loads
- **Track Current Policy**: `insertTemplateIntoPolicy` now tracks which policy is being edited
- **Save to Database**: `handleSaveSelect` handles both creating new and updating existing policies
- **Save Button**: Dropdown menu now shows:
  - "💾 Update in Database" when editing existing policy
  - "💾 Save to Database" when creating new policy
  - Loading state while saving

### 3. Templates Component (`app/welcome/Templates.tsx`)
Enhanced to display database policies:
- **New Props**: `loadedPolicies` and `onLoadPolicy` callback
- **Database Category**: Each policy type now has a "Database" category
- **Load from Database**: Click any database policy to load it into the editor
- **Dynamic Results**: Shows database policies in "Database" category, static templates in other categories
- **No Delete Button**: Database policies don't show delete button (prevents confusion)

## How to Test

### 1. Start Development Server
```bash
npm run dev
```
The server will start on http://localhost:5173

### 2. Test Loading Policies

1. Open http://localhost:5173 in your browser
2. Open browser DevTools (F12) → Console tab
3. You should see: `"Loaded X policies from database"`
4. In the left sidebar (Templates):
   - Select "URSP" as Policy Type
   - Select "Database" as Category
5. You should see 3 policies:
   - Netflix 4K Streaming
   - Gaming Priority
   - IoT Devices

### 3. Test Loading a Policy into Editor

1. In the Database category, click on "Netflix 4K Streaming"
2. The policy will load into the editor on the right
3. You should see:
   - Editor name changes to "Netflix 4K Streaming"
   - JSON data appears in the editor
   - The policy has 4 URSP rules with traffic descriptors and routes
4. Check browser console for: `"Loaded policy: Netflix 4K Streaming"`

### 4. Test Editing and Updating

1. With "Netflix 4K Streaming" loaded, make a small change in the JSON editor:
   - Expand the JSON tree
   - Find a value and change it (e.g., change a precedence value)
2. Click the "Save" button (top right)
3. Select "💾 Update in Database"
4. You should see success message: "Policy updated successfully"
5. Reload the page - your changes should persist

### 5. Test Creating New Policy

1. Click "Delete Current" button to clear the editor
2. Paste in new policy data or use a template from static categories
3. Change the editor name at the top (e.g., "My New Policy")
4. Click "Save" → "💾 Save to Database"
5. You should see success message: "Policy saved successfully"
6. The policy should now appear in the Database category

### 6. Test Search Functionality

In the Templates sidebar:
1. Select "Database" category
2. Type in the search box (e.g., "Netflix")
3. Results should filter to show only matching policies

## API Endpoints Being Used

### Load All Policies (On Page Mount)
```
GET /api/ursp/policies
```
Returns list of all policies with basic info (id, name, description, parts_count, rules_count)

### Load Full Policy (When Clicking Database Policy)
```
GET /api/ursp/policies/:id/full
```
Returns complete policy with nested structure:
- Policy details
- Parts with rules
- Traffic descriptors for each rule
- Route selection descriptors with components

### Create New Policy
```
POST /api/ursp/policies
```
Body:
```json
{
  "name": "Policy Name",
  "description": "Optional description"
}
```

### Update Policy
```
PUT /api/ursp/policies/:id
```
Body:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

## Data Flow

### Loading from Database
```
User clicks policy in Database category
  → onLoadPolicy(policyId) called
  → policyApi.getFull(policyId)
  → API returns full policy structure
  → convertToLegacyFormat(apiResponse)
  → insertTemplateIntoPolicy() with converted data
  → Editor displays policy
  → currentPolicyId and currentPartId tracked
```

### Saving to Database
```
User clicks Save → Save to Database
  → convertFromLegacyFormat(editorData, policyId, partId)
  → If policyId exists: policyApi.update(policyId, data)
  → If new policy: policyApi.create(data)
  → API saves to database
  → Success message shown
  → Policies reloaded from database
```

## Testing with cURL

You can also test the API directly with cURL:

```bash
# List all policies
curl http://localhost:5173/api/ursp/policies

# Get full policy details
curl http://localhost:5173/api/ursp/policies/1/full

# Create new policy
curl -X POST http://localhost:5173/api/ursp/policies \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Policy", "description": "Created via cURL"}'

# Update policy
curl -X PUT http://localhost:5173/api/ursp/policies/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "description": "Updated via cURL"}'

# Delete policy
curl -X DELETE http://localhost:5173/api/ursp/policies/1

# Search across all resources
curl "http://localhost:5173/api/ursp/search?q=netflix&type=policy"
```

## Troubleshooting

### Policies Not Loading
1. Check browser console for errors
2. Verify database has data: `wrangler d1 execute smart_uepolicy --local --command "SELECT * FROM ue_policies"`
3. Check network tab in DevTools for API responses

### Save Button Not Working
1. Open browser console for error messages
2. Check that editor name is not empty
3. Verify you're not in readonly mode

### Database Not Persisting
1. Check that local database exists: `ls -la .db/`
2. Verify `vite.config.ts` has `persist: { path: ".db" }`
3. Try stopping server and restarting: `npm run dev`

### CORS Errors
Should not happen since frontend and backend run on same port (5173), but if you see CORS errors:
1. Verify you're accessing via http://localhost:5173 (not 127.0.0.1)
2. Check that `npm run dev` is running both frontend and backend

## Next Steps

### Add Delete Functionality
Currently you can't delete policies from the UI. To add this:
1. Add delete button in Templates component for Database category
2. Call `policyApi.delete(policyId)` with confirmation dialog
3. Reload policies after deletion

### Add Policy Parts Support
Currently only shows first part (URSP). To support multiple parts:
1. Update UI to show all parts of a policy
2. Add navigation between parts
3. Track current part being edited

### Add Validation
Add validation before saving:
1. Check required fields are present
2. Validate data structure matches schema
3. Show helpful error messages

### Add Filtering/Sorting
Enhance the Database category:
1. Sort by name, date created, date modified
2. Filter by description or tags
3. Show creation/modification dates

## Database Schema Reference

The API uses the v3 schema with these main tables:
- `ue_policies` - Top-level UE policies
- `ue_policy_parts` - Parts within a policy (URSP, A2X, V2X, etc.)
- `ursp_rules` - URSP rules within a part
- `traffic_descriptors` - Traffic descriptors for rules
- `route_selection_descriptors` - Routes with precedence
- `route_selection_components` - Components for each route (S-NSSAI, DNN, etc.)

See `SCHEMA_V3_GUIDE.md` for complete schema documentation.
