import { Hono } from "hono";

interface UrspPolicy {
	id: string;
	project_id: string;
	name: string;
	mcc: string;
	mnc: string;
	description?: string;
	is_active: number;
	created_at: string;
	updated_at: string;
}

interface UrspRule {
	id: string;
	policy_id: string;
	name: string;
	precedence_value: number;
	description?: string;
	created_at: string;
	updated_at: string;
}

interface TrafficDescriptor {
	id: string;
	rule_id?: string;
	name: string;
	type: number;
	data_json: string;
	created_at: string;
	updated_at: string;
}

interface RouteDescriptor {
	id: string;
	rule_id: string;
	name: string;
	precedence_value: number;
	description?: string;
	data_json: string;
	created_at: string;
	updated_at: string;
}

const urspRouter = new Hono<{ Bindings: CloudflareEnv }>();

// Generate UUID-like ID
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== POLICIES ====================

// Get all policies for a project
urspRouter.get("/policies", async (c) => {
	try {
		const projectId = c.req.query("projectId") || "default";
		const db = c.env.DB;
		
		const policies = await db
			.prepare("SELECT * FROM ursp_policies WHERE project_id = ?")
			.bind(projectId)
			.all<UrspPolicy>();

		return c.json(policies.results || []);
	} catch (error) {
		console.error("Error fetching policies:", error);
		return c.json({ error: "Failed to fetch policies" }, 500);
	}
});

// Get single policy
urspRouter.get("/policies/:id", async (c) => {
	try {
		const db = c.env.DB;
		const policy = await db
			.prepare("SELECT * FROM ursp_policies WHERE id = ?")
			.bind(c.req.param("id"))
			.first<UrspPolicy>();

		if (!policy) {
			return c.json({ error: "Policy not found" }, 404);
		}
		return c.json(policy);
	} catch (error) {
		console.error("Error fetching policy:", error);
		return c.json({ error: "Failed to fetch policy" }, 500);
	}
});

// Create policy
urspRouter.post("/policies", async (c) => {
	try {
		const db = c.env.DB;
		const body = await c.req.json();
		const projectId = body.projectId || "default";
		const id = generateId();

		const result = await db
			.prepare(
				"INSERT INTO ursp_policies (id, project_id, name, mcc, mnc, description) VALUES (?, ?, ?, ?, ?, ?)"
			)
			.bind(
				id,
				projectId,
				body.name,
				body.mcc,
				body.mnc,
				body.description || null
			)
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to create policy" }, 500);
		}

		const policy = await db
			.prepare("SELECT * FROM ursp_policies WHERE id = ?")
			.bind(id)
			.first<UrspPolicy>();

		return c.json(policy, 201);
	} catch (error) {
		console.error("Error creating policy:", error);
		return c.json({ error: "Failed to create policy" }, 500);
	}
});

// Update policy
urspRouter.put("/policies/:id", async (c) => {
	try {
		const db = c.env.DB;
		const body = await c.req.json();

		const result = await db
			.prepare(
				"UPDATE ursp_policies SET name = ?, mcc = ?, mnc = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
			)
			.bind(body.name, body.mcc, body.mnc, body.description || null, c.req.param("id"))
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to update policy" }, 500);
		}

		const policy = await db
			.prepare("SELECT * FROM ursp_policies WHERE id = ?")
			.bind(c.req.param("id"))
			.first<UrspPolicy>();

		return c.json(policy);
	} catch (error) {
		console.error("Error updating policy:", error);
		return c.json({ error: "Failed to update policy" }, 500);
	}
});

// Delete policy
urspRouter.delete("/policies/:id", async (c) => {
	try {
		const db = c.env.DB;

		const result = await db
			.prepare("DELETE FROM ursp_policies WHERE id = ?")
			.bind(c.req.param("id"))
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to delete policy" }, 500);
		}

		return c.json({ success: true });
	} catch (error) {
		console.error("Error deleting policy:", error);
		return c.json({ error: "Failed to delete policy" }, 500);
	}
});

