"use client";

import { useMemo, useEffect } from "react";
import { Chrono } from "react-chrono";
import { Box, Typography, Paper } from "@mui/material";

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
  // Filter and sort photos by date, only including photos with valid dates
  const timelineItems = useMemo(() => {
    // Filter out photos without valid dates
    console.log(photos);
    const photosWithDates = photos.filter((photo) => {
      if (!photo.dateTime) return false;
      const date = new Date(photo.dateTime);
      return !isNaN(date.getTime());
    });

    // Sort by date
    const sortedPhotos = photosWithDates.sort((a, b) => {
      const dateA = new Date(a.dateTime!).getTime();
      const dateB = new Date(b.dateTime!).getTime();
      return dateA - dateB;
    });

    return sortedPhotos.map((photo) => ({
      title: new Date(photo.dateTime!).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      cardTitle: photo.filename,
      cardSubtitle: new Date(photo.dateTime!).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      media: {
        type: "IMAGE" as const,
        source: {
          url: photo.url,
        },
      },
      photo, // Store photo data for click handling
    }));
  }, [photos]);

  if (timelineItems.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No photos with date information to display on timeline
        </Typography>
      </Paper>
    );
  }

  // Clean up unwanted labels after render
  useEffect(() => {
    const cleanup = () => {
      // Hide navigation controls that might show "low" "high" labels
      const navControls = document.querySelectorAll(
        ".react-chrono-timeline__navigation, .react-chrono-timeline__toolbar"
      );
      navControls.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });

      // Find and hide standalone text nodes with unwanted labels
      const timelineContainer = document.querySelector(
        ".react-chrono-timeline"
      );
      if (timelineContainer) {
        const walker = document.createTreeWalker(
          timelineContainer,
          NodeFilter.SHOW_TEXT,
          null
        );
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent?.trim().toLowerCase() || "";
          if (
            (text === "low" ||
              text === "high" ||
              text.includes("unknown date")) &&
            node.parentElement
          ) {
            // Only hide if it's a standalone label, not part of actual content
            const parent = node.parentElement;
            if (
              parent.tagName === "SPAN" ||
              parent.tagName === "DIV" ||
              parent.className.includes("label")
            ) {
              parent.style.display = "none";
            }
          }
        }
      }
    };

    // Run cleanup after timeline renders
    const timer = setTimeout(cleanup, 300);
    const interval = setInterval(cleanup, 500); // Also check periodically
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [timelineItems]);

  return (
    <Box sx={{ width: "100%", height: "100%", minHeight: "500px" }}>
      <Chrono
        items={timelineItems}
        mode="VERTICAL_ALTERNATING"
        theme={{
          primary: "#1976d2",
          secondary: "#42a5f5",
          cardBgColor: "#ffffff",
          cardForeColor: "#333333",
          titleColor: "#1976d2",
          titleColorActive: "#1565c0",
        }}
        cardHeight={200}
        onItemSelect={(item: any) => {
          if (onPhotoClick && item.photo) {
            onPhotoClick(item.photo);
          }
        }}
        allowDynamicUpdate
        hideControls={true}
        disableToolbar={false}
        disableClickOnCircle={false}
        fontSizes={{
          cardSubtitle: "0.875rem",
          cardText: "0.875rem",
          cardTitle: "1rem",
          title: "1.25rem",
        }}
        classNames={{
          card: "timeline-card",
          cardMedia: "timeline-card-media",
          cardSubTitle: "timeline-card-subtitle",
          cardText: "timeline-card-text",
          cardTitle: "timeline-card-title",
          controls: "timeline-controls",
          title: "timeline-title",
        }}
      />
    </Box>
  );
}
