"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

export default function MapView({
  photoLocations,
  onBack,
  onPhotoClick,
}: {
  photoLocations: PhotoLocation[];
  onBack: () => void;
  onPhotoClick: (photo: PhotoLocation) => void;
}) {
  const center =
    photoLocations.length > 0
      ? [photoLocations[0].lat, photoLocations[0].lng]
      : [0, 0];

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <IconButton
        onClick={onBack}
        sx={{
          position: "absolute",
          zIndex: 10,
          top: 16,
          left: 16,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <ArrowBackIcon sx={{ color: "#fff" }} />
      </IconButton>

      <MapContainer
        center={center as [number, number]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {photoLocations.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat, photo.lng]}
            eventHandlers={{
              click: () => onPhotoClick(photo),
            }}
          >
            <Popup>
              <strong>{photo.filename}</strong>
              <br />
              {photo.dateTime && new Date(photo.dateTime).toLocaleDateString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
