import type { Cafe, LatLng } from "./types";
import { distanceMeters } from "./distance";

type OverpassElement = {
  type: "node" | "way" | "relation";
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
 * Queries the app's server-side Overpass proxy for cafes within radiusMeters.
 * Keeping the external request on the server avoids browser CORS failures and
 * lets the proxy retry a healthy public Overpass instance.
 */
export async function fetchNearbyCafes(
  center: LatLng,
  radiusMeters: number
): Promise<Cafe[]> {
  const res = await fetch("/api/cafes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lat: center.lat,
      lng: center.lng,
      radiusMeters,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let message = "Unable to fetch cafes right now.";
    try {
      const data: { error?: string } = JSON.parse(body);
      if (data.error) message = data.error;
    } catch {
      // Use the safe fallback message if the response is not JSON.
    }
    throw new Error(message);
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
