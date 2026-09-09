# Cafe Finder (free / no API key)

Finds nearby cafes in real time using your browser location + OpenStreetMap's
free Overpass API. No API key, no billing account, no cost — ever.

## Setup

    npm install
    npm run dev

Open http://localhost:3000 and allow location access when prompted. That's it —
no .env file needed.

## How it works

- `src/hooks/useGeolocation.ts` — gets the browser's current location
- `src/lib/overpass.ts` — queries OpenStreetMap's Overpass API for cafes
  (`amenity=cafe`) around that location, free and keyless
- `src/hooks/useFavorites.ts` — saves liked cafes to localStorage
- `src/components/FilterBar.tsx` — distance / wifi-tagged / outdoor-seating-tagged
  filters, applied client-side
- `src/components/CafeMap.tsx` — renders OpenStreetMap tiles via Leaflet /
  react-leaflet, no key required

## Data note

OpenStreetMap is community-maintained. Coverage is excellent in many cities
but not guaranteed everywhere, and fields like wifi/outdoor seating only show
up if someone has tagged them — a cafe missing a tag doesn't mean it lacks
that feature, just that nobody's added it yet. That's worth mentioning if you
talk about this project in an interview; it shows you understand the
data source's limits, which is a real engineering skill.

## Deploy to Vercel

Push to GitHub, import into Vercel — no environment variables needed since
there's no API key. Deploys exactly like a normal Next.js app.

Be considerate with the free Overpass API: avoid hammering it with rapid
repeated requests (e.g. a "refresh on every keystroke" pattern) since it's a
shared community resource, not a paid service tied to your account.
