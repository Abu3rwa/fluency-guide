import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../contexts/ThemeContext";

function Contact() {
  const { t } = useTranslation();
  const { theme } = useCustomTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    setSnackbar({
      open: true,
      message: t("contact.form.success"),
      severity: "success",
    });
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 12 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 6,
          }}
        >
          {t("contact.title")}
        </Typography>

        <Typography
          variant="h5"
          align="center"
          sx={{
            color: theme.palette.text.secondary,
            mb: 8,
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          {t("contact.subtitle")}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                {t("contact.form.title")}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label={t("contact.form.name")}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: theme.palette.divider,
                          },
                          "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label={t("contact.form.email")}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: theme.palette.divider,
                          },
                          "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label={t("contact.form.subject")}
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: theme.palette.divider,
                          },
                          "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={4}
                      label={t("contact.form.message")}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: theme.palette.divider,
                          },
                          "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        py: 1.5,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                        "&:hover": {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                        },
                      }}
                    >
                      {t("contact.form.submit")}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                {t("contact.info.title")}
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("contact.info.email")}
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  {t("contact.info.emailValue")}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("contact.info.phone")}
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  {t("contact.info.phoneValue")}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("contact.info.address")}
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  {t("contact.info.addressValue")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Contact;
