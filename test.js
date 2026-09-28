import assert from "node:assert/strict";
import { once } from "node:events";
import http from "node:http";
import test from "node:test";
import { discover } from "./index.js";

test("discovery is a read-only GET with filters and auth", async () => {
  const server = http.createServer((request, response) => {
    assert.equal(request.method, "GET");
    assert.equal(request.headers.authorization, "Bearer secret");
    const url = new URL(request.url, "http://localhost");
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      q: "AI startups",
      type: "companies",
      limit: "5",
      cosigned_by: "elonmusk",
    });
    response.setHeader("content-type", "application/json");
    response.end('{"results":[]}');
  }).listen(0);
  await once(server, "listening");

  try {
    const result = await discover(
      { query: "AI startups", type: "companies", cosignedBy: "elonmusk", limit: 5 },
      { COSIGN_DISCOVERY_URL: `http://127.0.0.1:${server.address().port}/discover`, COSIGN_API_TOKEN: "secret" },
    );
    assert.deepEqual(result, { results: [] });
  } finally {
    server.close();
  }
});
