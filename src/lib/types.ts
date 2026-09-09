export type Cafe = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openingHours?: string; // raw OSM opening_hours tag, shown as-is
  hasWifi?: boolean;
  outdoorSeating?: boolean;
  distanceMeters?: number;
};

export type LatLng = {
  lat: number;
  lng: number;
};

export type Filters = {
  maxDistanceKm: number;
  wifiOnly: boolean;
  outdoorSeatingOnly: boolean;
  sortBy: "distance" | "name";
};
