"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { LatLng, SearchResult, POI } from "@/domain/entities/Location";
import {
  reverseGeocode,
  searchLocations,
} from "@/infrastructure/services/geocoding.service";

type UseLocationPickerParams = {
  initialValue?: string;
  onChange?: (location: { address: string; lat: number; lng: number }) => void;
};

export function useLocationPicker({
  initialValue = "",
  onChange,
}: UseLocationPickerParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState(initialValue);
  const [center, setCenter] = useState<LatLng>({ lat: 25.2048, lng: 55.2708 });
  const [flyTo, setFlyTo] = useState<LatLng | null>(null);
  const [tempAddress, setTempAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Get user location on first open
  const hasLocated = useRef(false);
  useEffect(() => {
    if (!isOpen || hasLocated.current) return;
    hasLocated.current = true;

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(latlng);
        setFlyTo({ ...latlng });
        const addr = await reverseGeocode(latlng.lat, latlng.lng);
        setTempAddress(addr);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, [isOpen]);

  const handleMapMove = useCallback((latlng: LatLng) => {
    setCenter(latlng);
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      const addr = await reverseGeocode(latlng.lat, latlng.lng);
      setTempAddress(addr);
    }, 400);
  }, []);

  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const handleMapClick = useCallback((latlng: LatLng) => {
    setFlyTo({ ...latlng });
  }, []);

  const handlePoiClick = useCallback((poi: POI) => {
    setFlyTo({ lat: poi.lat, lng: poi.lng });
    setTempAddress(poi.name);
  }, []);

  const handleSuggestionClick = useCallback((result: SearchResult) => {
    const latlng = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    setCenter(latlng);
    setFlyTo({ ...latlng });
    setTempAddress(result.display_name);
    setSearchQuery(result.display_name);
    setShowSuggestions(false);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchQuery(q);

      if (searchTimer.current) clearTimeout(searchTimer.current);

      if (!q.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      searchTimer.current = setTimeout(async () => {
        try {
          const results = await searchLocations(q, center);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    },
    [center]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (suggestions.length > 0) {
          handleSuggestionClick(suggestions[0]);
        }
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [suggestions, handleSuggestionClick]
  );

  const handleConfirm = useCallback(() => {
    if (tempAddress) {
      setAddress(tempAddress);
      onChange?.({ address: tempAddress, lat: center.lat, lng: center.lng });
    }
    setIsOpen(false);
  }, [center, tempAddress, onChange]);

  const handlePoisLoaded = useCallback((newPois: POI[]) => {
    setPois(newPois);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const showSuggestionsOnFocus = useCallback(() => {
    if (suggestions.length > 0) setShowSuggestions(true);
  }, [suggestions]);

  return {
    // State
    isOpen,
    address,
    center,
    flyTo,
    tempAddress,
    searchQuery,
    suggestions,
    showSuggestions,
    isDragging,
    pois,
    searchBarRef,

    // Actions
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    handleMapMove,
    handleDragStart,
    handleDragEnd,
    handleMapClick,
    handlePoiClick,
    handleSuggestionClick,
    handleSearchChange,
    handleKeyDown,
    handleConfirm,
    handlePoisLoaded,
    clearSearch,
    showSuggestionsOnFocus,
  };
}
