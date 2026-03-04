export type NominatimResult = {
  place_id: number
  display_name: string
  name: string
  geojson?: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][]
  }
}

const BASE = 'https://nominatim.openstreetmap.org/search'
const HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'RushHourPlatform/1.0',
}

async function fetchNominatim(params: Record<string, string>): Promise<NominatimResult[]> {
  const url = `${BASE}?${new URLSearchParams({ format: 'json', limit: '6', addressdetails: '0', ...params })}`
  const resp = await fetch(url, { headers: HEADERS })
  if (!resp.ok) return []
  return resp.json()
}

export async function searchCities(query: string): Promise<NominatimResult[]> {
  const data = await fetchNominatim({ q: query, featuretype: 'city' })
  return data.slice(0, 5)
}

export async function searchAreas(query: string, city: string): Promise<NominatimResult[]> {
  const data = await fetchNominatim({ q: city ? `${query}, ${city}` : query, polygon_geojson: '1' })
  return data.filter(r => r.geojson?.type === 'Polygon' || r.geojson?.type === 'MultiPolygon').slice(0, 5)
}

export function extractPolygonPoints(result: NominatimResult): [number, number][] {
  if (!result.geojson) return []
  let ring: number[][]
  if (result.geojson.type === 'Polygon') {
    ring = result.geojson.coordinates[0]
  } else {
    // MultiPolygon: take the largest outer ring
    ring = result.geojson.coordinates.reduce((a, b) => (a[0].length > b[0].length ? a : b))[0]
  }
  return ring.map(([lng, lat]) => [lat, lng] as [number, number])
}
