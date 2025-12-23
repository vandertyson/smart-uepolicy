# UE Policy Database Schema v3

## Overview

This schema is designed based on 3GPP TS 24.526 specification, starting from **UePolicySectionContents** level.

## Hierarchy

```
projects
└── ue_policies (name, description, mcc, mnc)
    └── ue_policy_parts (part_type: URSP=1, ANDSP=2, A2X=3, V2X=4, ProSe=5)
        ├── [URSP] ursp_rules (precedence_value)
        │   ├── traffic_descriptors (type, value)
        │   └── route_descriptors (precedence_value)
        │       └── route_components (type, value)
        ├── [ANDSP] andsp_rules (precedence_value, criteria)
        ├── [V2X] v2x_rules (precedence_value, service_type, config)
        └── [ProSe] prose_rules (precedence_value, service_type, config)
```

## Policy Part Types

| Type | Value | Description |
|------|-------|-------------|
| URSP | 1 | UE Route Selection Policy |
| ANDSP | 2 | Access Network Discovery and Selection Policy |
| A2X | 3 | Application-to-anything communication |
| V2X | 4 | Vehicle-to-everything communication |
| ProSe | 5 | Proximity-based Services |

## URSP Structure (part_type = 1)

### Traffic Descriptor Types (TS 24.526 Table 5.2.1-1)

| Type | Description | Value Format |
|------|-------------|--------------|
| 1 | Match-all | `null` |
| 8 | OS Id + OS App Id | `{ osId: string, osAppId: string }` |
| 16 | IP descriptor | `{ destIP?: string, destPort?: number, protocol?: number }` |
| 32 | Non-IP descriptor | `{ etherType?: string }` |
| 48 | Domain descriptor | `{ domain: string }` |
| 64 | Connection capabilities | `{ capabilities: number[] }` (e.g., [8] for IMS) |
| 80 | Application descriptor | `{ appId: string }` |
| 144 | Connection capabilities (legacy) | Same as type 64 |

**Connection Capabilities Values:**
- `1` = Internet
- `2` = MMS
- `3` = Supl
- `4` = IMS
- `8` = IMS (video)
- `16` = Emergency
- `32` = CBS
- `64` = XCAP

### Route Component Types (TS 24.526 Table 5.2.3-1)

| Type | Description | Value Format |
|------|-------------|--------------|
| 1 | SSC mode | `{ sscMode: number }` (1=SSC1, 2=SSC2, 3=SSC3) |
| 2 | S-NSSAI | `{ sst: number, sd?: string }` |
| 3 | DNN + S-NSSAI | `{ dnn: string, sst: number, sd?: string }` |
| 4 | DNN | `{ dnn: string }` |
| 5 | PDU session type | `{ pduType: number }` (1=IPv4, 2=IPv6, 3=IPv4v6, 4=Unstructured, 5=Ethernet) |
| 6 | Preferred access type | `{ accessType: number }` (1=3GPP, 2=Non-3GPP) |
| 7 | Multi-access preference | `{ preference: number }` |
| 8 | Non-seamless WLAN offload | `{ indication: boolean }` |

## Example Data Mapping

For the `initialPolicyData` in welcome.tsx:

### 1. Create UE Policy
```sql
INSERT INTO ue_policies (id, project_id, name, mcc, mnc)
VALUES ('policy-1', 'default', 'Netflix 4K', '452', '04');
```

### 2. Create URSP Part
```sql
INSERT INTO ue_policy_parts (id, policy_id, part_type, part_name)
VALUES ('part-1', 'policy-1', 1, 'URSP Rules');
```

### 3. Create URSP Rules (4 rules with precedence 0-3)

**Rule 0: Video Traffic**
```sql
INSERT INTO ursp_rules (id, part_id, precedence_value)
VALUES ('rule-0', 'part-1', 0);

-- Traffic descriptor: connectionCapabilities [8] (IMS video)
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-0', 'rule-0', 144, '{"connectionCapabilities":[8]}');

-- Route descriptor: S-NSSAI (sst=1, sd=1)
INSERT INTO route_descriptors (id, rule_id, precedence_value)
VALUES ('rd-0', 'rule-0', 0);

INSERT INTO route_components (id, route_descriptor_id, component_type, component_value)
VALUES ('rc-0', 'rd-0', 2, '{"sst":1,"sd":"1"}');
```