// ==================== RULES ====================

// Get rules for a policy
urspRouter.get("/policies/:policyId/rules", async (c) => {
	try {
		const db = c.env.DB;
		const rules = await db
			.prepare("SELECT * FROM ursp_rules WHERE policy_id = ? ORDER BY precedence_value ASC")
			.bind(c.req.param("policyId"))
			.all<UrspRule>();

		return c.json(rules.results || []);
	} catch (error) {
		console.error("Error fetching rules:", error);
		return c.json({ error: "Failed to fetch rules" }, 500);
	}
});

// Create rule
urspRouter.post("/policies/:policyId/rules", async (c) => {
	try {
		const db = c.env.DB;
		const body = await c.req.json();
		const id = generateId();

		const result = await db
			.prepare(
				"INSERT INTO ursp_rules (id, policy_id, name, precedence_value, description) VALUES (?, ?, ?, ?, ?)"
			)
			.bind(
				id,
				c.req.param("policyId"),
				body.name,
				body.precedence_value,
				body.description || null
			)
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to create rule" }, 500);
		}

		const rule = await db
			.prepare("SELECT * FROM ursp_rules WHERE id = ?")
			.bind(id)
			.first<UrspRule>();

		return c.json(rule, 201);
	} catch (error) {
		console.error("Error creating rule:", error);
		return c.json({ error: "Failed to create rule" }, 500);
	}
});

// Update rule
urspRouter.put("/rules/:id", async (c) => {
	try {
		const db = c.env.DB;
		const body = await c.req.json();

		const result = await db
			.prepare(
				"UPDATE ursp_rules SET name = ?, precedence_value = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
			)
			.bind(body.name, body.precedence_value, body.description || null, c.req.param("id"))
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to update rule" }, 500);
		}

		const rule = await db
			.prepare("SELECT * FROM ursp_rules WHERE id = ?")
			.bind(c.req.param("id"))
			.first<UrspRule>();

		return c.json(rule);
	} catch (error) {
		console.error("Error updating rule:", error);
		return c.json({ error: "Failed to update rule" }, 500);
	}
});

// Delete rule
urspRouter.delete("/rules/:id", async (c) => {
	try {
		const db = c.env.DB;

		const result = await db
			.prepare("DELETE FROM ursp_rules WHERE id = ?")
			.bind(c.req.param("id"))
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to delete rule" }, 500);
		}

		return c.json({ success: true });
	} catch (error) {
		console.error("Error deleting rule:", error);
		return c.json({ error: "Failed to delete rule" }, 500);
	}
});

// ==================== TRAFFIC DESCRIPTORS ====================

// Get traffic descriptors for a rule
urspRouter.get("/rules/:ruleId/traffic-descriptors", async (c) => {
	try {
		const db = c.env.DB;
		const descriptors = await db
			.prepare("SELECT * FROM traffic_descriptors WHERE rule_id = ?")
			.bind(c.req.param("ruleId"))
			.all<TrafficDescriptor>();

		return c.json(
			descriptors.results?.map((d) => ({
				...d,
				data_json: JSON.parse(d.data_json),
			})) || []
		);
	} catch (error) {
		console.error("Error fetching traffic descriptors:", error);
		return c.json({ error: "Failed to fetch traffic descriptors" }, 500);
	}
});

// Create traffic descriptor
urspRouter.post("/rules/:ruleId/traffic-descriptors", async (c) => {
	try {
		const db = c.env.DB;
		const body = await c.req.json();
		const id = generateId();

		const result = await db
			.prepare(
				"INSERT INTO traffic_descriptors (id, rule_id, name, type, data_json) VALUES (?, ?, ?, ?, ?)"
			)
			.bind(
				id,
				c.req.param("ruleId"),
				body.name,
				body.type,
				JSON.stringify(body.data)
			)
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to create traffic descriptor" }, 500);
		}

		const descriptor = await db
			.prepare("SELECT * FROM traffic_descriptors WHERE id = ?")
			.bind(id)
			.first<TrafficDescriptor>();

		if (descriptor) {
			return c.json({ ...descriptor, data_json: JSON.parse(descriptor.data_json) }, 201);
		}
		return c.json({ error: "Failed to fetch created descriptor" }, 500);
	} catch (error) {
		console.error("Error creating traffic descriptor:", error);
		return c.json({ error: "Failed to create traffic descriptor" }, 500);
	}
});

