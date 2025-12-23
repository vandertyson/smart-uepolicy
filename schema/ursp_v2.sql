-- URSP Database Schema (Revised based on actual 3GPP TS 24.526 structure)

-- Projects table (for multi-user support)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Top level: uePolicySectionManagementList container
CREATE TABLE IF NOT EXISTS ue_policy_sections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- uePolicySectionManagementSublist (contains MCC/MNC and instructions)
CREATE TABLE IF NOT EXISTS ue_policy_sublists (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL,
  mcc TEXT NOT NULL,
  mnc TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES ue_policy_sections(id) ON DELETE CASCADE
);

-- Instructions (contains upsc and uePolicySectionContents)
CREATE TABLE IF NOT EXISTS ue_policy_instructions (
  id TEXT PRIMARY KEY,
  sublist_id TEXT NOT NULL,
  upsc INTEGER NOT NULL,  -- UE policy section contents sequence number
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sublist_id) REFERENCES ue_policy_sublists(id) ON DELETE CASCADE
);

-- uePolicySectionContents (contains uePolicyPart)
CREATE TABLE IF NOT EXISTS ue_policy_section_contents (
  id TEXT PRIMARY KEY,
  instruction_id TEXT NOT NULL,
  spare4 INTEGER DEFAULT 0,
  ue_policy_part_type INTEGER NOT NULL,  -- 1=URSP, 2=ANDSP, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instruction_id) REFERENCES ue_policy_instructions(id) ON DELETE CASCADE
);

-- URSP Rules (actual routing rules from uePolicyPartContents.ursp)
CREATE TABLE IF NOT EXISTS ursp_rules (
  id TEXT PRIMARY KEY,
  section_content_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_content_id) REFERENCES ue_policy_section_contents(id) ON DELETE CASCADE,
  UNIQUE (section_content_id, precedence_value)
);

-- Traffic Descriptors (from urspRule.trafficDescriptor array)
CREATE TABLE IF NOT EXISTS traffic_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  traffic_descriptor_type INTEGER NOT NULL,  -- 1=match-all, 8=osId-osAppId, 16=IP descriptor, 144=connectionCapabilities, etc.
  traffic_descriptor_value TEXT NOT NULL,  -- JSON serialized value
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE
);

-- Route Selection Descriptors (from routeSelectionDescriptorList)
CREATE TABLE IF NOT EXISTS route_selection_descriptors (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  precedence_value INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES ursp_rules(id) ON DELETE CASCADE,
  UNIQUE (rule_id, precedence_value)
);

-- Route Selection Descriptor Contents (array of routing criteria)
CREATE TABLE IF NOT EXISTS route_selection_descriptor_contents (
  id TEXT PRIMARY KEY,
  route_descriptor_id TEXT NOT NULL,
  route_selection_type INTEGER NOT NULL,  -- 1=SSC mode, 2=S-NSSAI, 3=DNN+S-NSSAI, 4=DNN, 5=PDU session type, etc.
  route_selection_value TEXT NOT NULL,  -- JSON serialized value
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_descriptor_id) REFERENCES route_selection_descriptors(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ue_policy_sections_project_id ON ue_policy_sections(project_id);
CREATE INDEX IF NOT EXISTS idx_ue_policy_sublists_section_id ON ue_policy_sublists(section_id);
CREATE INDEX IF NOT EXISTS idx_ue_policy_instructions_sublist_id ON ue_policy_instructions(sublist_id);
CREATE INDEX IF NOT EXISTS idx_ue_policy_section_contents_instruction_id ON ue_policy_section_contents(instruction_id);
CREATE INDEX IF NOT EXISTS idx_ursp_rules_section_content_id ON ursp_rules(section_content_id);
CREATE INDEX IF NOT EXISTS idx_traffic_descriptors_rule_id ON traffic_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_route_selection_descriptors_rule_id ON route_selection_descriptors(rule_id);
CREATE INDEX IF NOT EXISTS idx_route_selection_descriptor_contents_route_descriptor_id ON route_selection_descriptor_contents(route_descriptor_id);
