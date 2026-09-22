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
      className={`cafe-card rounded-2xl border p-4 ${
        active ? "border-brown bg-panel ring-4 ring-brown/10" : "border-white/80 bg-panel/75"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-semibold tracking-tight text-espresso">{cafe.name}</h3>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="shrink-0 rounded-full p-1.5 transition hover:bg-brown/10 focus:outline-none focus:ring-2 focus:ring-brown/40"
        >
          <Heart size={20} className={isFavorite ? "fill-brown text-brown" : "text-muted"} />
        </button>
      </div>

      <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
        <MapPin size={13} className="shrink-0" /> {cafe.address}
      </p>

      {cafe.openingHours && (
        <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted">
          <Clock size={13} className="shrink-0" /> {cafe.openingHours}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {cafe.distanceMeters !== undefined && (
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-brown">{formatDistance(cafe.distanceMeters)}</span>
        )}
        {cafe.hasWifi && (
          <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-1 text-xs font-medium text-sage">
            <Wifi size={13} /> Wifi
          </span>
        )}
        {cafe.outdoorSeating && (
          <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-1 text-xs font-medium text-sage">
            <Trees size={13} /> Outdoor
          </span>
        )}
      </div>
    </div>
  );
}
