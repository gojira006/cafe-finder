"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Coffee, Heart, MapPin, RefreshCw, Sparkles } from "lucide-react";
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
  maxDistanceKm: 5,
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

  const handleFiltersChange = (nextFilters: Filters) => {
    const distanceChanged = nextFilters.maxDistanceKm !== filters.maxDistanceKm;
    setFilters(nextFilters);
    if (distanceChanged) void search(nextFilters.maxDistanceKm);
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
    <div className="app-shell min-h-screen">
      <header className="border-b border-white/60 bg-panel/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-gold to-brown text-cream shadow-lg shadow-brown/20"><Coffee size={20} /></span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-espresso">Cafe Finder</h1>
              <p className="hidden text-xs text-muted sm:block">Your next great cup is nearby</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavoritesOnly((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all ${
                showFavoritesOnly
                  ? "border-brown bg-brown text-cream shadow-lg shadow-brown/20"
                  : "border-white/70 bg-white/60 text-espresso hover:-translate-y-0.5 hover:border-brown/40"
              }`}
            >
              <Heart size={15} className={showFavoritesOnly ? "fill-cream" : ""} />
              Favorites
            </button>
            <button
              onClick={() => search()}
              disabled={loading || !position}
              className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-2 text-sm font-medium text-espresso transition-all hover:-translate-y-0.5 hover:border-brown/40 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <section className="glass-panel fade-up relative mb-7 overflow-hidden rounded-3xl px-6 py-8 sm:px-9 sm:py-10">
          <div className="hero-orb" aria-hidden="true" />
          <div className="relative max-w-xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brown"><Sparkles size={15} /> Sip, explore, repeat</p>
            <h2 className="text-3xl font-bold tracking-tight text-espresso sm:text-4xl">Find a great coffee spot, right where you are.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">Live cafe results from OpenStreetMap, sorted around your location.</p>
            {position && <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1.5 text-xs font-medium text-brown"><MapPin size={14} /> Searching within {filters.maxDistanceKm} km</p>}
          </div>
        </section>
        {geoLoading && <p className="glass-panel rounded-2xl p-4 text-sm text-muted">Getting your location…</p>}
        {geoError && (
          <p className="mb-4 rounded-2xl border border-brown/20 bg-panel/80 p-4 text-sm text-brown shadow-sm">
            Couldn&apos;t get your location: {geoError}. Location access is required to find nearby cafes.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-2xl border border-brown/20 bg-panel/80 p-4 text-sm text-brown shadow-sm">{error}</p>
        )}

        {position && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr_1fr]">
            <FilterBar filters={filters} onChange={handleFiltersChange} />

            <div className="flex flex-col gap-3">
              <div className="flex items-end justify-between px-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brown">Nearby picks</p>
                  <h2 className="text-xl font-semibold tracking-tight text-espresso">{loading ? "Brewing your results" : `${visibleCafes.length} places to discover`}</h2>
                </div>
                {!loading && <span className="hidden rounded-full bg-white/65 px-3 py-1.5 text-xs font-medium text-muted sm:block">Live results</span>}
              </div>
              {loading && <p className="glass-panel rounded-2xl p-4 text-sm text-muted">Finding cafes near you…</p>}
              {!loading && visibleCafes.length === 0 && (
                <p className="glass-panel rounded-2xl p-5 text-sm leading-relaxed text-muted">
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

            <div className="map-frame h-[60vh] overflow-hidden rounded-3xl border border-white/70 shadow-xl shadow-brown/10 lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
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
