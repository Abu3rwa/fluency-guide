import React from "react";
import { Grid, Card, Box, Typography } from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

const StatCard = ({ icon, value, label, color }) => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: 1,
      bgcolor: "background.paper",
    }}
  >
    <Box
      sx={{
        p: 1.5,
        bgcolor: color + "22",
        borderRadius: 2,
        mb: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" fontWeight={700} color="text.primary">
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary" align="center">
      {label}
    </Typography>
  </Card>
);

const StatisticsSection = ({
  minutesToday = 0,
  achievementsCount = 0,
  xpPoints = 0,
}) => (
  <Grid container spacing={2} sx={{ mb: 3 }}>
    <Grid item xs={12} sm={4}>
      <StatCard
        icon={<TimerOutlinedIcon sx={{ color: "#1976d2" }} />}
        value={minutesToday}
        label="Minutes Today"
        color="#1976d2"
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <StatCard
        icon={<EmojiEventsOutlinedIcon sx={{ color: "#ffb300" }} />}
        value={achievementsCount}
        label="Achievements"
        color="#ffb300"
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <StatCard
        icon={<StarOutlineIcon sx={{ color: "#8e24aa" }} />}
        value={xpPoints}
        label="XP Points"
        color="#8e24aa"
      />
    </Grid>
  </Grid>
);

export default StatisticsSection;
