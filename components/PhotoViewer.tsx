"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { Close, LocationOn } from "@mui/icons-material";

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  filename: string;
  url: string;
  dateTime?: string;
}

interface PhotoViewerProps {
  photo: PhotoLocation | null;
  open: boolean;
  onClose: () => void;
}

export default function PhotoViewer({ photo, open, onClose }: PhotoViewerProps) {
  if (!photo) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "rgba(0, 0, 0, 0.95)",
          color: "white",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ color: "white" }}>
            {photo.filename}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box>
          <Box
            sx={{
              width: "100%",
              mb: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <img
              src={photo.url}
              alt={photo.filename}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            {photo.dateTime && (
              <Box mb={1.5}>
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 0.5 }}>
                  Date & Time
                </Typography>
                <Typography variant="body1" sx={{ color: "white" }}>
                  {new Date(photo.dateTime).toLocaleString()}
                </Typography>
              </Box>
            )}

            <Box mb={1.5}>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 0.5 }}>
                Location
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn sx={{ color: "#4fc3f7", fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: "white" }}>
                  {photo.lat.toFixed(6)}, {photo.lng.toFixed(6)}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Chip
                label="GPS Tagged"
                icon={<LocationOn />}
                color="primary"
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
