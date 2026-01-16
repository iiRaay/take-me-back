"use client";

import { Box, Typography } from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from "@mui/lab";

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

interface PhotoTimelineProps {
  photos: PhotoLocation[];
  onPhotoClick?: (photo: PhotoLocation) => void;
}

export default function PhotoTimeline({
  photos,
  onPhotoClick,
}: PhotoTimelineProps) {
  // Filter and sort photos by date
  const sortedPhotos = photos
    .filter((p) => p.dateTime && !isNaN(new Date(p.dateTime).getTime()))
    .sort(
      (a, b) =>
        new Date(a.dateTime!).getTime() - new Date(b.dateTime!).getTime()
    );

  if (sortedPhotos.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>No photos with date information to display</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxHeight: "700px", overflowY: "auto" }}>
      <Timeline position="right">
        {sortedPhotos.map((photo, index) => (
          <TimelineItem key={photo.id}>
            <TimelineOppositeContent sx={{ flex: 0.2, pr: 2 }}>
              {new Date(photo.dateTime!).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              <br />
              {new Date(photo.dateTime!).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot />
              {index !== sortedPhotos.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent
              sx={{
                cursor: onPhotoClick ? "pointer" : "default",
              }}
              onClick={() => onPhotoClick?.(photo)}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                style={{
                  width: 200,
                  maxWidth: "100%",
                  borderRadius: 8,
                  marginBottom: 4,
                }}
              />
              <Typography variant="body2">{photo.filename}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}
