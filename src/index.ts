interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Photon MCP — OSM geocoder
 *
 * Auth: none on the public komoot host.
 * Docs: https://photon.komoot.io/
 */


const BASE = 'https://photon.komoot.io';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Forward geocode — place name → coordinates. Strong on partial / autocomplete-style queries.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text place name / address' },
        lat: { type: 'number', description: 'Latitude bias center' },
        lon: { type: 'number', description: 'Longitude bias center' },
        location_bias_scale: { type: 'number', description: 'Strength of lat/lon bias (default 0.2)' },
        zoom: { type: 'number', description: 'Zoom level for bias (0-18)' },
        limit: { type: 'number', description: '1-50 (default 5)' },
        lang: { type: 'string', description: 'Language for the response (en, de, fr, ...)' },
        osm_tag: { type: 'string', description: 'OSM tag filter (e.g. "amenity:pharmacy")' },
        layer: { type: 'string', description: 'house | street | locality | city | district | county | state | country' },
        bbox: { type: 'string', description: 'Bounding box: "min_lon,min_lat,max_lon,max_lat"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'reverse',
    description: 'Reverse geocode — coordinates → nearest place name.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lon: { type: 'number' },
        radius: { type: 'number', description: 'Search radius in km (default 1)' },
        lang: { type: 'string' },
        limit: { type: 'number' },
        layer: { type: 'string' },
      },
      required: ['lat', 'lon'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"Eiffel Tower"'),
        limit: String(Math.min(50, Math.max(1, (args.limit as number) ?? 5))),
      });
      if (args.lat !== undefined) params.set('lat', String(args.lat));
      if (args.lon !== undefined) params.set('lon', String(args.lon));
      if (args.location_bias_scale !== undefined) params.set('location_bias_scale', String(args.location_bias_scale));
      if (args.zoom !== undefined) params.set('zoom', String(args.zoom));
      if (args.lang) params.set('lang', String(args.lang));
      if (args.osm_tag) params.set('osm_tag', String(args.osm_tag));
      if (args.layer) params.set('layer', String(args.layer));
      if (args.bbox) params.set('bbox', String(args.bbox));
      return photonGet(`/api/?${params}`);
    }
    case 'reverse': {
      const params = new URLSearchParams({
        lat: String(reqNum(args, 'lat', '48.8584')),
        lon: String(reqNum(args, 'lon', '2.2945')),
        limit: String(Math.min(50, Math.max(1, (args.limit as number) ?? 5))),
      });
      if (args.radius !== undefined) params.set('radius', String(args.radius));
      if (args.lang) params.set('lang', String(args.lang));
      if (args.layer) params.set('layer', String(args.layer));
      return photonGet(`/reverse/?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function photonGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-photon/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 429) throw new Error('Photon: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Photon error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}
function reqNum(args: Record<string, unknown>, key: string, example: string): number {
  const v = args[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(`Required argument "${key}" must be a number. Example: ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
