import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTranslation } from "react-i18next";

const StudentTaskTimer = ({ seconds, onTimeUp }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(100);
  const [initialSeconds] = useState(seconds);

  useEffect(() => {
    // Calculate progress percentage
    const percentage = (seconds / initialSeconds) * 100;
    setProgress(percentage);

    // Call onTimeUp when timer reaches zero
    if (seconds <= 0) {
      onTimeUp();
    }
  }, [seconds, initialSeconds, onTimeUp]);

  // Format time as MM:SS
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Determine color based on remaining time
  const getColor = () => {
    if (progress > 60) return "success";
    if (progress > 30) return "warning";
    return "error";
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" alignItems="center" mb={0.5}>
        <AccessTimeIcon fontSize="small" color={getColor()} sx={{ mr: 1 }} />
        <Typography
          variant="body2"
          color={`${getColor()}.main`}
          fontWeight="medium"
        >
          {formatTime(seconds)}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={getColor()}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: "rgba(0, 0, 0, 0.08)",
        }}
      />
    </Box>
  );
};

export default StudentTaskTimer;
