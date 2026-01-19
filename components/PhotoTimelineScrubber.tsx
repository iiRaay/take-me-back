"use client";

import { Box, Paper, Typography, Slider } from "@mui/material";
import { useMemo, useState } from "react";

interface PhotoLocation {
  id: string;
  dateTime?: string;
}

interface Props {
  photos: PhotoLocation[];
  onRangeChange?: (start: Date, end: Date) => void;
}

export default function PhotoTimelineScrubber({
  photos,
  onRangeChange,
}: Props) {
  const timestamps = useMemo(
    () =>
      photos
        .map((p) => p.dateTime && new Date(p.dateTime).getTime())
        .filter((t): t is number => !!t && !isNaN(t))
        .sort((a, b) => a - b),
    [photos],
  );

  if (timestamps.length === 0) return null;

  const min = timestamps[0];
  const max = timestamps[timestamps.length - 1];

  const [range, setRange] = useState<[number, number]>([min, max]);

  const histogram = useMemo(() => {
    const buckets = 24;
    const step = (max - min) / buckets;
    const counts = new Array(buckets).fill(0);

    timestamps.forEach((t) => {
      const index = Math.min(buckets - 1, Math.floor((t - min) / step));
      counts[index]++;
    });

    return counts;
  }, [timestamps, min, max]);

  return (
    <Paper
      elevation={8}
      sx={{
        p: 2.5,
        borderRadius: 3,
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(255,255,255,0.92)",
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" mb={1.5}>
        <Typography fontWeight={600} fontSize={14}>
          Time Range Filter
        </Typography>
        <Box flexGrow={1} mx={2} height={1} bgcolor="divider" />
        <Typography fontSize={12} color="text.secondary">
          {new Date(range[0]).toLocaleDateString()} –{" "}
          {new Date(range[1]).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Histogram */}
      <Box
        display="flex"
        alignItems="flex-end"
        gap="2px"
        height={48}
        mb={1.5}
        px={1}
      >
        {histogram.map((value, i) => (
          <Box
            key={i}
            flex={1}
            height={`${Math.max(15, value * 6)}%`}
            borderRadius={0.5}
            bgcolor="primary.main"
            sx={{ opacity: 0.25 }}
          />
        ))}
      </Box>

      {/* Range Slider */}
      <Slider
        value={range}
        min={min}
        max={max}
        onChange={(_, value) => {
          const r = value as [number, number];
          setRange(r);
          onRangeChange?.(new Date(r[0]), new Date(r[1]));
        }}
        sx={{
          "& .MuiSlider-thumb": {
            width: 18,
            height: 18,
            bgcolor: "background.paper",
            border: "2px solid",
            borderColor: "primary.main",
          },
        }}
      />
    </Paper>
  );
}
