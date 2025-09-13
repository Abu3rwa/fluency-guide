import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Collapse,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TikTokIcon from "@mui/icons-material/Share";
import { useLandingPage } from "../../../contexts/LandingPageContext";
import { useTranslation } from "react-i18next";

const ContactPanel = () => {
  const { t } = useTranslation();
  const { contactInfo, setContactInfo, saveContactInfo } = useLandingPage();

  const handleChange = (field, value) => {
    setContactInfo({
      ...contactInfo,
      [field]: value,
    });
  };

  const handleSocialLinkChange = (platform, value) => {
    setContactInfo({
      ...contactInfo,
      socialLinks: {
        ...contactInfo.socialLinks,
        [platform]: value,
      },
    });
  };

  // Helper function to format WhatsApp number into proper chat link
  const formatWhatsAppLink = (phoneNumber, message = "") => {
    if (!phoneNumber) return "";

    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // Ensure it starts with a country code (has +)
    if (!cleaned.startsWith("+")) {
      return "Please enter a valid phone number with country code (e.g., +1234567890)";
    }

    // Remove the + and create the WhatsApp link
    const numberOnly = cleaned.replace("+", "");

    // Validate that we have a proper number after removing +
    if (numberOnly.length < 7) {
      return "Please enter a complete phone number with country code";
    }

    let link = `https://wa.me/${numberOnly}`;

    // Add message parameter if provided
    if (message && message.trim()) {
      const encodedMessage = encodeURIComponent(message.trim());
      link += `?text=${encodedMessage}`;
    }

    return link;
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      console.log("Saving contact info:", contactInfo);
      const result = await saveContactInfo(contactInfo);
      console.log("Save result:", result);

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Reset success state after 3 seconds
      } else {
        throw new Error(result.error || "Failed to save contact information");
      }
    } catch (error) {
      console.error("Error saving contact info:", error);
      setSaveError(error.message || "Failed to save contact information");
      setTimeout(() => setSaveError(null), 5000); // Clear error after 5 seconds
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={contactInfo.email}
                onChange={(e) => handleChange("email", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={contactInfo.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Location"
                value={contactInfo.location}
                onChange={(e) => handleChange("location", e.target.value)}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                {t("landing.contact.socialMedia")}
              </Typography>
              <TextField
                fullWidth
                label="Facebook"
                value={contactInfo.socialLinks?.facebook || ""}
                onChange={(e) =>
                  handleSocialLinkChange("facebook", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Twitter"
                value={contactInfo.socialLinks?.twitter || ""}
                onChange={(e) =>
                  handleSocialLinkChange("twitter", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TwitterIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="LinkedIn"
                value={contactInfo.socialLinks?.linkedin || ""}
                onChange={(e) =>
                  handleSocialLinkChange("linkedin", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="WhatsApp Number"
                value={contactInfo.socialLinks?.whatsapp || ""}
                onChange={(e) =>
                  handleSocialLinkChange("whatsapp", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WhatsAppIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Enter phone number with country code (e.g., +1234567890) - will generate WhatsApp chat link"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="WhatsApp Prefilled Message"
                value={contactInfo.socialLinks?.whatsappMessage || ""}
                onChange={(e) =>
                  handleSocialLinkChange("whatsappMessage", e.target.value)
                }
                multiline
                rows={2}
                helperText="Optional: Enter a message that will be prefilled in the WhatsApp chat"
                sx={{ mb: 2 }}
              />
              {contactInfo.socialLinks?.whatsapp && (
                <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    gutterBottom
                  >
                    Generated WhatsApp Chat Link:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
                  >
                    {formatWhatsAppLink(
                      contactInfo.socialLinks.whatsapp,
                      contactInfo.socialLinks?.whatsappMessage
                    )}
                  </Typography>
                  {contactInfo.socialLinks?.whatsappMessage && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Prefilled message: "
                      {contactInfo.socialLinks.whatsappMessage}"
                    </Typography>
                  )}
                </Box>
              )}
              <TextField
                fullWidth
                label="TikTok"
                value={contactInfo.socialLinks?.tiktok || ""}
                onChange={(e) =>
                  handleSocialLinkChange("tiktok", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TikTokIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Enter TikTok username or profile URL"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2 }}>
        <Collapse in={saveError !== null || saveSuccess}>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}
          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Contact information saved successfully!
            </Alert>
          )}
        </Collapse>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color={saveSuccess ? "success" : "primary"}
            onClick={handleSave}
            disabled={isSaving}
            startIcon={
              isSaving ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ContactPanel;
