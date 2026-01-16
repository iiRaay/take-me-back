"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";

interface Photo {
  filename: string;
  path: string;
  url: string;
  metadata?: {
    hasLocation: boolean;
    latitude?: number;
    longitude?: number;
    dateTime?: string;
  };
}

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

interface PhotoLibraryProps {
  onPhotosWithLocationChange?: (locations: PhotoLocation[]) => void;
  onPhotosWithDatesChange?: (photos: PhotoLocation[]) => void;
  onPhotoClick?: (photo: PhotoLocation) => void;
}

export default function PhotoLibrary({
  onPhotosWithLocationChange,
  onPhotosWithDatesChange,
  onPhotoClick,
}: PhotoLibraryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const photosWithLocation = useMemo(() => {
    return photos
      .filter((p) => p.metadata?.hasLocation)
      .map((p) => ({
        id: p.filename,
        lat: p.metadata!.latitude!,
        lng: p.metadata!.longitude!,
        filename: p.filename,
        url: p.url,
        dateTime: p.metadata?.dateTime,
      }));
  }, [photos]);

  const photosWithDates = useMemo(() => {
    return photos
      .filter((p) => p.metadata?.dateTime)
      .map((p) => ({
        id: p.filename,
        lat: p.metadata?.latitude ?? 0,
        lng: p.metadata?.longitude ?? 0,
        filename: p.filename,
        url: p.url,
        dateTime: p.metadata!.dateTime!,
      }));
  }, [photos]);

  const locationCallbackRef = useRef(onPhotosWithLocationChange);
  const datesCallbackRef = useRef(onPhotosWithDatesChange);
  const prevLocationsRef = useRef<string>("");
  const prevDatesRef = useRef<string>("");

  useEffect(() => {
    locationCallbackRef.current = onPhotosWithLocationChange;
    datesCallbackRef.current = onPhotosWithDatesChange;
  }, [onPhotosWithLocationChange, onPhotosWithDatesChange]);

  useEffect(() => {
    if (locationCallbackRef.current) {
      const currentIds = JSON.stringify(
        photosWithLocation.map((p) => p.id).sort()
      );
      if (currentIds !== prevLocationsRef.current) {
        prevLocationsRef.current = currentIds;
        locationCallbackRef.current(photosWithLocation);
      }
    }
  }, [photosWithLocation]);

  useEffect(() => {
    if (datesCallbackRef.current) {
      const currentIds = JSON.stringify(
        photosWithDates.map((p) => p.id).sort()
      );
      if (currentIds !== prevDatesRef.current) {
        prevDatesRef.current = currentIds;
        datesCallbackRef.current(photosWithDates);
      }
    }
  }, [photosWithDates]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const photosResponse = await fetch("/api/photos");
      const { photos: photoList } = await photosResponse.json();

      const photosWithMetadata = await Promise.all(
        photoList.map(async (photo: Photo) => {
          try {
            const metadataResponse = await fetch("/api/photos/metadata", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename: photo.filename }),
            });

            const metadata = await metadataResponse.json();

            // Flatten metadata and ensure dateTime is string
            const dateTime = metadata?.metadata?.dateTime
              ? new Date(metadata.metadata.dateTime).toISOString()
              : undefined;

            return {
              ...photo,
              metadata: {
                hasLocation: metadata.hasLocation,
                latitude: metadata.latitude,
                longitude: metadata.longitude,
                dateTime,
              },
            };
          } catch (err) {
            console.error(
              `Error fetching metadata for ${photo.filename}:`,
              err
            );
            return { ...photo, metadata: { hasLocation: false } };
          }
        })
      );

      setPhotos(photosWithMetadata);
    } catch (err) {
      console.error("Error loading photos:", err);
      setError("Failed to load photos. Make sure the photos folder exists.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="warning">{error}</Alert>;
  if (photos.length === 0)
    return <Alert severity="info">No photos found.</Alert>;

  const photosWithLocationCount = photos.filter(
    (p) => p.metadata?.hasLocation
  ).length;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Photo Library ({photos.length})</Typography>
        <Chip
          label={`${photosWithLocationCount} with location data`}
          color={photosWithLocationCount > 0 ? "primary" : "default"}
          icon={<LocationOn />}
        />
      </Box>
      <Grid container spacing={2}>
        {photos.map((p) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.filename}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
              onClick={() =>
                p.metadata?.hasLocation &&
                onPhotoClick?.({
                  id: p.filename,
                  lat: p.metadata.latitude!,
                  lng: p.metadata.longitude!,
                  filename: p.filename,
                  url: p.url,
                  dateTime: p.metadata.dateTime,
                })
              }
            >
              <CardMedia
                component="img"
                height="200"
                image={p.url}
                alt={p.filename}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="body2" noWrap>
                  {p.filename}
                </Typography>
                {p.metadata?.hasLocation && (
                  <Chip
                    size="small"
                    label="📍 GPS"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                )}
                {p.metadata?.dateTime && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={1}
                  >
                    {new Date(p.metadata.dateTime).toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
