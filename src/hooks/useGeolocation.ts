"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/types";

type GeoState = {
  position: LatLng | null;
  error: string | null;
  loading: boolean;
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    position: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({ position: null, error: "Geolocation isn't supported by this browser.", loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState({ position: null, error: err.message, loading: false });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return state;
}
