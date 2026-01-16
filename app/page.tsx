"use client";

import { useState, useCallback } from "react";
import { Box, Container, Typography, Paper, Tabs, Tab } from "@mui/material";
import PhotoLibrary from "@/components/PhotoLibrary";
import PhotoViewer from "@/components/PhotoViewer";
import PhotoTimeline from "@/components/PhotoTimeline";
import WorldMap from "@/components/WorldMap";

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

export default function Home() {
  const [photoLocations, setPhotoLocations] = useState<PhotoLocation[]>([]);
  const [photosWithDates, setPhotosWithDates] = useState<PhotoLocation[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLocation | null>(
    null
  );
  const [tabValue, setTabValue] = useState(0);

  const handlePhotosWithLocationChange = useCallback(
    (locations: PhotoLocation[]) => {
      setPhotoLocations(locations);
    },
    []
  );

  const handlePhotosWithDatesChange = useCallback((photos: PhotoLocation[]) => {
    setPhotosWithDates(photos);
  }, []);

  const handlePhotoClick = useCallback((photo: PhotoLocation) => {
    setSelectedPhoto(photo);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Timeline App
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore your photos on an interactive globe map, timeline, and library
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Globe Map" />
          <Tab label="Timeline" />
          <Tab label="Photo Library" />
        </Tabs>
      </Paper>

      {/* Globe Map Tab */}
      <Box sx={{ display: tabValue === 0 ? "block" : "none" }}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ height: "600px", width: "100%" }}>
            <WorldMap
              photoLocations={photoLocations}
              onMarkerClick={handlePhotoClick}
            />
          </Box>
        </Paper>
      </Box>

      {/* Timeline Tab */}
      <Box sx={{ display: tabValue === 1 ? "block" : "none" }}>
        <Paper sx={{ p: 3, maxHeight: "700px", overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Photo Timeline
          </Typography>
          <PhotoTimeline
            photos={photosWithDates}
            onPhotoClick={handlePhotoClick}
          />
        </Paper>
      </Box>

      {/* Photo Library Tab */}
      <Box sx={{ display: tabValue === 2 ? "block" : "none" }}>
        <Paper sx={{ p: 3 }}>
          <PhotoLibrary
            onPhotosWithLocationChange={handlePhotosWithLocationChange}
            onPhotosWithDatesChange={handlePhotosWithDatesChange}
            onPhotoClick={handlePhotoClick}
          />
        </Paper>
      </Box>

      {/* Photo Viewer Modal */}
      <PhotoViewer
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </Container>
  );
}
