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

  // Memoize the photos with location to avoid unnecessary recalculations
  const photosWithLocation = useMemo(() => {
    return photos
      .filter((photo) => photo.metadata?.hasLocation)
      .map((photo) => ({
        id: photo.filename,
        lat: photo.metadata!.latitude!,
        lng: photo.metadata!.longitude!,
        filename: photo.filename,
        url: photo.url,
        dateTime: photo.metadata?.dateTime,
      }));
  }, [photos]);

  // Memoize photos with dates (for timeline) - includes photos with dates but may not have GPS
  const photosWithDates = useMemo(() => {
    return photos
      .filter((photo) => {
        // Include photos that have dates
        if (!photo.metadata?.dateTime) return false;
        const date = new Date(photo.metadata.dateTime);
        return !isNaN(date.getTime());
      })
      .map((photo) => {
        // For photos without GPS, use default coordinates (or you could use 0,0)
        const hasLocation = photo.metadata?.hasLocation;
        return {
          id: photo.filename,
          lat: hasLocation ? photo.metadata!.latitude! : 0,
          lng: hasLocation ? photo.metadata!.longitude! : 0,
          filename: photo.filename,
          url: photo.url,
          dateTime: photo.metadata!.dateTime,
        };
      });
  }, [photos]);

  // Use refs to track callbacks and previous data
  const locationCallbackRef = useRef(onPhotosWithLocationChange);
  const datesCallbackRef = useRef(onPhotosWithDatesChange);
  const prevLocationsRef = useRef<string>("");
  const prevDatesRef = useRef<string>("");

  // Update callback refs when they change
  useEffect(() => {
    locationCallbackRef.current = onPhotosWithLocationChange;
    datesCallbackRef.current = onPhotosWithDatesChange;
  }, [onPhotosWithLocationChange, onPhotosWithDatesChange]);

  // Notify about photos with location (for map)
  useEffect(() => {
    if (locationCallbackRef.current) {
      const currentIds = JSON.stringify(photosWithLocation.map((p) => p.id).sort());
      if (currentIds !== prevLocationsRef.current) {
        prevLocationsRef.current = currentIds;
        locationCallbackRef.current(photosWithLocation);
      }
    }
  }, [photosWithLocation]);

  // Notify about photos with dates (for timeline)
  useEffect(() => {
    if (datesCallbackRef.current) {
      const currentIds = JSON.stringify(photosWithDates.map((p) => p.id).sort());
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

      // Fetch photo list
      const photosResponse = await fetch("/api/photos");
      const { photos: photoList } = await photosResponse.json();

      // Fetch metadata for each photo
      const photosWithMetadata = await Promise.all(
        photoList.map(async (photo: Photo) => {
          try {
            const metadataResponse = await fetch("/api/photos/metadata", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename: photo.filename }),
            });

            const metadata = await metadataResponse.json();
            return { ...photo, metadata };
          } catch (err) {
            console.error(`Error fetching metadata for ${photo.filename}:`, err);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {error}
        <Typography variant="body2" sx={{ mt: 1 }}>
          Create a folder at <code>public/photos</code> and add your photos there.
        </Typography>
      </Alert>
    );
  }

  if (photos.length === 0) {
    return (
      <Alert severity="info">
        No photos found. Add photos to the <code>public/photos</code> folder.
      </Alert>
    );
  }

  const photosWithLocationCount = photos.filter((p) => p.metadata?.hasLocation).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Photo Library ({photos.length} photos)
        </Typography>
        <Chip
          label={`${photosWithLocationCount} with location data`}
          color={photosWithLocationCount > 0 ? "primary" : "default"}
          icon={<LocationOn />}
        />
      </Box>

      <Grid container spacing={2}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={photo.filename}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
              onClick={() => {
                if (photo.metadata?.hasLocation && onPhotoClick) {
                  onPhotoClick({
                    id: photo.filename,
                    lat: photo.metadata.latitude!,
                    lng: photo.metadata.longitude!,
                    filename: photo.filename,
                    url: photo.url,
                    dateTime: photo.metadata.dateTime,
                  });
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={photo.url}
                alt={photo.filename}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="body2" noWrap>
                  {photo.filename}
                </Typography>
                {photo.metadata?.hasLocation && (
                  <Chip
                    size="small"
                    label="📍 GPS"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                )}
                {photo.metadata?.dateTime && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {new Date(photo.metadata.dateTime).toLocaleString()}
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
