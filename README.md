# Cosign Discovery MCP

A minimal, read-only MCP adapter for authorized [Cosign](https://cosign.co) discovery data.

> Cosign does not currently publish an API or MCP. This project does **not** scrape the site or bypass its waitlist. Point it at an endpoint you are authorized to use.

## Tool

`discover_cosign` searches people, companies, products, and jobs, optionally filtered by cosigner.

Example request:

```json
{
  "query": "AI startups",
  "type": "companies",
  "cosignedBy": "elonmusk",
  "limit": 10
}
```

The configured endpoint receives a read-only request like:

```text
GET /discover?q=AI+startups&type=companies&limit=10&cosigned_by=elonmusk
Authorization: Bearer ...
```

Its JSON response is returned unchanged.

## Run

Requires Node.js 20+.

```sh
npm install
COSIGN_DISCOVERY_URL=https://your-authorized-endpoint.example/discover \
COSIGN_API_TOKEN=optional-token \
npm start
```

MCP client configuration:

```json
{
  "mcpServers": {
    "cosign": {
      "command": "node",
      "args": ["/absolute/path/to/cosign-discovery-mcp/index.js"],
      "env": {
        "COSIGN_DISCOVERY_URL": "https://your-authorized-endpoint.example/discover",
        "COSIGN_API_TOKEN": "optional-token"
      }
    }
  }
}
```

## Check

```sh
npm test
```

## License

MIT
