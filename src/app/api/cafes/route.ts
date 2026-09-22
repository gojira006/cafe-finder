import { NextResponse } from "next/server";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
];

const MAX_RADIUS_METERS = 50_000;
const REQUEST_TIMEOUT_MS = 20_000;

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

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          Accept: "application/json",
        },
        body: query,
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) continue;
      const data: unknown = await response.json();
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      // Try the next public Overpass instance.
    } finally {
      clearTimeout(timeout);
    }
  }

  return NextResponse.json(
    { error: "Cafe search is temporarily unavailable. Please try again shortly." },
    { status: 503 }
  );
}
