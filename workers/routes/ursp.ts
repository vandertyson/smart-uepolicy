import { Hono } from "hono";

// ==================== Types ====================

interface UePolicy {
	id: string;
	project_id: string;
	name: string;
	description?: string;
	mcc?: string;
	mnc?: string;
	created_at: string;
	updated_at: string;
}

interface UePolicyPart {
	id: string;
	policy_id: string;
	part_type: number; // 1=URSP, 2=ANDSP, 3=A2X, 4=V2X, 5=ProSe
	part_name?: string;
	created_at: string;
	updated_at: string;
}

interface UrspRule {
	id: string;
	part_id: string;
	precedence_value: number;
	description?: string;
	created_at: string;
	updated_at: string;
}

interface TrafficDescriptor {
	id: string;
	rule_id: string;
	descriptor_type: number;
	descriptor_value: string; // JSON
	created_at: string;
	updated_at: string;
}

interface RouteSelectionDescriptor {
	id: string;
	rule_id: string;
	precedence_value: number;
	created_at: string;
	updated_at: string;
}

interface RouteSelectionComponent {
	id: string;
	route_descriptor_id: string;
	component_type: number;
	component_value: string; // JSON
	created_at: string;
	updated_at: string;
}

// ==================== Router ====================

const urspRouter = new Hono<{ Bindings: CloudflareEnv }>();

// Generate UUID-like ID
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== UE POLICIES ====================

