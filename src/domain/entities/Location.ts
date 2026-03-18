export type LatLng = { lat: number; lng: number };

export type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: Record<string, string>;
};

export type POI = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  category: string;
};
