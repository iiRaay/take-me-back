"use client";

import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useState } from "react";

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

export default function WorldMap({
  photoLocations,
  onMarkerClick,
}: {
  photoLocations: PhotoLocation[];
  onMarkerClick: (photo: PhotoLocation) => void;
}) {
  const [hovered, setHovered] = useState<PhotoLocation | null>(null);

  return (
    <Map
      initialViewState={{
        latitude: 56.1304,
        longitude: -106.3468,
        zoom: 3,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      // 🌍 KEY: allows smooth horizontal wrap
      renderWorldCopies={true}
      attributionControl
    >
      {photoLocations.map((photo) => (
        <Marker
          key={photo.id}
          latitude={photo.lat}
          longitude={photo.lng}
          anchor="bottom"
        >
          <div
            style={{
              cursor: "pointer",
              fontSize: "22px",
              transform: "translateY(-4px)",
            }}
            onClick={() => onMarkerClick(photo)}
            onMouseEnter={() => setHovered(photo)}
            onMouseLeave={() => setHovered(null)}
          >
            📍
          </div>
        </Marker>
      ))}

      {hovered && (
        <Popup
          latitude={hovered.lat}
          longitude={hovered.lng}
          closeButton={false}
          closeOnClick={false}
          anchor="top"
          offset={12}
        >
          <strong>{hovered.filename}</strong>
          <br />
          {hovered.dateTime && new Date(hovered.dateTime).toLocaleDateString()}
        </Popup>
      )}
    </Map>
  );
}
