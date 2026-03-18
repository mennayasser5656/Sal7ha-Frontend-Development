"use client";

import dynamic from "next/dynamic";
import { MapPin, X, Search } from "lucide-react";
import styles from "./LocationPicker.module.css";
import { useLocationPicker } from "@/application/hooks/useLocationPicker";
import { formatSuggestion } from "@/infrastructure/services/geocoding.service";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

type Props = {
  span?: number;
  value?: string;
  placeholder?: string;
  onChange?: (location: { address: string; lat: number; lng: number }) => void;
};

export default function LocationPicker({
  span = 12,
  value = "",
  placeholder = "Select a location",
  onChange,
}: Props) {
  const picker = useLocationPicker({ initialValue: value, onChange });

  return (
    <div className={`${styles.wrapper} ${styles[`span${span}`]}`}>
      <input
        type="text"
        className={styles.input}
        value={picker.address}
        placeholder={placeholder}
        readOnly
        onClick={picker.open}
      />
      <div className={styles.mapIcon} onClick={picker.open}>
        <MapPin />
      </div>

      {picker.isOpen && (
        <div className={styles.overlay} onClick={picker.close}>
          <div
            className={styles.mapContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Full-bleed map */}
            <div className={styles.mapArea}>
              <MapView
                center={picker.center}
                flyTo={picker.flyTo}
                pois={picker.pois}
                onMove={picker.handleMapMove}
                onDragStart={picker.handleDragStart}
                onDragEnd={picker.handleDragEnd}
                onMapClick={picker.handleMapClick}
                onPoiClick={picker.handlePoiClick}
                onPoisLoaded={picker.handlePoisLoaded}
              />

              {/* Center pin */}
              <div
                className={`${styles.centerPin} ${picker.isDragging ? styles.centerPinLifted : ""}`}
              >
                <div className={styles.centerPinCircle}>
                  <div className={styles.centerPinInnerDot} />
                </div>
                <div className={styles.centerPinLine} />
              </div>
              <div
                className={`${styles.centerDot} ${picker.isDragging ? styles.centerDotLifted : ""}`}
              />

              {/* Floating search bar with autocomplete */}
              <div className={styles.searchBar} ref={picker.searchBarRef}>
                <div className={styles.searchIcon}>
                  <Search />
                </div>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search location"
                  value={picker.searchQuery}
                  onChange={picker.handleSearchChange}
                  onKeyDown={picker.handleKeyDown}
                  onFocus={picker.showSuggestionsOnFocus}
                />
                {picker.searchQuery && (
                  <button
                    className={styles.clearSearch}
                    onClick={picker.clearSearch}
                  >
                    <X size={14} />
                  </button>
                )}

                {/* Suggestions dropdown */}
                {picker.showSuggestions && (
                  <div className={styles.suggestionsDropdown}>
                    {picker.suggestions.map((result) => {
                      const { main, secondary } = formatSuggestion(result);
                      return (
                        <div
                          key={result.place_id}
                          className={styles.suggestionItem}
                          onClick={() => picker.handleSuggestionClick(result)}
                        >
                          <div className={styles.suggestionIcon}>
                            <MapPin size={14} />
                          </div>
                          <div className={styles.suggestionText}>
                            <span className={styles.suggestionMain}>
                              {main}
                            </span>
                            <span className={styles.suggestionSecondary}>
                              {secondary}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Floating close */}
              <button
                className={styles.closeButton}
                onClick={picker.close}
              >
                <X />
              </button>
            </div>

            {/* Bottom panel */}
            <div className={styles.bottomPanel}>
              <div className={styles.locationInfo}>
                <span className={styles.locationLabel}>Selected location</span>
                {picker.tempAddress ? (
                  <span className={styles.locationAddress}>
                    {picker.tempAddress}
                  </span>
                ) : (
                  <span className={styles.locationPlaceholder}>
                    Move the map to choose
                  </span>
                )}
              </div>
              <button
                className={styles.confirmButton}
                onClick={picker.handleConfirm}
                disabled={!picker.tempAddress}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
