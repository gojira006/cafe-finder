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
      className={`border p-4 transition-colors ${
        active ? "border-brown bg-panel" : "border-line bg-panel"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-medium text-espresso">{cafe.name}</h3>
        <button
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="shrink-0"
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

      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        {cafe.distanceMeters !== undefined && (
          <span className="text-brown">{formatDistance(cafe.distanceMeters)}</span>
        )}
        {cafe.hasWifi && (
          <span className="flex items-center gap-1 text-sage">
            <Wifi size={13} /> Wifi
          </span>
        )}
        {cafe.outdoorSeating && (
          <span className="flex items-center gap-1 text-sage">
            <Trees size={13} /> Outdoor
          </span>
        )}
      </div>
    </div>
  );
}
