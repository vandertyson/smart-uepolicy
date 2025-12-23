-- URSP Database Schema

-- Users/Projects table (for multi-user support)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- URSP Policies (top-level container)
CREATE TABLE IF NOT EXISTS ursp_policies (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mcc TEXT NOT NULL,
  mnc TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- URSP Rules (routing rules within a policy)
CREATE TABLE IF NOT EXISTS ursp_rules (
  id TEXT PRIMARY KEY,
  policy_id TEXT NOT NULL,
  name TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES ursp_policies(id) ON DELETE CASCADE,
  UNIQUE (policy_id, precedence_value)
);

-- Traffic Descriptors (condition matching)
CREATE TABLE IF NOT EXISTS traffic_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT,
  name TEXT NOT NULL,
  type INTEGER NOT NULL,  -- Traffic descriptor type (e.g., 1=match-all, 8=osId-osAppId, 144=connectionCapabilities)
  data_json TEXT NOT NULL,  -- Full JSON structure of the descriptor
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE
);

-- Route Selection Descriptors (how traffic is routed)
CREATE TABLE IF NOT EXISTS route_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  name TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  description TEXT,
  data_json TEXT NOT NULL,  -- Full JSON structure of the descriptor
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE,
  UNIQUE (rule_id, precedence_value)
);

-- S-NSSAI (Network Slice Selection Assistance Information)
CREATE TABLE IF NOT EXISTS s_nssais (
  id TEXT PRIMARY KEY,
  route_descriptor_id TEXT NOT NULL,
  sst INTEGER NOT NULL,  -- Slice/Service type
  sd TEXT,  -- Slice differentiator (optional, can be NULL or hex string)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_descriptor_id) REFERENCES route_descriptors(id) ON DELETE CASCADE
);

-- DNN (Data Network Name)
CREATE TABLE IF NOT EXISTS dnns (
  id TEXT PRIMARY KEY,
  route_descriptor_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_descriptor_id) REFERENCES route_descriptors(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ursp_policies_project_id ON ursp_policies(project_id);
CREATE INDEX IF NOT EXISTS idx_ursp_rules_policy_id ON ursp_rules(policy_id);
CREATE INDEX IF NOT EXISTS idx_traffic_descriptors_rule_id ON traffic_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_route_descriptors_rule_id ON route_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_s_nssais_route_descriptor_id ON s_nssais(route_descriptor_id);
CREATE INDEX IF NOT EXISTS idx_dnns_route_descriptor_id ON dnns(route_descriptor_id);
