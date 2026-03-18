"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { LatLng, POI } from "@/domain/entities/Location";
export type { POI };

// SVG paths for each POI category (white icons on gray circle)
const POI_SVG: Record<string, string> = {
  shopping: `<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  food: `<path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  education: `<path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  health: `<path d="M18 20V10M12 20V4M6 20v-6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="8" x2="12" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  hotel: `<path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14M3 11h18M9 21V11M15 21V11M7 7V3M17 7V3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  fuel: `<path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17M15 11h2a2 2 0 012 2v4M3 11h12" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 17a1 1 0 001-1v-2" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  worship: `<path d="M12 2L6 7v15h12V7l-6-5zM9 22v-5a3 3 0 016 0v5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  bank: `<line x1="12" y1="2" x2="12" y2="6" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M4 10l8-4 8 4M4 10v8h16v-8" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="8" y1="10" x2="8" y2="18" stroke="white" stroke-width="2"/><line x1="12" y1="10" x2="12" y2="18" stroke="white" stroke-width="2"/><line x1="16" y1="10" x2="16" y2="18" stroke="white" stroke-width="2"/><line x1="2" y1="22" x2="22" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="2" y1="18" x2="22" y2="18" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  parking: `<circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="2"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="700" font-family="Inter,sans-serif">P</text>`,
  default: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" fill="none" stroke="white" stroke-width="2"/>`,
};

function createPoiIcon(category: string) {
  const svg = POI_SVG[category] || POI_SVG.default;
  return L.divIcon({
    html: `<div style="
      width:30px;height:30px;
      display:flex;align-items:center;justify-content:center;
      background:#6b7280;border-radius:50%;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.2);
      cursor:pointer;
    "><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">${svg}</svg></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: "",
  });
}

function MapEvents({
  onMove,
  onDragStart,
  onDragEnd,
  onMapClick,
}: {
  onMove: (latlng: LatLng) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMapClick: (latlng: LatLng) => void;
}) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMove({ lat: c.lat, lng: c.lng });
    },
    dragstart() {
      onDragStart();
    },
    dragend() {
      onDragEnd();
    },
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function FlyToLocation({ target }: { target: LatLng | null }) {
  const map = useMap();
  const prev = useRef<LatLng | null>(null);

  useEffect(() => {
    if (
      target &&
      (!prev.current ||
        prev.current.lat !== target.lat ||
        prev.current.lng !== target.lng)
    ) {
      map.flyTo(target, 16, { duration: 1.2 });
      prev.current = target;
    }
  }, [target, map]);

  return null;
}

function POILayer({
  pois,
  onPoiClick,
}: {
  pois: POI[];
  onPoiClick: (poi: POI) => void;
}) {
  return (
    <>
      {pois.map((poi) => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lng]}
          icon={createPoiIcon(poi.category)}
          eventHandlers={{
            click: () => onPoiClick(poi),
          }}
        >
          <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>
              {poi.name}
            </span>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

function POIFetcher({
  onPoisLoaded,
}: {
  onPoisLoaded: (pois: POI[]) => void;
}) {
  const map = useMap();
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPois = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const bounds = map.getBounds();
    const s = bounds.getSouth();
    const w = bounds.getWest();
    const n = bounds.getNorth();
    const e = bounds.getEast();

    const query = `
      [out:json][timeout:8];
      (
        node["shop"~"mall|supermarket|convenience|clothes"](${s},${w},${n},${e});
        node["amenity"~"restaurant|cafe|fast_food"](${s},${w},${n},${e});
        node["amenity"~"university|college|school"](${s},${w},${n},${e});
        node["amenity"~"hospital|clinic|pharmacy"](${s},${w},${n},${e});
        node["tourism"~"hotel|motel"](${s},${w},${n},${e});
        node["amenity"="fuel"](${s},${w},${n},${e});
        node["amenity"~"place_of_worship"](${s},${w},${n},${e});
        node["amenity"="bank"](${s},${w},${n},${e});
        node["amenity"="parking"](${s},${w},${n},${e});
      );
      out body 60;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: controller.signal,
      });
      const data = await res.json();

      const pois: POI[] = (data.elements || []).map(
        (el: any): POI => ({
          id: el.id,
          lat: el.lat,
          lng: el.lon,
          name:
            el.tags?.name ||
            el.tags?.["name:en"] ||
            el.tags?.shop ||
            el.tags?.amenity ||
            el.tags?.tourism ||
            "Place",
          category: getCategory(el.tags),
        })
      );

      onPoisLoaded(pois);
    } catch {
      // aborted or failed
    }
  }, [map, onPoisLoaded]);

  useMapEvents({
    moveend() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fetchPois, 600);
    },
  });

  useEffect(() => {
    fetchPois();
  }, [fetchPois]);

  return null;
}

function getCategory(tags: any): string {
  if (!tags) return "default";
  if (tags.shop) return "shopping";
  if (
    tags.amenity === "restaurant" ||
    tags.amenity === "cafe" ||
    tags.amenity === "fast_food"
  )
    return "food";
  if (
    tags.amenity === "university" ||
    tags.amenity === "college" ||
    tags.amenity === "school"
  )
    return "education";
  if (
    tags.amenity === "hospital" ||
    tags.amenity === "clinic" ||
    tags.amenity === "pharmacy"
  )
    return "health";
  if (tags.tourism === "hotel" || tags.tourism === "motel") return "hotel";
  if (tags.amenity === "fuel") return "fuel";
  if (tags.amenity === "place_of_worship") return "worship";
  if (tags.amenity === "bank") return "bank";
  if (tags.amenity === "parking") return "parking";
  return "default";
}

type Props = {
  center: LatLng;
  flyTo: LatLng | null;
  pois: POI[];
  onMove: (latlng: LatLng) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMapClick: (latlng: LatLng) => void;
  onPoiClick: (poi: POI) => void;
  onPoisLoaded: (pois: POI[]) => void;
};

export default function MapView({
  center,
  flyTo,
  pois,
  onMove,
  onDragStart,
  onDragEnd,
  onMapClick,
  onPoiClick,
  onPoisLoaded,
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapEvents
        onMove={onMove}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onMapClick={onMapClick}
      />
      <FlyToLocation target={flyTo} />
      <POIFetcher onPoisLoaded={onPoisLoaded} />
      <POILayer pois={pois} onPoiClick={onPoiClick} />
    </MapContainer>
  );
}
