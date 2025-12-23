-- URSP Database Schema v3 (Corrected naming)
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
  mcc TEXT,
  mnc TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- UE Policy Parts (each policy can have multiple parts of different types)
CREATE TABLE IF NOT EXISTS ue_policy_parts (
  id TEXT PRIMARY KEY,
  policy_id TEXT NOT NULL,
  part_type INTEGER NOT NULL,  -- 1=URSP, 2=ANDSP, 3=A2X, 4=V2X, 5=ProSe
  part_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES ue_policies(id) ON DELETE CASCADE
);

-- ==================== URSP (part_type = 1) ====================

-- URSP Rules
CREATE TABLE IF NOT EXISTS ursp_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- Traffic Descriptors (conditions for matching traffic)
CREATE TABLE IF NOT EXISTS traffic_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  descriptor_type INTEGER NOT NULL,
  descriptor_value TEXT NOT NULL,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE
);

-- Route Selection Descriptors (1 rule → N routes, mỗi route có precedence riêng)
CREATE TABLE IF NOT EXISTS route_selection_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,  -- Độ ưu tiên của route này
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE,
  UNIQUE (rule_id, precedence_value)
);

-- Route Selection Components (Tập hợp các chỉ thị: S-NSSAI, DNN, PDU type, Access type, etc.)
CREATE TABLE IF NOT EXISTS route_selection_components (
  id TEXT PRIMARY KEY,
  route_descriptor_id TEXT NOT NULL,
  component_type INTEGER NOT NULL,  -- 2=S-NSSAI, 4=DNN, 5=PDU type, 6=Access type, etc.
  component_value TEXT NOT NULL,  -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_descriptor_id) REFERENCES route_selection_descriptors(id) ON DELETE CASCADE
);

-- ==================== ANDSP (part_type = 2) ====================

CREATE TABLE IF NOT EXISTS andsp_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  wlan_sp_rule_id TEXT,
  criteria TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- ==================== V2X (part_type = 4) ====================

CREATE TABLE IF NOT EXISTS v2x_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  configuration TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- ==================== ProSe (part_type = 5) ====================

CREATE TABLE IF NOT EXISTS prose_rules (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  prose_service_type TEXT NOT NULL,
  configuration TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES ue_policy_parts(id) ON DELETE CASCADE,
  UNIQUE (part_id, precedence_value)
);

-- ==================== Indexes ====================

CREATE INDEX IF NOT EXISTS idx_ue_policies_project_id ON ue_policies(project_id);
CREATE INDEX IF NOT EXISTS idx_ue_policy_parts_policy_id ON ue_policy_parts(policy_id);
CREATE INDEX IF NOT EXISTS idx_ue_policy_parts_type ON ue_policy_parts(part_type);

CREATE INDEX IF NOT EXISTS idx_ursp_rules_part_id ON ursp_rules(part_id);
CREATE INDEX IF NOT EXISTS idx_ursp_rules_precedence ON ursp_rules(part_id, precedence_value);
CREATE INDEX IF NOT EXISTS idx_traffic_descriptors_rule_id ON traffic_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_route_selection_descriptors_rule_id ON route_selection_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_route_selection_components_descriptor_id ON route_selection_components(route_descriptor_id);

CREATE INDEX IF NOT EXISTS idx_andsp_rules_part_id ON andsp_rules(part_id);
CREATE INDEX IF NOT EXISTS idx_v2x_rules_part_id ON v2x_rules(part_id);
CREATE INDEX IF NOT EXISTS idx_prose_rules_part_id ON prose_rules(part_id);
