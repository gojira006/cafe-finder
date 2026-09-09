"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { Cafe, LatLng } from "@/lib/types";

function divIcon(html: string, size: [number, number], anchor: [number, number]) {
  return L.divIcon({
    html,
    className: "",
    iconSize: size,
    iconAnchor: anchor,
  });
}

const userIcon = divIcon(
  `<div style="position:relative;width:20px;height:20px;">
     <div class="pin-pulse" style="position:absolute;inset:0;"></div>
     <div style="position:relative;width:20px;height:20px;border-radius:9999px;background:#2b1b12;border:3px solid #faf5ec;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
   </div>`,
  [20, 20],
  [10, 10]
);

function cafeMarkerIcon(active: boolean) {
  const color = active ? "#c99a3e" : "#6f4518";
  const scale = active ? 1.15 : 1;
  return divIcon(
    `<div style="transform:scale(${scale});transform-origin:bottom center;transition:transform 0.15s ease;">
       <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.7-6.3-14-14-14z" fill="${color}"/>
         <circle cx="14" cy="14" r="5.5" fill="#faf5ec"/>
       </svg>
     </div>`,
    [28, 36],
    [14, 36]
  );
}

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
          icon={cafeMarkerIcon(activeId === cafe.id)}
          eventHandlers={{
            mouseover: () => onMarkerHover(cafe.id),
            mouseout: () => onMarkerHover(null),
          }}
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