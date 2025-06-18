import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/constants";

const Signup = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t("auth.signup.title")}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t("auth.signup.email")}
              type="email"
              margin="normal"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <TextField
              fullWidth
              label={t("auth.signup.password")}
              type="password"
              margin="normal"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <TextField
              fullWidth
              label={t("auth.signup.confirmPassword")}
              type="password"
              margin="normal"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              {t("auth.signup.submit")}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate(ROUTES.LOGIN)}
              sx={{ mt: 1 }}
            >
              {t("auth.signup.haveAccount")}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
