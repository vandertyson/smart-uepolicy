-- Seed data for testing
-- Based on initialPolicyData from welcome.tsx

-- 1. Create default project
INSERT INTO projects (id, name, description)
VALUES ('project-default', 'Default Project', 'Default project for testing');

-- 2. Create UE Policy
INSERT INTO ue_policies (id, project_id, name, description, mcc, mnc)
VALUES ('policy-netflix-4k', 'project-default', 'Netflix 4K', 'Policy for Netflix 4K streaming', '452', '04');

-- 3. Create URSP Part
INSERT INTO ue_policy_parts (id, policy_id, part_type, part_name)
VALUES ('part-ursp-1', 'policy-netflix-4k', 1, 'URSP Rules');

-- ==================== URSP Rules ====================

-- Rule 0: Video Traffic (IMS video streaming)
INSERT INTO ursp_rules (id, part_id, precedence_value, description)
VALUES ('rule-0', 'part-ursp-1', 0, 'Video streaming traffic');

-- Traffic descriptor: connectionCapabilities [8] (IMS video)
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-0', 'rule-0', 144, '{"connectionCapabilities":[8]}');

-- Route: S-NSSAI (sst=1, sd=1)
INSERT INTO route_selection_descriptors (id, rule_id, precedence_value)
VALUES ('rd-0', 'rule-0', 0);

INSERT INTO route_selection_components (id, route_descriptor_id, component_type, component_value)
VALUES ('rsc-0-1', 'rd-0', 2, '{"sst":1,"sd":"1"}');

-- Rule 1: MMS Traffic (Internet connectivity)
INSERT INTO ursp_rules (id, part_id, precedence_value, description)
VALUES ('rule-1', 'part-ursp-1', 1, 'MMS/Internet traffic');

-- Traffic descriptor: connectionCapabilities [1] (Internet)
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-1', 'rule-1', 144, '{"connectionCapabilities":[1]}');

-- Route: S-NSSAI (sst=1, sd=1)
INSERT INTO route_selection_descriptors (id, rule_id, precedence_value)
VALUES ('rd-1', 'rule-1', 0);

INSERT INTO route_selection_components (id, route_descriptor_id, component_type, component_value)
VALUES ('rsc-1-1', 'rd-1', 2, '{"sst":1,"sd":"1"}');

-- Rule 2: Enterprise App (OS ID + OS App ID)
INSERT INTO ursp_rules (id, part_id, precedence_value, description)
VALUES ('rule-2', 'part-ursp-1', 2, 'Enterprise application traffic');

-- Traffic descriptor: OS Id + OS App Id
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-2', 'rule-2', 8, '{"osId":"97A498E3FC925C9489860333D06E4E47","osAppId":"454E5445525052495345"}');

-- Route 1: S-NSSAI (sst=1, sd=0) + DNN (precedence 0 = highest)
INSERT INTO route_selection_descriptors (id, rule_id, precedence_value)
VALUES ('rd-2-1', 'rule-2', 0);

INSERT INTO route_selection_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rsc-2-1-1', 'rd-2-1', 2, '{"sst":1,"sd":"0"}'),
  ('rsc-2-1-2', 'rd-2-1', 4, '{"dnn":"0A762D696E7465726E6574"}');

-- Route 2: S-NSSAI (sst=1, sd=1) + DNN (precedence 1 = lower priority)
INSERT INTO route_selection_descriptors (id, rule_id, precedence_value)
VALUES ('rd-2-2', 'rule-2', 1);

INSERT INTO route_selection_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rsc-2-2-1', 'rd-2-2', 2, '{"sst":1,"sd":"1"}'),
  ('rsc-2-2-2', 'rd-2-2', 4, '{"dnn":"0A762D696E7465726E6574"}');

-- Rule 3: Match-all (Default route)
INSERT INTO ursp_rules (id, part_id, precedence_value, description)
VALUES ('rule-3', 'part-ursp-1', 3, 'Default match-all traffic');

-- Traffic descriptor: match-all
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-3', 'rule-3', 1, 'null');

-- Route: S-NSSAI + DNN
INSERT INTO route_selection_descriptors (id, rule_id, precedence_value)
VALUES ('rd-3', 'rule-3', 0);

INSERT INTO route_selection_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rsc-3-1', 'rd-3', 2, '{"sst":1,"sd":"1"}'),
  ('rsc-3-2', 'rd-3', 4, '{"dnn":"0A762D696E7465726E6574"}');

-- ==================== Additional Test Data ====================

-- Create another UE Policy for variety
INSERT INTO ue_policies (id, project_id, name, description, mcc, mnc)
VALUES ('policy-gaming', 'project-default', 'Gaming Priority', 'Low latency policy for gaming', '452', '04');

-- Create URSP Part for gaming policy
INSERT INTO ue_policy_parts (id, policy_id, part_type, part_name)
VALUES ('part-ursp-2', 'policy-gaming', 1, 'Gaming URSP Rules');

-- Gaming rule: Low latency traffic
INSERT INTO ursp_rules (id, part_id, precedence_value, description)
VALUES ('rule-gaming-1', 'part-ursp-2', 0, 'Gaming traffic with low latency');

-- Traffic descriptor: match-all
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-gaming-1', 'rule-gaming-1', 1, 'null');

-- Route: S-NSSAI for low latency (sst=2, sd=100)
INSERT INTO route_selection_descriptors (id, rule_id, precedence_value)
VALUES ('rd-gaming-1', 'rule-gaming-1', 0);

INSERT INTO route_selection_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rsc-gaming-1-1', 'rd-gaming-1', 2, '{"sst":2,"sd":"100"}'),
  ('rsc-gaming-1-2', 'rd-gaming-1', 4, '{"dnn":"0A762D67616D696E67"}');

-- Create IoT Policy
INSERT INTO ue_policies (id, project_id, name, description, mcc, mnc)
VALUES ('policy-iot', 'project-default', 'IoT Devices', 'Policy for IoT sensor devices', '452', '04');

-- Create URSP Part for IoT policy
INSERT INTO ue_policy_parts (id, policy_id, part_type, part_name)
VALUES ('part-ursp-3', 'policy-iot', 1, 'IoT URSP Rules');

-- IoT rule: Sensor data
INSERT INTO ursp_rules (id, part_id, precedence_value, description)
VALUES ('rule-iot-1', 'part-ursp-3', 0, 'IoT sensor data traffic');

-- Traffic descriptor: IP descriptor for specific port
INSERT INTO traffic_descriptors (id, rule_id, descriptor_type, descriptor_value)
VALUES ('td-iot-1', 'rule-iot-1', 16, '{"protocol":17,"destPort":8883}');

-- Route: S-NSSAI for IoT (sst=3, sd=200)
INSERT INTO route_selection_descriptors (id, rule_id, precedence_value)
VALUES ('rd-iot-1', 'rule-iot-1', 0);

INSERT INTO route_selection_components (id, route_descriptor_id, component_type, component_value)
VALUES 
  ('rsc-iot-1-1', 'rd-iot-1', 2, '{"sst":3,"sd":"200"}'),
  ('rsc-iot-1-2', 'rd-iot-1', 4, '{"dnn":"0A762D696F74"}');
