"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, Typography } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

interface LeafletMapProps {
  photoLocations: PhotoLocation[];
  onMarkerClick?: (photo: PhotoLocation) => void;
  selectedPhoto?: PhotoLocation | null;
}

// Component to handle map view updates - must be inside MapContainer
const MapViewUpdater = dynamic(
  () => {
    return function MapViewUpdater({
      selectedPhoto,
      photoLocations,
    }: {
      selectedPhoto?: PhotoLocation | null;
      photoLocations: PhotoLocation[];
    }) {
      const { useMap } = require("react-leaflet");
      const map = useMap();

  useEffect(() => {
    if (selectedPhoto) {
      map.setView([selectedPhoto.lat, selectedPhoto.lng], 18, {
        animate: true,
        duration: 1.0,
      });
    } else if (photoLocations.length > 0) {
      // Fit bounds to show all photos
      const bounds = photoLocations.map((photo) => [photo.lat, photo.lng] as [number, number]);
      if (bounds.length === 1) {
        map.setView(bounds[0], 15, { animate: true, duration: 1.0 });
      } else {
        const boundsObj = L.latLngBounds(bounds);
        map.fitBounds(boundsObj, { padding: [50, 50], maxZoom: 18 });
      }
    }
      }, [selectedPhoto, photoLocations, map]);

      return null;
    };
  },
  { ssr: false }
);

export default function LeafletMap({
  photoLocations,
  onMarkerClick,
  selectedPhoto,
}: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default center (will be overridden by MapViewUpdater)
  const defaultCenter: [number, number] =
    photoLocations.length > 0
      ? [photoLocations[0].lat, photoLocations[0].lng]
      : [0, 0];

  if (!isMounted) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Typography>Loading map...</Typography>
      </Box>
    );
  }

  if (photoLocations.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
        }}
      >
        <LocationOn sx={{ fontSize: 48, color: "#999", mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          No photos with location data found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Upload photos with GPS metadata to see them on the map
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        "& .leaflet-container": {
          width: "100%",
          height: "100%",
          zIndex: 0,
        },
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        dragging={true}
        keyboard={true}
        touchZoom={true}
        maxZoom={19}
        minZoom={1}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {photoLocations.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat, photo.lng]}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(photo);
                }
              },
            }}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {photo.filename}
                </Typography>
                {photo.dateTime && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {new Date(photo.dateTime).toLocaleString()}
                  </Typography>
                )}
                <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                  {photo.lat.toFixed(6)}, {photo.lng.toFixed(6)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
        <MapViewUpdater selectedPhoto={selectedPhoto} photoLocations={photoLocations} />
      </MapContainer>
    </Box>
  );
}