// ==================== ROUTE DESCRIPTORS ====================

// Get route descriptors for a rule
urspRouter.get("/rules/:ruleId/route-descriptors", async (c) => {
	try {
		const db = c.env.DB;
		const descriptors = await db
			.prepare("SELECT * FROM route_descriptors WHERE rule_id = ? ORDER BY precedence_value ASC")
			.bind(c.req.param("ruleId"))
			.all<RouteDescriptor>();

		return c.json(
			descriptors.results?.map((d) => ({
				...d,
				data_json: JSON.parse(d.data_json),
			})) || []
		);
	} catch (error) {
		console.error("Error fetching route descriptors:", error);
		return c.json({ error: "Failed to fetch route descriptors" }, 500);
	}
});

// Create route descriptor
urspRouter.post("/rules/:ruleId/route-descriptors", async (c) => {
	try {
		const db = c.env.DB;
		const body = await c.req.json();
		const id = generateId();

		const result = await db
			.prepare(
				"INSERT INTO route_descriptors (id, rule_id, name, precedence_value, description, data_json) VALUES (?, ?, ?, ?, ?, ?)"
			)
			.bind(
				id,
				c.req.param("ruleId"),
				body.name,
				body.precedence_value,
				body.description || null,
				JSON.stringify(body.data)
			)
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to create route descriptor" }, 500);
		}

		const descriptor = await db
			.prepare("SELECT * FROM route_descriptors WHERE id = ?")
			.bind(id)
			.first<RouteDescriptor>();

		if (descriptor) {
			return c.json({ ...descriptor, data_json: JSON.parse(descriptor.data_json) }, 201);
		}
		return c.json({ error: "Failed to fetch created descriptor" }, 500);
	} catch (error) {
		console.error("Error creating route descriptor:", error);
		return c.json({ error: "Failed to create route descriptor" }, 500);
	}
});

// Update route descriptor
urspRouter.put("/route-descriptors/:id", async (c) => {
	try {
		const db = c.env.DB;
		const body = await c.req.json();

		const result = await db
			.prepare(
				"UPDATE route_descriptors SET name = ?, precedence_value = ?, description = ?, data_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
			)
			.bind(
				body.name,
				body.precedence_value,
				body.description || null,
				JSON.stringify(body.data),
				c.req.param("id")
			)
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to update route descriptor" }, 500);
		}

		const descriptor = await db
			.prepare("SELECT * FROM route_descriptors WHERE id = ?")
			.bind(c.req.param("id"))
			.first<RouteDescriptor>();

		if (descriptor) {
			return c.json({ ...descriptor, data_json: JSON.parse(descriptor.data_json) });
		}
		return c.json({ error: "Failed to fetch updated descriptor" }, 500);
	} catch (error) {
		console.error("Error updating route descriptor:", error);
		return c.json({ error: "Failed to update route descriptor" }, 500);
	}
});

// Delete route descriptor
urspRouter.delete("/route-descriptors/:id", async (c) => {
	try {
		const db = c.env.DB;

		const result = await db
			.prepare("DELETE FROM route_descriptors WHERE id = ?")
			.bind(c.req.param("id"))
			.run();

		if (!result.success) {
			return c.json({ error: "Failed to delete route descriptor" }, 500);
		}

		return c.json({ success: true });
	} catch (error) {
		console.error("Error deleting route descriptor:", error);
		return c.json({ error: "Failed to delete route descriptor" }, 500);
	}
});

export default urspRouter;

interface CloudflareEnv {
	DB: D1Database;
}
