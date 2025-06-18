import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";

const Profile = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    bio: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      setSuccess("Profile updated successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U"}
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              {t("profile.title")}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t("profile.name")}
              margin="normal"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label={t("profile.email")}
              type="email"
              margin="normal"
              name="email"
              value={formData.email}
              disabled
            />
            <TextField
              fullWidth
              label={t("profile.phone")}
              margin="normal"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label={t("profile.bio")}
              multiline
              rows={4}
              margin="normal"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              {t("profile.update")}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
