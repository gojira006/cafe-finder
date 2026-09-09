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
    <div className="flex flex-col gap-5 border border-line bg-panel p-5">
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-espresso">
          Max distance
          <span className="text-brown">{filters.maxDistanceKm} km</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={filters.maxDistanceKm}
          onChange={(e) => onChange({ ...filters, maxDistanceKm: Number(e.target.value) })}
          className="mt-2 w-full accent-brown"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-espresso">
        <input
          type="checkbox"
          checked={filters.wifiOnly}
          onChange={(e) => onChange({ ...filters, wifiOnly: e.target.checked })}
          className="accent-brown"
        />
        Has wifi (tagged only)
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-espresso">
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
        <div className="mt-2 flex gap-2">
          {(["distance", "name"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, sortBy: opt })}
              className={`border px-3 py-1.5 text-sm capitalize transition-colors ${
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

      <p className="text-xs text-muted">
        Wifi and outdoor seating filters only catch cafes where someone has
        tagged that info on OpenStreetMap — unchecked doesn&apos;t always mean
        &quot;no,&quot; sometimes it just means &quot;not tagged yet.&quot;
      </p>
    </div>
  );
}
