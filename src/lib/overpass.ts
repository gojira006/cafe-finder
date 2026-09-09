import type { Cafe, LatLng } from "./types";
import { distanceMeters } from "./distance";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

type OverpassElement = {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function buildAddress(tags: Record<string, string> = {}): string {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:city"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Address not listed";
}

/**
 * Queries OpenStreetMap's free Overpass API for cafes within radiusMeters
 * of center. No API key, no billing account, no cost.
 */
export async function fetchNearbyCafes(
  center: LatLng,
  radiusMeters: number
): Promise<Cafe[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="cafe"](around:${radiusMeters},${center.lat},${center.lng});
      way["amenity"="cafe"](around:${radiusMeters},${center.lat},${center.lng});
    );
    out center tags;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Overpass API error (${res.status}): ${body}`);
  }

  const data: { elements?: OverpassElement[] } = await res.json();
  const elements = data.elements ?? [];

  return elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (lat === undefined || lng === undefined) return null;
      const tags = el.tags ?? {};
      const loc = { lat, lng };

      const cafe: Cafe = {
        id: `${el.type}/${el.id}`,
        name: tags.name || "Unnamed cafe",
        address: buildAddress(tags),
        lat,
        lng,
        openingHours: tags.opening_hours,
        hasWifi: tags.internet_access ? tags.internet_access !== "no" : undefined,
        outdoorSeating: tags.outdoor_seating ? tags.outdoor_seating === "yes" : undefined,
        distanceMeters: distanceMeters(center, loc),
      };
      return cafe;
    })
    .filter((c): c is Cafe => c !== null);
}
