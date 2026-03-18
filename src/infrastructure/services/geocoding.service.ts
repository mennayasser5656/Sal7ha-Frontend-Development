import type { LatLng, SearchResult } from "@/domain/entities/Location";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export async function searchLocations(
  query: string,
  center: LatLng
): Promise<SearchResult[]> {
  const vbox = `${center.lng - 1},${center.lat - 1},${center.lng + 1},${center.lat + 1}`;
  const params = new URLSearchParams({
    format: "json",
    q: query,
    limit: "6",
    addressdetails: "1",
    viewbox: vbox,
    bounded: "0",
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { "Accept-Language": "en,ar" },
  });
  return res.json();
}

export function formatSuggestion(result: SearchResult) {
  const parts = result.display_name.split(", ");
  const main = parts[0];
  const secondary = parts.slice(1, 3).join(", ");
  return { main, secondary };
}
