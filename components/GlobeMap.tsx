"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { LocationOn, ZoomIn, ZoomOut } from "@mui/icons-material";

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "50%",
        height: "50%",
      }}
    >
      <CircularProgress sx={{ color: "#fff" }} />
    </Box>
  ),
});

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

interface GlobeMapProps {
  photoLocations: PhotoLocation[];
  onMarkerClick?: (photo: PhotoLocation) => void;
  selectedPhoto?: PhotoLocation | null;
}

export default function GlobeMap({
  photoLocations,
  onMarkerClick,
  selectedPhoto,
}: GlobeMapProps) {
  const globeRef = useRef<any>();
  const [isMounted, setIsMounted] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [currentAltitude, setCurrentAltitude] = useState(1.5);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mark globe as ready after a short delay once mounted
  useEffect(() => {
    if (isMounted && !globeReady) {
      const timer = setTimeout(() => {
        setGlobeReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMounted, globeReady]);

  // Pan to first photo or selected photo with precise zoom
  useEffect(() => {
    if (globeRef.current && globeReady && photoLocations.length > 0) {
      const photoToFocus = selectedPhoto || photoLocations[0];
      const targetAltitude = selectedPhoto ? 0.001 : 1.5; // Extreme close zoom for precision
      setCurrentAltitude(targetAltitude);
      globeRef.current.pointOfView(
        {
          lat: photoToFocus.lat,
          lng: photoToFocus.lng,
          altitude: targetAltitude,
        },
        selectedPhoto ? 1000 : 2000
      );
    }
  }, [photoLocations, globeReady, selectedPhoto]);

  // Pan to clicked pin with maximum precision - street-level zoom
  useEffect(() => {
    if (globeRef.current && selectedPhoto) {
      // Zoom to extreme precision - equivalent to Google Maps street view level
      const precisionAltitude = 0.001; // Very low altitude for maximum precision
      setCurrentAltitude(precisionAltitude);
      globeRef.current.pointOfView(
        {
          lat: selectedPhoto.lat,
          lng: selectedPhoto.lng,
          altitude: precisionAltitude,
        },
        800
      );
    }
  }, [selectedPhoto]);

  // Prepare points data for the globe
  const pointsData = photoLocations.map((photo) => ({
    lat: photo.lat,
    lng: photo.lng,
    size: 0.001,
    color: "#ff6b6b",
    photo,
  }));

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#000",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {photoLocations.length === 0 && globeReady && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <LocationOn sx={{ fontSize: 48, color: "#666", mb: 2 }} />
          <Typography variant="body1" sx={{ color: "#fff" }}>
            No photos with location data found
          </Typography>
          <Typography variant="body2" sx={{ color: "#999", mt: 1 }}>
            Upload photos with GPS metadata to see them on the map
          </Typography>
        </Box>
      )}

      {isMounted && (
        <>
          {/* Zoom Controls */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <Tooltip title="Zoom In (More Precise)">
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={() => {
                  if (globeRef.current) {
                    const newAlt = Math.max(0.0001, currentAltitude * 0.5);
                    setCurrentAltitude(newAlt);
                    const pov = globeRef.current.pointOfView();
                    globeRef.current.pointOfView(
                      {
                        ...pov,
                        altitude: newAlt,
                      },
                      300
                    );
                  }
                }}
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton
                size="small"
                sx={{ color: "white" }}
                onClick={() => {
                  if (globeRef.current) {
                    const newAlt = Math.min(3, currentAltitude * 2);
                    setCurrentAltitude(newAlt);
                    const pov = globeRef.current.pointOfView();
                    globeRef.current.pointOfView(
                      {
                        ...pov,
                        altitude: newAlt,
                      },
                      300
                    );
                  }
                }}
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>
          </Box>

          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            pointsData={pointsData}
            pointAltitude="size"
            pointColor="color"
            pointRadius={1.2}
            pointResolution={4}
            enablePointerInteraction={true}
            onGlobeReady={() => setGlobeReady(true)}
            onPointClick={(point: any) => {
              if (onMarkerClick && point.photo) {
                onMarkerClick(point.photo);
              }
            }}
            pointLabel={(point: any) => {
              return `
            <div style="
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              font-size: 12px;
              max-width: 200px;
              text-align: center;
            ">
              <strong>${point.photo.filename}</strong>
              ${
                point.photo.dateTime
                  ? `<br/>${new Date(
                      point.photo.dateTime
                    ).toLocaleDateString()}`
                  : ""
              }
              <br/>
              <small>${point.photo.lat.toFixed(6)}, ${point.photo.lng.toFixed(
                6
              )}</small>
            </div>
          `;
            }}
            enablePointerInteraction={true}
            globeRadius={100}
            // Enable wheel zoom for precise control
            onGlobeClick={(event: any) => {
              // Allow clicking to zoom in
            }}
          />
        </>
      )}
    </Box>
  );
}
