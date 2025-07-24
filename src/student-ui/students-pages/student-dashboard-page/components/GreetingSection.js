import React from "react";
import { Card, Box, Typography, IconButton, Avatar } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const GreetingSection = ({ user }) => {
  const navigate = useNavigate();
  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        background: (theme) =>
          `linear-gradient(90deg, ${theme.palette.primary.light}33 0%, ${theme.palette.background.paper} 100%)`,
        boxShadow: 2,
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2,
        }}
      >
        <PersonIcon sx={{ color: "primary.contrastText", fontSize: 36 }} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" color="text.secondary">
          {getGreeting()}
        </Typography>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          {user?.displayName || user?.name || "Student"}
        </Typography>
        {user?.email && (
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        )}
      </Box>
      <IconButton
        onClick={() => navigate("/profile")}
        sx={{ bgcolor: "primary.light", ml: 2 }}
      >
        <EditOutlinedIcon color="primary" />
      </IconButton>
    </Card>
  );
};

export default GreetingSection;
