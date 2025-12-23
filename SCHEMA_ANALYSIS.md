# URSP Schema Analysis

## Structure Comparison

### **Actual Data Structure (from initialPolicyData)**

```
uePolicySectionManagementList[]
└── uePolicySectionManagementSublist
    ├── mccMNC { mcc, mnc }
    └── uePolicySectionManagementSublistContents[]
        └── instruction
            ├── upsc: number
            └── uePolicySectionContents[]
                └── uePolicyPart
                    ├── spare4: number
                    ├── uePolicyPartType: number (1=URSP)
                    └── uePolicyPartContents
                        └── ursp[]
                            └── urspRule
                                ├── precedenceValue: number
                                ├── trafficDescriptor[]
                                │   ├── trafficDescriptorType: number
                                │   └── trafficDescriptorValue: object
                                └── routeSelectionDescriptorList[]
                                    └── routeSelectionDescriptor
                                        ├── precedenceValue: number
                                        └── routeSelectionDescriptorContents[]
                                            ├── routeSelectionType: number
                                            └── routeSelectionValue: object
```

### **Current Schema (ursp.sql) - INCORRECT**

```
projects
└── ursp_policies (mcc, mnc) ❌ Missing hierarchy
    └── ursp_rules
        ├── traffic_descriptors ❌ Wrong structure
        └── route_descriptors ❌ Wrong structure
            ├── s_nssais ❌ Too specific
            └── dnns ❌ Too specific
```

**Problems:**
1. ❌ Missing entire hierarchy (uePolicySectionManagementList → Sublist → Instruction → Contents → Part)
2. ❌ URSP policies table doesn't represent the correct level
3. ❌ s_nssais and dnns tables are too specific - should be generic JSON in route_selection_value
4. ❌ No upsc, spare4, uePolicyPartType fields
5. ❌ Wrong parent-child relationships

### **New Schema (ursp_v2.sql) - CORRECT** ✅

```
projects
└── ue_policy_sections (name for entire policy)
    └── ue_policy_sublists (mcc, mnc)
        └── ue_policy_instructions (upsc)
            └── ue_policy_section_contents (spare4, ue_policy_part_type)
                └── ursp_rules (precedence_value)
                    ├── traffic_descriptors (type, value as JSON)
                    └── route_selection_descriptors (precedence_value)
                        └── route_selection_descriptor_contents (type, value as JSON)
```

**Benefits:**
1. ✅ Matches exact 3GPP TS 24.526 specification
2. ✅ Complete hierarchy preserved
3. ✅ Generic JSON storage for flexibility
4. ✅ Can support multiple policy types (URSP, ANDSP, V2X, etc.)
5. ✅ Correct relationships for cascading deletes

## Field Mappings

### Traffic Descriptor Types (trafficDescriptorType)
- `1` = match-all
- `8` = osId-osAppId
- `16` = IP descriptor (destination IP address, destination port, protocol)
- `144` = connectionCapabilities (IMS, MMS, Internet, etc.)

### Route Selection Types (routeSelectionType)
- `1` = SSC mode
- `2` = S-NSSAI (Network Slice)
- `3` = DNN + S-NSSAI
- `4` = DNN (Data Network Name)
- `5` = PDU session type
- `6` = Preferred access type
- `7` = Multi-access preference
- `8` = Non-seamless WLAN offload

## Migration Plan

### Option 1: Fresh Start (Recommended for Development)
```bash
# Backup current data if any
sqlite3 .db/smart-uepolicy.db ".dump" > backup.sql

# Drop old schema
rm .db/smart-uepolicy.db

# Apply new schema
sqlite3 .db/smart-uepolicy.db < schema/ursp_v2.sql

# For remote (Cloudflare)
npx wrangler d1 execute smart-uepolicy --remote --file schema/ursp_v2.sql
```

### Option 2: Migration Script (If have production data)
Create migration script to transform data from old to new structure.

## API Updates Required

After schema change, update:
1. `workers/routes/ursp.ts` - Rewrite all CRUD operations
2. API endpoints to match new hierarchy
3. Frontend Templates to use new structure

## Example Data Storage

For the initialPolicyData, it would be stored as:

1. **ue_policy_sections**: 1 record (Netflix 4K)
2. **ue_policy_sublists**: 1 record (mcc=452, mnc=04)
3. **ue_policy_instructions**: 1 record (upsc=80)
4. **ue_policy_section_contents**: 1 record (spare4=0, type=1)
5. **ursp_rules**: 4 records (precedence 0-3)
6. **traffic_descriptors**: 4 records (one per rule)
7. **route_selection_descriptors**: 5 records (varying per rule)
8. **route_selection_descriptor_contents**: 7 records (S-NSSAI + DNN combinations)