**Rule 1: MMS Traffic**
```sql
INSERT INTO ursp_rules (id, part_id, precedence_value)
VALUES ('rule-1', 'part-1', 1);

-- Traffic descriptor: connectionCapabilities [1] (Internet)
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-1', 'rule-1', 144, '{"connectionCapabilities":[1]}');

-- Route descriptor
INSERT INTO route_descriptors (id, rule_id, precedence_value)
VALUES ('rd-1', 'rule-1', 0);

INSERT INTO route_components (id, route_descriptor_id, component_type, component_value)
VALUES ('rc-1', 'rd-1', 2, '{"sst":1,"sd":"1"}');
```

**Rule 2: Enterprise App (osId-osAppId)**
```sql
INSERT INTO ursp_rules (id, part_id, precedence_value)
VALUES ('rule-2', 'part-1', 2);

-- Traffic descriptor: OS Id + OS App Id
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-2', 'rule-2', 8, 
  '{"osId":"97A498E3FC925C9489860333D06E4E47","osAppId":"454E5445525052495345"}');

-- Route descriptor 1: S-NSSAI (sst=1, sd=0) + DNN
INSERT INTO route_descriptors (id, rule_id, precedence_value)
VALUES ('rd-2-1', 'rule-2', 0);

INSERT INTO route_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rc-2-1-1', 'rd-2-1', 2, '{"sst":1,"sd":"0"}'),
  ('rc-2-1-2', 'rd-2-1', 4, '{"dnn":"0A762D696E7465726E6574"}');

-- Route descriptor 2: S-NSSAI (sst=1, sd=1) + DNN
INSERT INTO route_descriptors (id, rule_id, precedence_value)
VALUES ('rd-2-2', 'rule-2', 1);

INSERT INTO route_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rc-2-2-1', 'rd-2-2', 2, '{"sst":1,"sd":"1"}'),
  ('rc-2-2-2', 'rd-2-2', 4, '{"dnn":"0A762D696E7465726E6574"}');
```

**Rule 3: Match-all (Default)**
```sql
INSERT INTO ursp_rules (id, part_id, precedence_value)
VALUES ('rule-3', 'part-1', 3);

-- Traffic descriptor: match-all
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-3', 'rule-3', 1, 'null');

-- Route descriptor: S-NSSAI + DNN
INSERT INTO route_descriptors (id, rule_id, precedence_value)
VALUES ('rd-3', 'rule-3', 0);

INSERT INTO route_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rc-3-1', 'rd-3', 2, '{"sst":1,"sd":"1"}'),
  ('rc-3-2', 'rd-3', 4, '{"dnn":"0A762D696E7465726E6574"}');
```

## Benefits of This Design

1. ✅ **Flexible**: Supports all 5 policy types (URSP, ANDSP, A2X, V2X, ProSe)
2. ✅ **Compliant**: Follows 3GPP TS 24.526 specification exactly
3. ✅ **Extensible**: Easy to add new traffic/route component types
4. ✅ **Generic**: Uses JSON for complex values, avoiding rigid schemas
5. ✅ **Normalized**: Proper relationships with cascading deletes
6. ✅ **Queryable**: Indexes on key fields for fast queries

## Migration from v2

Since v2 had incorrect structure, recommend fresh start:

```bash
# Drop old database
rm .db/smart-uepolicy.db

# Apply new schema
sqlite3 .db/smart-uepolicy.db < schema/ursp_v3.sql

# For Cloudflare
npx wrangler d1 execute smart-uepolicy --remote --file schema/ursp_v3.sql
```

## Next Steps

1. Update API routes in `workers/routes/ursp.ts`
2. Create API endpoints for:
   - Policies CRUD
   - Policy Parts CRUD
   - URSP Rules + Traffic/Route descriptors CRUD
   - ANDSP, V2X, ProSe rules CRUD
3. Update frontend to use new structure
