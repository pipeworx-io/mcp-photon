# @pipeworx/photon

Photon MCP — komoot-hosted OpenStreetMap geocoder. Strong on partial / typo-tolerant search (Elasticsearch-backed). No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(query, lat?, lon?, location_bias_scale?, zoom?, limit?, lang?, osm_tag?, layer?, bbox?)` — forward geocoding
- `reverse(lat, lon, radius?, lang?, limit?, layer?)` — reverse geocoding

## Data source

`https://photon.komoot.io/` — public, no auth. Fair-use limits. For high volume run your own Photon instance.

Photon vs Nominatim: Photon uses Elasticsearch and is much better at partial / autocomplete-style queries; Nominatim is better for structured-address parsing.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "photon": {
      "url": "https://gateway.pipeworx.io/photon/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Photon data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
