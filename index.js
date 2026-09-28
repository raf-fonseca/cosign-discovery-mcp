#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

export async function discover({ query, type = "all", cosignedBy, limit = 10 }, env = process.env) {
  if (!env.COSIGN_DISCOVERY_URL) throw new Error("Set COSIGN_DISCOVERY_URL to an authorized Cosign discovery endpoint");

  const url = new URL(env.COSIGN_DISCOVERY_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", type);
  url.searchParams.set("limit", String(limit));
  if (cosignedBy) url.searchParams.set("cosigned_by", cosignedBy);

  const response = await fetch(url, {
    headers: env.COSIGN_API_TOKEN ? { Authorization: `Bearer ${env.COSIGN_API_TOKEN}` } : {},
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Cosign API returned ${response.status}`);
  return response.json();
}

const server = new McpServer({ name: "cosign-discovery", version: "0.1.0" });
server.registerTool(
  "discover_cosign",
  {
    description: "Search an authorized Cosign data source for people, companies, products, or jobs. Read-only.",
    inputSchema: {
      query: z.string().min(1).describe("What to find, such as 'AI infrastructure startups'"),
      type: z.enum(["all", "people", "companies", "products", "jobs"]).default("all"),
      cosignedBy: z.string().optional().describe("Optional cosigner name or handle, such as 'elonmusk'"),
      limit: z.number().int().min(1).max(50).default(10),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
  },
  async (input) => {
    try {
      const result = await discover(input);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
  },
);

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await server.connect(new StdioServerTransport());
}
