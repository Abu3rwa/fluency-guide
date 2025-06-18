import "./studentStatsCharts.css";
import React from "react";
import { Box, Paper, Typography, Grid, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

const StatCard = ({ title, value = 0, total = 1, color }) => {
  const percentage = (value / total) * 100;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)",
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: (theme) => alpha(theme.palette[color].main, 0.1),
              "& .MuiLinearProgress-bar": {
                backgroundColor: (theme) => theme.palette[color].main,
              },
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {percentage.toFixed(1)}%
        </Typography>
      </Box>
    </Paper>
  );
};

const StudentStatsCharts = ({ stats = {} }) => {
  const theme = useTheme();
  const { alpha } = theme.palette;

  const {
    totalStudents = 0,
    activeStudents = 0,
    newStudents = 0,
    inactiveStudents = 0,
  } = stats;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Student Statistics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            total={totalStudents || 1}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Students"
            value={activeStudents}
            total={totalStudents || 1}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Students"
            value={newStudents}
            total={totalStudents || 1}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Students"
            value={inactiveStudents}
            total={totalStudents || 1}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentStatsCharts;
