-- URSP Database Schema v3 (Simplified, starts from UePolicySectionContents)
-- Based on 3GPP TS 24.526 specification

-- Projects table (for multi-tenancy)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Top-level UE Policy (equivalent to uePolicySectionContents)
CREATE TABLE IF NOT EXISTS ue_policies (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  mcc TEXT,  -- Mobile Country Code (optional, can be at part level)
  mnc TEXT,  -- Mobile Network Code (optional, can be at part level)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- UE Policy Parts (each policy can have multiple parts of different types)
CREATE TABLE IF NOT EXISTS ue_policy_parts (
  id TEXT PRIMARY KEY,
  policy_id TEXT NOT NULL,
  part_type INTEGER NOT NULL,  -- 1=URSP, 2=ANDSP, 3=A2X, 4=V2X, 5=ProSe
  part_name TEXT,  -- Optional name for this part
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES ue_policies(id) ON DELETE CASCADE
);

-- ==================== URSP (part_type = 1) ====================

-- URSP Rules (for URSP policy parts)
CREATE TABLE IF NOT EXISTS ursp_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,  -- Lower value = higher priority
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- Traffic Descriptors (conditions for matching traffic)
-- Based on TS 24.526 Table 5.2.1-1
CREATE TABLE IF NOT EXISTS traffic_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  descriptor_type INTEGER NOT NULL,  -- Traffic descriptor type codes
  descriptor_value TEXT NOT NULL,  -- JSON-encoded value
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE
);

-- Traffic Descriptor Types (TS 24.526):
-- 1   = Match-all
-- 8   = OS Id + OS App Id
-- 16  = IP descriptor (destination IP, port, protocol)
-- 32  = Non-IP descriptor
-- 48  = Domain descriptor
-- 64  = Connection capabilities (IMS, MMS, Internet, etc.)
-- 80  = Application descriptor
-- 144 = Connection capabilities (deprecated - use 64)

-- Route Selection Descriptors (defines route precedence)
CREATE TABLE IF NOT EXISTS route_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,  -- Route precedence (lower = higher priority)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE,
  UNIQUE (rule_id, precedence_value)
);

-- Route Descriptor Components (DNN, S-NSSAI, etc.)
-- Based on TS 24.526 Table 5.2.3-1
CREATE TABLE IF NOT EXISTS route_components (
  id TEXT PRIMARY KEY,
  route_descriptor_id TEXT NOT NULL,
  component_type INTEGER NOT NULL,  -- Route selection component type
  component_value TEXT NOT NULL,  -- JSON-encoded value
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_descriptor_id) REFERENCES route_descriptors(id) ON DELETE CASCADE
);

-- Route Component Types (TS 24.526):
-- 1 = SSC mode
-- 2 = S-NSSAI (Network Slice Selection Assistance Information)
--     Value: { sst: number, sd?: string }
-- 3 = DNN + S-NSSAI
-- 4 = DNN (Data Network Name)
--     Value: { dnn: string }
-- 5 = PDU session type
-- 6 = Preferred access type
-- 7 = Multi-access preference
-- 8 = Non-seamless WLAN offload indication

-- ==================== ANDSP (part_type = 2) ====================

-- ANDSP Rules (for ANDSP policy parts)
CREATE TABLE IF NOT EXISTS andsp_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  wlan_sp_rule_id TEXT,  -- WLAN Selection Policy rule identifier
  criteria TEXT NOT NULL,  -- JSON-encoded selection criteria
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- ==================== A2X / V2X (part_type = 3, 4) ====================

-- V2X Rules (for V2X policy parts)
CREATE TABLE IF NOT EXISTS v2x_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  service_type TEXT NOT NULL,  -- V2V, V2I, V2N, V2P
  configuration TEXT NOT NULL,  -- JSON-encoded V2X configuration
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- ==================== ProSe (part_type = 5) ====================

-- ProSe Rules (for Proximity Services policy parts)
CREATE TABLE IF NOT EXISTS prose_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  prose_service_type TEXT NOT NULL,  -- Direct discovery, Direct communication, etc.
  configuration TEXT NOT NULL,  -- JSON-encoded ProSe configuration
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- ==================== Indexes ====================

CREATE INDEX IF NOT EXISTS idx_ue_policies_project_id ON ue_policies(project_id);
CREATE INDEX IF NOT EXISTS idx_ue_policy_parts_policy_id ON ue_policy_parts(policy_id);
CREATE INDEX IF NOT EXISTS idx_ue_policy_parts_type ON ue_policy_parts(part_type);

-- URSP indexes
CREATE INDEX IF NOT EXISTS idx_ursp_rules_part_id ON ursp_rules(part_id);
CREATE INDEX IF NOT EXISTS idx_ursp_rules_precedence ON ursp_rules(part_id, precedence_value);
CREATE INDEX IF NOT EXISTS idx_traffic_descriptors_rule_id ON traffic_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_route_descriptors_rule_id ON route_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_route_components_descriptor_id ON route_components(route_descriptor_id);

-- Other policy type indexes
CREATE INDEX IF NOT EXISTS idx_andsp_rules_part_id ON andsp_rules(part_id);
CREATE INDEX IF NOT EXISTS idx_v2x_rules_part_id ON v2x_rules(part_id);
CREATE INDEX IF NOT EXISTS idx_prose_rules_part_id ON prose_rules(part_id);
