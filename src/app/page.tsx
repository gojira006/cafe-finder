"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Coffee, Heart, RefreshCw } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchNearbyCafes } from "@/lib/overpass";
import type { Cafe, Filters } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import CafeCard from "@/components/CafeCard";

// Leaflet touches `window`, so it can't be server-rendered.
const CafeMap = dynamic(() => import("@/components/CafeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-panel text-sm text-muted">
      Loading map…
    </div>
  ),
});

const DEFAULT_FILTERS: Filters = {
  maxDistanceKm: 2,
  wifiOnly: false,
  outdoorSeatingOnly: false,
  sortBy: "distance",
};

export default function Home() {
  const { position, error: geoError, loading: geoLoading } = useGeolocation();
  const { toggleFavorite, isFavorite, loaded: favoritesLoaded } = useFavorites();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIdsSnapshot] = useState<string[]>([]);

  useEffect(() => {
    if (!favoritesLoaded) return;
    try {
      const raw = localStorage.getItem("cafe-finder:favorites");
      setFavoriteIdsSnapshot(raw ? JSON.parse(raw) : []);
    } catch {
      setFavoriteIdsSnapshot([]);
    }
  }, [favoritesLoaded, cafes]);

  const search = async (radiusKm?: number) => {
    if (!position) return;
    setLoading(true);
    setError(null);
    try {
      const results = await fetchNearbyCafes(
        position,
        (radiusKm ?? filters.maxDistanceKm) * 1000
      );
      setCafes(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong fetching cafes. The free Overpass API is sometimes slow or briefly rate-limited — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (position) search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const visibleCafes = useMemo(() => {
    let list = cafes.filter((c) => {
      if (
        c.distanceMeters !== undefined &&
        c.distanceMeters > filters.maxDistanceKm * 1000
      )
        return false;
      if (filters.wifiOnly && !c.hasWifi) return false;
      if (filters.outdoorSeatingOnly && !c.outdoorSeating) return false;
      return true;
    });

    if (showFavoritesOnly) {
      list = list.filter((c) => favoriteIds.includes(c.id));
    }

    list.sort((a, b) => {
      if (filters.sortBy === "name") return a.name.localeCompare(b.name);
      return (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0);
    });

    return list;
  }, [cafes, filters, showFavoritesOnly, favoriteIds]);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Coffee className="text-brown" size={22} />
            <h1 className="text-lg font-semibold text-espresso">Cafe Finder</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavoritesOnly((v) => !v)}
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-sm transition-colors ${
                showFavoritesOnly
                  ? "border-brown bg-brown text-cream"
                  : "border-line text-espresso hover:border-brown"
              }`}
            >
              <Heart size={15} className={showFavoritesOnly ? "fill-cream" : ""} />
              Favorites
            </button>
            <button
              onClick={() => search()}
              disabled={loading || !position}
              className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-sm text-espresso transition-colors hover:border-brown disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {geoLoading && <p className="text-sm text-muted">Getting your location…</p>}
        {geoError && (
          <p className="border border-line bg-panel p-4 text-sm text-brown">
            Couldn&apos;t get your location: {geoError}. Location access is required to find nearby cafes.
          </p>
        )}
        {error && (
          <p className="mb-4 border border-line bg-panel p-4 text-sm text-brown">{error}</p>
        )}

        {position && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr_1fr]">
            <FilterBar filters={filters} onChange={setFilters} />

            <div className="flex flex-col gap-3">
              {loading && <p className="text-sm text-muted">Finding cafes near you…</p>}
              {!loading && visibleCafes.length === 0 && (
                <p className="text-sm text-muted">
                  No cafes match your filters yet — try widening the distance, OpenStreetMap
                  coverage varies by area.
                </p>
              )}
              {visibleCafes.map((cafe) => (
                <CafeCard
                  key={cafe.id}
                  cafe={cafe}
                  isFavorite={isFavorite(cafe.id)}
                  onToggleFavorite={() => toggleFavorite(cafe.id)}
                  onHover={setActiveId}
                  active={activeId === cafe.id}
                />
              ))}
            </div>

            <div className="h-[70vh] overflow-hidden border border-line lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
              <CafeMap
                center={position}
                cafes={visibleCafes}
                activeId={activeId}
                onMarkerHover={setActiveId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
