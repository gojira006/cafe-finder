"use client";

import type { Filters } from "@/lib/types";

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <aside className="glass-panel h-fit rounded-[1.75rem] p-5 lg:sticky lg:top-5">
      <div className="mb-6 border-b border-line/60 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown">Tailor the search</p>
        <h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-espresso">Your coffee crawl</h2>
      </div>
      <div className="flex flex-col gap-5">
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-espresso">
          Max distance
          <span className="rounded-full bg-brown px-2.5 py-1 text-xs font-bold text-cream">{filters.maxDistanceKm} km</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={50}
          step={0.5}
          value={filters.maxDistanceKm}
          onChange={(e) => onChange({ ...filters, maxDistanceKm: Number(e.target.value) })}
          className="range-input mt-3 w-full accent-brown"
        />
        <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted"><span>Nearby</span><span>Explore farther</span></div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line/70 bg-white/50 px-3 py-2.5 text-sm font-medium text-espresso transition hover:border-brown/50">
        <input
          type="checkbox"
          checked={filters.wifiOnly}
          onChange={(e) => onChange({ ...filters, wifiOnly: e.target.checked })}
          className="accent-brown"
        />
        Has wifi (tagged only)
      </label>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line/70 bg-white/50 px-3 py-2.5 text-sm font-medium text-espresso transition hover:border-brown/50">
        <input
          type="checkbox"
          checked={filters.outdoorSeatingOnly}
          onChange={(e) => onChange({ ...filters, outdoorSeatingOnly: e.target.checked })}
          className="accent-brown"
        />
        Outdoor seating (tagged only)
      </label>

      <div>
        <p className="text-sm font-medium text-espresso">Sort by</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["distance", "name"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, sortBy: opt })}
              className={`rounded-xl border px-3 py-2 text-sm capitalize transition-all ${
                filters.sortBy === opt
                  ? "border-brown bg-brown text-cream"
                  : "border-line text-muted hover:border-brown"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-2xl border border-gold/15 bg-gold/10 p-3 text-xs leading-relaxed text-muted">
        Wifi and outdoor seating filters only catch cafes where someone has
        tagged that info on OpenStreetMap — unchecked doesn&apos;t always mean
        &quot;no,&quot; sometimes it just means &quot;not tagged yet.&quot;
      </p>
      </div>
    </aside>
  );
}
