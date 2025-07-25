import React from "react";
import { Card, Box, Typography, useTheme } from "@mui/material";

const StatCard = ({ icon, value, label, color }) => {
  const theme = useTheme();
  const iconColor = color
    ? theme.palette[color]?.main || color
    : theme.palette.primary.main;
  return (
    <Card
      sx={{
        p: theme.spacing(2.5),
        borderRadius: theme.shape.borderRadius,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: 1,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          p: theme.spacing(1.5),
          bgcolor: iconColor + "22",
          borderRadius: theme.shape.borderRadius,
          mb: theme.spacing(1.5),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, {
          sx: { color: iconColor, fontSize: theme.typography.h4.fontSize },
        })}
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        color="text.primary"
        sx={{ fontFamily: theme.typography.h6.fontFamily }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ fontFamily: theme.typography.body2.fontFamily }}
      >
        {label}
      </Typography>
    </Card>
  );
};

export default StatCard;
