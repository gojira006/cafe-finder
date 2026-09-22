import { NextResponse } from "next/server";

const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const MAX_RADIUS_METERS = 50_000;
const REQUEST_TIMEOUT_MS = 10_000;

type SearchRequest = {
  lat?: unknown;
  lng?: unknown;
  radiusMeters?: unknown;
};

function isLatitude(value: number) {
  return value >= -90 && value <= 90;
}

function isLongitude(value: number) {
  return value >= -180 && value <= 180;
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

async function queryOverpass(endpoint: string, query: string) {
  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
    },
    body: new URLSearchParams({ data: query }).toString(),
  });

  if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
  return response.json();
}

type NominatimPlace = {
  osm_type: "node" | "way" | "relation";
  osm_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
};

async function queryNominatim(lat: number, lng: number, radius: number) {
  const latitudeDelta = radius / 111_320;
  const longitudeDelta = radius / (111_320 * Math.max(Math.cos((lat * Math.PI) / 180), 0.1));
  const viewbox = [
    lng - longitudeDelta,
    lat + latitudeDelta,
    lng + longitudeDelta,
    lat - latitudeDelta,
  ].join(",");
  const params = new URLSearchParams({
    format: "jsonv2",
    q: "[cafe]",
    viewbox,
    bounded: "1",
    limit: "50",
  });
  const response = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { Accept: "application/json", "User-Agent": "Cafe-Finder/1.0" } }
  );

  if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
  const places = (await response.json()) as NominatimPlace[];
  return {
    elements: places.map((place) => ({
      type: place.osm_type,
      id: place.osm_id,
      lat: Number(place.lat),
      lon: Number(place.lon),
      tags: {
        name: place.name || place.display_name.split(",")[0] || "Unnamed cafe",
        "addr:street": place.display_name,
      },
    })),
  };
}

export async function POST(request: Request) {
  let body: SearchRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid search request." }, { status: 400 });
  }

  const { lat, lng, radiusMeters } = body;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    typeof radiusMeters !== "number" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(radiusMeters) ||
    !isLatitude(lat) ||
    !isLongitude(lng) ||
    radiusMeters < 100
  ) {
    return NextResponse.json({ error: "Invalid search location or distance." }, { status: 400 });
  }

  const radius = Math.min(Math.round(radiusMeters), MAX_RADIUS_METERS);
  const query = `[out:json][timeout:18];(node["amenity"="cafe"](around:${radius},${lat},${lng});way["amenity"="cafe"](around:${radius},${lat},${lng});relation["amenity"="cafe"](around:${radius},${lat},${lng}););out center tags;`;

  try {
    const data = await Promise.any(
      OVERPASS_ENDPOINTS.map((endpoint) => queryOverpass(endpoint, query))
    );
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Public Overpass instances can be temporarily overloaded. Nominatim uses
    // the same OpenStreetMap data and gives the finder a usable fallback.
  }

  try {
    const data = await queryNominatim(lat, lng, radius);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Return a concise, actionable error only after every provider has failed.
  }

  return NextResponse.json(
    { error: "Cafe search is temporarily unavailable. Please try again shortly." },
    { status: 503 }
  );
}
