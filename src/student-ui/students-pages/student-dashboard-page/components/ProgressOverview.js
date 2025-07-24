import React from "react";
import { Card, Box, Typography, LinearProgress } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const ProgressOverview = ({
  progress = 0.5,
  minutesToday = 0,
  currentStreak = 0,
}) => (
  <Card
    sx={{
      p: 3,
      mb: 3,
      borderRadius: 3,
      background: (theme) =>
        `linear-gradient(90deg, ${theme.palette.secondary.light}33 0%, ${theme.palette.background.paper} 100%)`,
      boxShadow: 2,
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        Today's Progress
      </Typography>
      {currentStreak > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#ff980022",
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
          }}
        >
          <LocalFireDepartmentIcon
            sx={{ color: "#ff9800", fontSize: 18, mr: 0.5 }}
          />
          <Typography variant="body2" fontWeight={700} color="#ff9800">
            {currentStreak} day{currentStreak > 1 ? "s" : ""}
          </Typography>
        </Box>
      )}
    </Box>
    <Box sx={{ mb: 2 }}>
      <LinearProgress
        variant="determinate"
        value={progress * 100}
        sx={{
          height: 10,
          borderRadius: 2,
          bgcolor: "background.default",
          "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
        }}
      />
    </Box>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="body2" fontWeight={700} color="primary.main">
        {Math.round(progress * 100)}% Complete
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {minutesToday > 1440 ? 1440 : minutesToday} min today
      </Typography>
    </Box>
  </Card>
);

export default ProgressOverview;
