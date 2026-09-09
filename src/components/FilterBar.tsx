"use client";

import { SlidersHorizontal } from "lucide-react";
import type { Filters } from "@/lib/types";

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <div className="glass sticky top-6 flex flex-col gap-6 rounded-2xl border border-line/70 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-espresso">
        <SlidersHorizontal size={16} className="text-brown" />
        <h2 className="text-sm font-semibold tracking-tight">Filters</h2>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-espresso">
          Max distance
          <span className="rounded-full bg-brown/10 px-2 py-0.5 text-xs font-semibold text-brown">
            {filters.maxDistanceKm} km
          </span>
        </label>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={filters.maxDistanceKm}
          onChange={(e) => onChange({ ...filters, maxDistanceKm: Number(e.target.value) })}
          className="mt-3 w-full accent-brown"
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onChange({ ...filters, wifiOnly: !filters.wifiOnly })}
          className={`flex items-center justify-between rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            filters.wifiOnly
              ? "border-transparent bg-gradient-to-r from-brown to-brown-light text-cream shadow-md shadow-brown/20"
              : "border-line text-espresso hover:border-brown-light"
          }`}
        >
          Wifi tagged
        </button>
        <button
          onClick={() => onChange({ ...filters, outdoorSeatingOnly: !filters.outdoorSeatingOnly })}
          className={`flex items-center justify-between rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            filters.outdoorSeatingOnly
              ? "border-transparent bg-gradient-to-r from-brown to-brown-light text-cream shadow-md shadow-brown/20"
              : "border-line text-espresso hover:border-brown-light"
          }`}
        >
          Outdoor seating
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-espresso">Sort by</p>
        <div className="mt-2 flex gap-2 rounded-full border border-line bg-cream/60 p-1">
          {(["distance", "name"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, sortBy: opt })}
              className={`flex-1 rounded-full px-3 py-1.5 text-sm capitalize transition-all ${
                filters.sortBy === opt
                  ? "bg-espresso text-cream shadow-sm"
                  : "text-muted hover:text-espresso"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted">
        Wifi and outdoor seating filters only catch cafes tagged on OpenStreetMap —
        unchecked doesn&apos;t always mean &quot;no,&quot; sometimes it&apos;s just not tagged yet.
      </p>
    </div>
  );
}