// Get all policies
urspRouter.get("/policies", async (c) => {
	try {
		const projectId = c.req.query("projectId") || "project-default";
		const search = c.req.query("search") || "";
		const db = c.env.smart_uepolicy;
		
		let query = `
			SELECT p.*, 
				COUNT(DISTINCT pp.id) as parts_count,
				COUNT(DISTINCT ur.id) as rules_count
			FROM ue_policies p
			LEFT JOIN ue_policy_parts pp ON p.id = pp.policy_id
			LEFT JOIN ursp_rules ur ON pp.id = ur.part_id
			WHERE p.project_id = ?
		`;
		
		const params: any[] = [projectId];
		
		if (search) {
			query += " AND (p.name LIKE ? OR p.description LIKE ? OR p.mcc LIKE ? OR p.mnc LIKE ?)";
			const searchPattern = `%${search}%`;
			params.push(searchPattern, searchPattern, searchPattern, searchPattern);
		}
		
		query += " GROUP BY p.id ORDER BY p.created_at DESC";
		
		const result = await db.prepare(query).bind(...params).all();

		return c.json({
			success: true,
			data: result.results || [],
			count: result.results?.length || 0
		});
	} catch (error) {
		console.error("Error fetching policies:", error);
		return c.json({ 
			success: false, 
			error: "Failed to fetch policies",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Get single policy with full details
urspRouter.get("/policies/:id", async (c) => {
	try {
		const policyId = c.req.param("id");
		const db = c.env.smart_uepolicy;
		
		// Get policy
		const policy = await db
			.prepare("SELECT * FROM ue_policies WHERE id = ?")
			.bind(policyId)
			.first<UePolicy>();

		if (!policy) {
			return c.json({ success: false, error: "Policy not found" }, 404);
		}

		// Get parts with rules
		const parts = await db
			.prepare(`
				SELECT pp.*, 
					COUNT(DISTINCT ur.id) as rules_count
				FROM ue_policy_parts pp
				LEFT JOIN ursp_rules ur ON pp.id = ur.part_id
				WHERE pp.policy_id = ?
				GROUP BY pp.id
				ORDER BY pp.part_type
			`)
			.bind(policyId)
			.all();

		return c.json({
			success: true,
			data: {
				...policy,
				parts: parts.results || []
			}
		});
	} catch (error) {
		console.error("Error fetching policy:", error);
		return c.json({ 
			success: false, 
			error: "Failed to fetch policy",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Get policy with complete nested structure
urspRouter.get("/policies/:id/full", async (c) => {
	try {
		const policyId = c.req.param("id");
		const db = c.env.smart_uepolicy;
		
		// Get policy
		const policy = await db
			.prepare("SELECT * FROM ue_policies WHERE id = ?")
			.bind(policyId)
			.first<UePolicy>();

		if (!policy) {
			return c.json({ success: false, error: "Policy not found" }, 404);
		}

		// Get parts
		const partsResult = await db
			.prepare("SELECT * FROM ue_policy_parts WHERE policy_id = ? ORDER BY part_type")
			.bind(policyId)
			.all<UePolicyPart>();

		const parts = [];
		
		for (const part of partsResult.results || []) {
			// Get rules for this part
			const rulesResult = await db
				.prepare("SELECT * FROM ursp_rules WHERE part_id = ? ORDER BY precedence_value")
				.bind(part.id)
				.all<UrspRule>();

			const rules = [];
			
			for (const rule of rulesResult.results || []) {
				// Get traffic descriptors
				const trafficDescriptors = await db
					.prepare("SELECT * FROM traffic_descriptors WHERE rule_id = ?")
					.bind(rule.id)
					.all<TrafficDescriptor>();

				// Get route descriptors with components
				const routeDescriptorsResult = await db
					.prepare("SELECT * FROM route_selection_descriptors WHERE rule_id = ? ORDER BY precedence_value")
					.bind(rule.id)
					.all<RouteSelectionDescriptor>();

				const routes = [];
				
				for (const route of routeDescriptorsResult.results || []) {
					const components = await db
						.prepare("SELECT * FROM route_selection_components WHERE route_descriptor_id = ?")
						.bind(route.id)
						.all<RouteSelectionComponent>();

					routes.push({
						...route,
						components: (components.results || []).map(c => ({
							...c,
							value: JSON.parse(c.component_value)
						}))
					});
				}

				rules.push({
					...rule,
					trafficDescriptors: (trafficDescriptors.results || []).map(td => ({
						...td,
						value: td.descriptor_value === 'null' ? null : JSON.parse(td.descriptor_value)
					})),
					routes
				});
			}

			parts.push({
				...part,
				rules
			});
		}

		return c.json({
			success: true,
			data: {
				...policy,
				parts
			}
		});
	} catch (error) {
		console.error("Error fetching full policy:", error);
		return c.json({ 
			success: false, 
			error: "Failed to fetch full policy",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Create policy
urspRouter.post("/policies", async (c) => {
	try {
		const body = await c.req.json();
		const db = c.env.smart_uepolicy;
		
		const id = `policy-${generateId()}`;
		const projectId = body.project_id || "project-default";
		
		await db
			.prepare(`
				INSERT INTO ue_policies (id, project_id, name, description, mcc, mnc)
				VALUES (?, ?, ?, ?, ?, ?)
			`)
			.bind(id, projectId, body.name, body.description || null, body.mcc || null, body.mnc || null)
			.run();

		const policy = await db
			.prepare("SELECT * FROM ue_policies WHERE id = ?")
			.bind(id)
			.first<UePolicy>();

		return c.json({ success: true, data: policy }, 201);
	} catch (error) {
		console.error("Error creating policy:", error);
		return c.json({ 
			success: false, 
			error: "Failed to create policy",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Update policy
urspRouter.put("/policies/:id", async (c) => {
	try {
		const policyId = c.req.param("id");
		const body = await c.req.json();
		const db = c.env.smart_uepolicy;
		
		await db
			.prepare(`
				UPDATE ue_policies 
				SET name = ?, description = ?, mcc = ?, mnc = ?, updated_at = CURRENT_TIMESTAMP
				WHERE id = ?
			`)
			.bind(body.name, body.description || null, body.mcc || null, body.mnc || null, policyId)
			.run();

		const policy = await db
			.prepare("SELECT * FROM ue_policies WHERE id = ?")
			.bind(policyId)
			.first<UePolicy>();

		return c.json({ success: true, data: policy });
	} catch (error) {
		console.error("Error updating policy:", error);
		return c.json({ 
			success: false, 
			error: "Failed to update policy",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Delete policy
urspRouter.delete("/policies/:id", async (c) => {
	try {
		const policyId = c.req.param("id");
		const db = c.env.smart_uepolicy;
		
		await db
			.prepare("DELETE FROM ue_policies WHERE id = ?")
			.bind(policyId)
			.run();

		return c.json({ success: true, message: "Policy deleted" });
	} catch (error) {
		console.error("Error deleting policy:", error);
		return c.json({ 
			success: false, 
			error: "Failed to delete policy",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// ==================== POLICY PARTS ====================

// Get parts for a policy
urspRouter.get("/policies/:policyId/parts", async (c) => {
	try {
		const policyId = c.req.param("policyId");
		const db = c.env.smart_uepolicy;
		
		const parts = await db
			.prepare("SELECT * FROM ue_policy_parts WHERE policy_id = ? ORDER BY part_type")
			.bind(policyId)
			.all<UePolicyPart>();

		return c.json({ success: true, data: parts.results || [] });
	} catch (error) {
		console.error("Error fetching parts:", error);
		return c.json({ 
			success: false, 
			error: "Failed to fetch parts",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Create policy part
urspRouter.post("/policies/:policyId/parts", async (c) => {
	try {
		const policyId = c.req.param("policyId");
		const body = await c.req.json();
		const db = c.env.smart_uepolicy;
		
		const id = `part-${generateId()}`;
		
		await db
			.prepare(`
				INSERT INTO ue_policy_parts (id, policy_id, part_type, part_name)
				VALUES (?, ?, ?, ?)
			`)
			.bind(id, policyId, body.part_type, body.part_name || null)
			.run();

		const part = await db
			.prepare("SELECT * FROM ue_policy_parts WHERE id = ?")
			.bind(id)
			.first<UePolicyPart>();

		return c.json({ success: true, data: part }, 201);
	} catch (error) {
		console.error("Error creating part:", error);
		return c.json({ 
			success: false, 
			error: "Failed to create part",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// ==================== URSP RULES ====================

// Get rules for a part
urspRouter.get("/parts/:partId/rules", async (c) => {
	try {
		const partId = c.req.param("partId");
		const db = c.env.smart_uepolicy;
		
		const rules = await db
			.prepare(`
				SELECT ur.*,
					COUNT(DISTINCT td.id) as traffic_descriptors_count,
					COUNT(DISTINCT rsd.id) as routes_count
				FROM ursp_rules ur
				LEFT JOIN traffic_descriptors td ON ur.id = td.rule_id
				LEFT JOIN route_selection_descriptors rsd ON ur.id = rsd.rule_id
				WHERE ur.part_id = ?
				GROUP BY ur.id
				ORDER BY ur.precedence_value
			`)
			.bind(partId)
			.all();

		return c.json({ success: true, data: rules.results || [] });
	} catch (error) {
		console.error("Error fetching rules:", error);
		return c.json({ 
			success: false, 
			error: "Failed to fetch rules",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Get single rule with details
urspRouter.get("/rules/:ruleId", async (c) => {
	try {
		const ruleId = c.req.param("ruleId");
		const db = c.env.smart_uepolicy;
		
		// Get rule
		const rule = await db
			.prepare("SELECT * FROM ursp_rules WHERE id = ?")
			.bind(ruleId)
			.first<UrspRule>();

		if (!rule) {
			return c.json({ success: false, error: "Rule not found" }, 404);
		}

		// Get traffic descriptors
		const trafficDescriptors = await db
			.prepare("SELECT * FROM traffic_descriptors WHERE rule_id = ?")
			.bind(ruleId)
			.all<TrafficDescriptor>();

		// Get route descriptors with components
		const routeDescriptorsResult = await db
			.prepare("SELECT * FROM route_selection_descriptors WHERE rule_id = ? ORDER BY precedence_value")
			.bind(ruleId)
			.all<RouteSelectionDescriptor>();

		const routes = [];
		
		for (const route of routeDescriptorsResult.results || []) {
			const components = await db
				.prepare("SELECT * FROM route_selection_components WHERE route_descriptor_id = ?")
				.bind(route.id)
				.all<RouteSelectionComponent>();

			routes.push({
				...route,
				components: (components.results || []).map(c => ({
					...c,
					value: JSON.parse(c.component_value)
				}))
			});
		}

		return c.json({
			success: true,
			data: {
				...rule,
				trafficDescriptors: (trafficDescriptors.results || []).map(td => ({
					...td,
					value: td.descriptor_value === 'null' ? null : JSON.parse(td.descriptor_value)
				})),
				routes
			}
		});
	} catch (error) {
		console.error("Error fetching rule:", error);
		return c.json({ 
			success: false, 
			error: "Failed to fetch rule",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Create URSP rule
urspRouter.post("/parts/:partId/rules", async (c) => {
	try {
		const partId = c.req.param("partId");
		const body = await c.req.json();
		const db = c.env.smart_uepolicy;
		
		const id = `rule-${generateId()}`;
		
		await db
			.prepare(`
				INSERT INTO ursp_rules (id, part_id, precedence_value, description)
				VALUES (?, ?, ?, ?)
			`)
			.bind(id, partId, body.precedence_value, body.description || null)
			.run();

		const rule = await db
			.prepare("SELECT * FROM ursp_rules WHERE id = ?")
			.bind(id)
			.first<UrspRule>();

		return c.json({ success: true, data: rule }, 201);
	} catch (error) {
		console.error("Error creating rule:", error);
		return c.json({ 
			success: false, 
			error: "Failed to create rule",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Update URSP rule
urspRouter.put("/rules/:ruleId", async (c) => {
	try {
		const ruleId = c.req.param("ruleId");
		const body = await c.req.json();
		const db = c.env.smart_uepolicy;
		
		await db
			.prepare(`
				UPDATE ursp_rules 
				SET precedence_value = ?, description = ?, updated_at = CURRENT_TIMESTAMP
				WHERE id = ?
			`)
			.bind(body.precedence_value, body.description || null, ruleId)
			.run();

		const rule = await db
			.prepare("SELECT * FROM ursp_rules WHERE id = ?")
			.bind(ruleId)
			.first<UrspRule>();

		return c.json({ success: true, data: rule });
	} catch (error) {
		console.error("Error updating rule:", error);
		return c.json({ 
			success: false, 
			error: "Failed to update rule",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// Delete URSP rule
urspRouter.delete("/rules/:ruleId", async (c) => {
	try {
		const ruleId = c.req.param("ruleId");
		const db = c.env.smart_uepolicy;
		
		await db
			.prepare("DELETE FROM ursp_rules WHERE id = ?")
			.bind(ruleId)
			.run();

		return c.json({ success: true, message: "Rule deleted" });
	} catch (error) {
		console.error("Error deleting rule:", error);
		return c.json({ 
			success: false, 
			error: "Failed to delete rule",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

// ==================== SEARCH ====================

// Search across all policies
urspRouter.get("/search", async (c) => {
	try {
		const query = c.req.query("q") || "";
		const type = c.req.query("type") || "all"; // all, policy, rule
		const db = c.env.smart_uepolicy;
		
		if (!query) {
			return c.json({ success: true, data: [] });
		}

		const searchPattern = `%${query}%`;
		const results: any = {
			policies: [],
			rules: []
		};

		if (type === "all" || type === "policy") {
			// Search policies
			const policiesResult = await db
				.prepare(`
					SELECT p.*, 
						COUNT(DISTINCT pp.id) as parts_count,
						COUNT(DISTINCT ur.id) as rules_count
					FROM ue_policies p
					LEFT JOIN ue_policy_parts pp ON p.id = pp.policy_id
					LEFT JOIN ursp_rules ur ON pp.id = ur.part_id
					WHERE p.name LIKE ? OR p.description LIKE ? OR p.mcc LIKE ? OR p.mnc LIKE ?
					GROUP BY p.id
					ORDER BY p.name
					LIMIT 50
				`)
				.bind(searchPattern, searchPattern, searchPattern, searchPattern)
				.all();

			results.policies = policiesResult.results || [];
		}

		if (type === "all" || type === "rule") {
			// Search rules
			const rulesResult = await db
				.prepare(`
					SELECT ur.*, p.name as policy_name, pp.part_name
					FROM ursp_rules ur
					JOIN ue_policy_parts pp ON ur.part_id = pp.id
					JOIN ue_policies p ON pp.policy_id = p.id
					WHERE ur.description LIKE ?
					ORDER BY ur.precedence_value
					LIMIT 50
				`)
				.bind(searchPattern)
				.all();

			results.rules = rulesResult.results || [];
		}

		return c.json({ 
			success: true, 
			data: results,
			count: (results.policies?.length || 0) + (results.rules?.length || 0)
		});
	} catch (error) {
		console.error("Error searching:", error);
		return c.json({ 
			success: false, 
			error: "Search failed",
			message: error instanceof Error ? error.message : String(error)
		}, 500);
	}
});

export default urspRouter;
