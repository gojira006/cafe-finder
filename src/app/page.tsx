"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Coffee, Heart, LocateFixed, RefreshCw, SlidersHorizontal, Sparkles } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchNearbyCafes } from "@/lib/overpass";
import type { Cafe, Filters } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import CafeCard from "@/components/CafeCard";

const CafeMap = dynamic(() => import("@/components/CafeMap"), { ssr: false, loading: () => <div className="flex h-full items-center justify-center bg-panel text-sm text-muted">Loading map...</div> });
const DEFAULT_FILTERS: Filters = { maxDistanceKm: 5, wifiOnly: false, outdoorSeatingOnly: false, sortBy: "distance" };

export default function Home() {
  const { position, error: geoError, loading: geoLoading } = useGeolocation();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const search = async (radiusKm?: number) => {
    if (!position) return;
    setLoading(true); setError(null);
    try { setCafes(await fetchNearbyCafes(position, (radiusKm ?? filters.maxDistanceKm) * 1000)); }
    catch (err) { setError(err instanceof Error ? err.message : "Something went wrong fetching cafes. The free Overpass API is sometimes slow or briefly rate-limited - try again in a moment."); }
    finally { setLoading(false); }
  };
  const handleFiltersChange = (nextFilters: Filters) => {
    const distanceChanged = nextFilters.maxDistanceKm !== filters.maxDistanceKm;
    setFilters(nextFilters);
    if (distanceChanged) void search(nextFilters.maxDistanceKm);
  };
  useEffect(() => { if (position) void search(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [position]);
  const visibleCafes = useMemo(() => cafes.filter((c) => {
    if (c.distanceMeters !== undefined && c.distanceMeters > filters.maxDistanceKm * 1000) return false;
    if (filters.wifiOnly && !c.hasWifi) return false;
    if (filters.outdoorSeatingOnly && !c.outdoorSeating) return false;
    return !showFavoritesOnly || favorites.includes(c.id);
  }).sort((a, b) => filters.sortBy === "name" ? a.name.localeCompare(b.name) : (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)), [cafes, filters, showFavoritesOnly, favorites]);

  return <div className="app-shell min-h-screen">
    <header className="site-header border-b border-white/60 bg-panel/65 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
      <div className="flex items-center gap-3"><span className="brand-mark grid size-10 place-items-center text-cream shadow-lg shadow-brown/20"><Coffee size={19} strokeWidth={2.25} /></span><div><h1 className="font-display text-xl font-bold leading-none tracking-tight text-espresso">Cafe Finder</h1><p className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.17em] text-muted sm:block">City coffee guide</p></div></div>
      <div className="flex items-center gap-2 sm:gap-3"><button onClick={() => setShowFavoritesOnly((v) => !v)} aria-pressed={showFavoritesOnly} className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${showFavoritesOnly ? "border-brown bg-brown text-cream shadow-lg shadow-brown/20" : "border-white/70 bg-white/60 text-espresso hover:-translate-y-0.5 hover:border-brown/40"}`}><Heart size={15} className={showFavoritesOnly ? "fill-cream" : ""} /><span className="hidden sm:inline">Saved</span>{favorites.length > 0 && <span className={`grid size-5 place-items-center rounded-full text-[10px] ${showFavoritesOnly ? "bg-cream/20" : "bg-gold/20 text-brown"}`}>{favorites.length}</span>}</button><button onClick={() => search()} disabled={loading || !position} className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-2 text-sm font-semibold text-espresso transition-all hover:-translate-y-0.5 hover:border-brown/40 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /><span className="hidden sm:inline">Refresh</span></button></div>
    </div></header>
    <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-9">
      <section className="glass-panel fade-up hero-panel relative mb-6 overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10"><div className="coffee-compass" aria-hidden="true"><span /><i /><b /></div><div className="relative max-w-2xl"><p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brown"><Sparkles size={14} /> Coffee, considered</p><h2 className="font-display max-w-xl text-4xl font-bold leading-[0.96] tracking-tight text-espresso sm:text-6xl">Your next favorite cup is closer than you think.</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">A live, map-led guide to the independent cafes around you - no accounts, no clutter.</p>{position && <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3.5 py-2 text-xs font-semibold text-brown shadow-sm"><LocateFixed size={14} /> Exploring a {filters.maxDistanceKm} km radius</p>}</div></section>
      {geoLoading && <p className="glass-panel rounded-2xl p-4 text-sm text-muted">Locating you and warming up the map...</p>}
      {geoError && <p className="mb-4 rounded-2xl border border-brown/20 bg-panel/80 p-4 text-sm text-brown shadow-sm">Couldn&apos;t get your location: {geoError}. Location access is required to find nearby cafes.</p>}
      {error && <p className="mb-4 rounded-2xl border border-brown/20 bg-panel/80 p-4 text-sm text-brown shadow-sm">{error}</p>}
      {position && <div className="grid gap-5 lg:grid-cols-[272px_minmax(310px,0.9fr)_minmax(360px,1.1fr)]"><FilterBar filters={filters} onChange={handleFiltersChange} /><div className="results-column flex flex-col gap-3"><div className="flex items-end justify-between px-1 pb-1"><div><p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brown"><SlidersHorizontal size={13} /> Around you</p><h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-espresso">{loading ? "Brewing your list" : `${visibleCafes.length} places to discover`}</h2></div>{!loading && <span className="hidden rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-[11px] font-semibold text-muted sm:block">Live map data</span>}</div>{loading && <div className="glass-panel rounded-2xl p-4 text-sm text-muted">Finding cafes near you...</div>}{!loading && visibleCafes.length === 0 && <div className="glass-panel rounded-2xl p-5 text-sm leading-relaxed text-muted"><p className="font-display text-xl font-bold text-espresso">Nothing brewing here yet.</p><p className="mt-2">Try widening your distance. OpenStreetMap coverage can vary from block to block.</p></div>}{visibleCafes.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} isFavorite={isFavorite(cafe.id)} onToggleFavorite={() => toggleFavorite(cafe.id)} onHover={setActiveId} active={activeId === cafe.id} />)}</div><div className="map-frame h-[52vh] overflow-hidden rounded-[1.75rem] border border-white/70 shadow-xl shadow-brown/10 lg:sticky lg:top-5 lg:h-[calc(100vh-7rem)]"><CafeMap center={position} cafes={visibleCafes} activeId={activeId} onMarkerHover={setActiveId} /></div></div>}
    </main>
  </div>;
}
