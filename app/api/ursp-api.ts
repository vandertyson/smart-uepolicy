// API client for URSP backend

const BASE_URL = "/api/ursp";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface UePolicy {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  mcc?: string;
  mnc?: string;
  created_at: string;
  updated_at: string;
  parts_count?: number;
  rules_count?: number;
}

export interface PolicyPart {
  id: string;
  policy_id: string;
  part_type: number;
  part_name?: string;
  created_at: string;
  updated_at: string;
  rules_count?: number;
}

export interface PolicyFull extends UePolicy {
  parts: Array<{
    id: string;
    part_type: number;
    part_name?: string;
    rules: Array<{
      id: string;
      precedence_value: number;
      description?: string;
      trafficDescriptors: Array<{
        id: string;
        descriptor_type: number;
        value: any;
      }>;
      routes: Array<{
        id: string;
        precedence_value: number;
        components: Array<{
          id: string;
          component_type: number;
          value: any;
        }>;
      }>;
    }>;
  }>;
}

// Policy API
export const policyApi = {
  // List all policies
  async list(params?: { projectId?: string; search?: string }): Promise<ApiResponse<UePolicy[]>> {
    const query = new URLSearchParams();
    if (params?.projectId) query.set("projectId", params.projectId);
    if (params?.search) query.set("search", params.search);
    
    const url = `${BASE_URL}/policies${query.toString() ? `?${query}` : ""}`;
    const response = await fetch(url);
    return response.json();
  },

  // Get policy with parts summary
  async get(id: string): Promise<ApiResponse<UePolicy & { parts: PolicyPart[] }>> {
    const response = await fetch(`${BASE_URL}/policies/${id}`);
    return response.json();
  },

  // Get policy with full nested structure
  async getFull(id: string): Promise<ApiResponse<PolicyFull>> {
    const response = await fetch(`${BASE_URL}/policies/${id}/full`);
    return response.json();
  },

  // Create new policy
  async create(data: {
    name: string;
    description?: string;
    mcc?: string;
    mnc?: string;
    project_id?: string;
  }): Promise<ApiResponse<UePolicy>> {
    const response = await fetch(`${BASE_URL}/policies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Update policy
  async update(
    id: string,
    data: {
      name: string;
      description?: string;
      mcc?: string;
      mnc?: string;
    }
  ): Promise<ApiResponse<UePolicy>> {
    const response = await fetch(`${BASE_URL}/policies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Delete policy
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${BASE_URL}/policies/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },
};

// Search API
export const searchApi = {
  async search(params: {
    q: string;
    type?: "all" | "policy" | "rule";
  }): Promise<ApiResponse<{
    policies: UePolicy[];
    rules: any[];
  }>> {
    const query = new URLSearchParams();
    query.set("q", params.q);
    if (params.type) query.set("type", params.type);
    
    const response = await fetch(`${BASE_URL}/search?${query}`);
    return response.json();
  },
};

// Helper to convert full policy to initialPolicyData format
export function convertToLegacyFormat(fullPolicy: PolicyFull): any {
  if (!fullPolicy.parts || fullPolicy.parts.length === 0) {
    return {};
  }

  const urspPart = fullPolicy.parts.find((p) => p.part_type === 1);
  if (!urspPart || !urspPart.rules) {
    return {};
  }

  // Convert to the format expected by welcome.tsx
  return {
    uePolicySectionContents: [
      {
        uePolicy: {
          uePolicySection: [
            {
              ursp: urspPart.rules.map((rule) => ({
                trafficDescriptors: rule.trafficDescriptors.map((td) => ({
                  type: td.descriptor_type,
                  ...td.value,
                })),
                routeSelectionDescriptor: rule.routes.map((route) => {
                  const result: any = {
                    precedence: route.precedence_value,
                  };

                  // Map components to expected format
                  route.components.forEach((comp) => {
                    if (comp.component_type === 2) {
                      // S-NSSAI
                      result.sNssais = [comp.value];
                    } else if (comp.component_type === 4) {
                      // DNN
                      result.dnns = [comp.value.dnn];
                    }
                  });

                  return result;
                }),
                precedence: rule.precedence_value,
              })),
            },
          ],
        },
      },
    ],
  };
}

// Helper to convert legacy format to API format (for saving)
export function convertFromLegacyFormat(
  legacyData: any,
  policyId: string,
  partId: string
): {
  rules: any[];
  trafficDescriptors: Map<string, any[]>;
  routes: Map<string, any[]>;
} {
  const rules: any[] = [];
  const trafficDescriptors = new Map<string, any[]>();
  const routes = new Map<string, any[]>();

  if (!legacyData?.uePolicySectionContents?.[0]?.uePolicy?.uePolicySection?.[0]?.ursp) {
    return { rules, trafficDescriptors, routes };
  }

  const urspRules = legacyData.uePolicySectionContents[0].uePolicy.uePolicySection[0].ursp;

  urspRules.forEach((rule: any, index: number) => {
    const ruleId = `rule-${Date.now()}-${index}`;
    
    rules.push({
      id: ruleId,
      part_id: partId,
      precedence_value: rule.precedence ?? index,
      description: `Rule ${index}`,
    });

    // Traffic descriptors
    if (rule.trafficDescriptors) {
      trafficDescriptors.set(
        ruleId,
        rule.trafficDescriptors.map((td: any) => ({
          descriptor_type: td.type,
          descriptor_value: JSON.stringify({
            connectionCapabilities: td.connectionCapabilities,
            osId: td.osId,
            osAppId: td.osAppId,
          }),
        }))
      );
    }

    // Route descriptors
    if (rule.routeSelectionDescriptor) {
      const routeData: any[] = [];
      
      rule.routeSelectionDescriptor.forEach((route: any, routeIndex: number) => {
        const routeId = `route-${Date.now()}-${index}-${routeIndex}`;
        const components: any[] = [];

        if (route.sNssais) {
          route.sNssais.forEach((snssai: any) => {
            components.push({
              component_type: 2,
              component_value: JSON.stringify(snssai),
            });
          });
        }

        if (route.dnns) {
          route.dnns.forEach((dnn: string) => {
            components.push({
              component_type: 4,
              component_value: JSON.stringify({ dnn }),
            });
          });
        }

        routeData.push({
          id: routeId,
          precedence_value: route.precedence ?? routeIndex,
          components,
        });
      });

      routes.set(ruleId, routeData);
    }
  });

  return { rules, trafficDescriptors, routes };
}
