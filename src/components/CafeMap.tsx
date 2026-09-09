"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { Cafe, LatLng } from "@/lib/types";

// Leaflet's default marker icons reference image files that don't resolve
// correctly under bundlers unless we point them at a CDN explicitly.
const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const cafeIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [22, 36],
  iconAnchor: [11, 36],
});

function RecenterOnChange({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

export default function CafeMap({
  center,
  cafes,
  activeId,
  onMarkerHover,
}: {
  center: LatLng;
  cafes: Cafe[];
  activeId: string | null;
  onMarkerHover: (id: string | null) => void;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterOnChange center={center} />

      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={[cafe.lat, cafe.lng]}
          icon={cafeIcon}
          eventHandlers={{
            mouseover: () => onMarkerHover(cafe.id),
            mouseout: () => onMarkerHover(null),
          }}
          opacity={activeId === cafe.id ? 1 : 0.85}
        >
          <Popup>
            <strong>{cafe.name}</strong>
            <br />
            {cafe.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
