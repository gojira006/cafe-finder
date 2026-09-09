"use client";

import { Heart, MapPin, Clock, Wifi, Trees } from "lucide-react";
import type { Cafe } from "@/lib/types";
import { formatDistance } from "@/lib/distance";

export default function CafeCard({
  cafe,
  isFavorite,
  onToggleFavorite,
  onHover,
  active,
}: {
  cafe: Cafe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onHover?: (id: string | null) => void;
  active?: boolean;
}) {
  return (
    <div
      onMouseEnter={() => onHover?.(cafe.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`card-lift rounded-2xl border bg-panel p-5 ${
        active ? "border-brown-light shadow-md shadow-brown/10" : "border-line/70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-semibold tracking-tight text-espresso">{cafe.name}</h3>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-cream"
        >
          <Heart
            size={19}
            className={`transition-all ${isFavorite ? "fill-brown text-brown scale-110" : "text-muted"}`}
          />
        </button>
      </div>

      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
        <MapPin size={13} className="shrink-0 text-brown-light" /> {cafe.address}
      </p>

      {cafe.openingHours && (
        <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
          <Clock size={13} className="shrink-0 text-brown-light" /> {cafe.openingHours}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {cafe.distanceMeters !== undefined && (
          <span className="rounded-full bg-brown/10 px-2.5 py-1 font-semibold text-brown">
            {formatDistance(cafe.distanceMeters)}
          </span>
        )}
        {cafe.hasWifi && (
          <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-1 font-medium text-sage">
            <Wifi size={12} /> Wifi
          </span>
        )}
        {cafe.outdoorSeating && (
          <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-1 font-medium text-sage">
            <Trees size={12} /> Outdoor
          </span>
        )}
      </div>
    </div>
  );
}