"use client";

import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function WorldMap({ photoLocations = [], onMarkerClick }) {
  const [hovered, setHovered] = useState(null);

  return (
    <Map
      mapLib={maplibregl}
      initialViewState={{
        latitude: 56.1304,
        longitude: -106.3468,
        zoom: 3,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      renderWorldCopies
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
