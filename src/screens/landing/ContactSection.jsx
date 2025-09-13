/*
 * ContactSection Component
 * 
 * This component displays dynamic contact information from Firebase.
 * To ensure proper functionality:
 * 
 * 1. Make sure your LandingPageContext is properly fetching contactInfo from Firebase
 * 2. The expected Firebase document structure should include:
 *    {
 *      email: "your-email@domain.com",
 *      phone: "+1234567890",
 *      location: "Your Address",
 *      socialLinks: {
 *        facebook: "https://facebook.com/yourpage",
 *        twitter: "https://twitter.com/yourhandle",
 *        linkedin: "https://linkedin.com/in/yourprofile",
 *        whatsapp: "+1234567890",
 *        whatsappMessage: "Hello! I'm interested in your services",
 *        tiktok: "https://tiktok.com/@yourhandle"
 *      }
 *    }
 * 3. Update the form submission logic to integrate with your backend/Firebase
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Tooltip,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import SendIcon from "@mui/icons-material/Send";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShareIcon from "@mui/icons-material/Share";
import {
  validateContactForm,
  sanitizeInput,
  RateLimiter,
} from "../../utils/validation";
import { useLandingPage } from "../../contexts/LandingPageContext";

const ContactSection = React.memo(({ t, isRTL }) => {
  ContactSection.displayName = "ContactSection";
  const theme = useTheme();
  const { contactInfo, loading: contactLoading, error: contactError } = useLandingPage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Initialize rate limiter
  const [rateLimiter] = useState(() => new RateLimiter(3, 60000)); // 3 attempts per minute

  // Debug: Log contactInfo when it changes
  useEffect(() => {
    console.log("ContactSection - contactInfo updated:", contactInfo);
    console.log("ContactSection - loading state:", contactLoading);
    console.log("ContactSection - error state:", contactError);
  }, [contactInfo, contactLoading, contactError]);

  // Debug function to manually test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log("Testing Firebase connection...");
      const { useLandingPage } = await import("../../contexts/LandingPageContext");
      // Force a refetch by reloading the page for now - in production you'd implement a refresh method
      window.location.reload();
    } catch (error) {
      console.error("Firebase connection test failed:", error);
    }
  };

  const validateForm = () => {
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      message: sanitizeInput(formData.message),
    };

    const validation = validateContactForm(sanitizedData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check rate limiting
    if (!rateLimiter.canAttempt("contact-form")) {
      setSnackbar({
        open: true,
        message: "Too many attempts. Please wait a moment before trying again.",
        severity: "error",
      });
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare the contact data with dynamic email if available
      const contactData = {
        ...formData,
        timestamp: new Date().toISOString(),
        // Use dynamic contact email if available, otherwise use a default
        recipientEmail: contactInfo?.email || "support@englishlearning.com",
      };

      // TODO: Replace this with your actual Firebase/API submission logic
      // Example Firebase integration:
      // 
      // import { collection, addDoc } from 'firebase/firestore';
      // import { db } from '../../firebase/config';
      // 
      // await addDoc(collection(db, 'contactSubmissions'), contactData);
      // 
      // Or use your existing contact form service:
      // await contactService.submitForm(contactData);
      
      // Simulate API call - Replace with actual submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log("Contact form submitted:", contactData);

      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: t("landing.contact.success"),
        severity: "success",
      });
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    } catch (error) {
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: t("landing.contact.error") || "Failed to send message. Please try again.",
        severity: "error",
      });
      console.error("Contact form submission error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Helper function to format WhatsApp link
  const formatWhatsAppLink = (phoneNumber, message = "") => {
    if (!phoneNumber) return "";

    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // If it doesn't start with +, assume it's a local number and add country code
    if (!cleaned.startsWith("+")) {
      cleaned = "+1" + cleaned;
    }

    // Remove the + and create the WhatsApp link
    const numberOnly = cleaned.replace("+", "");
    const baseUrl = `https://wa.me/${numberOnly}`;

    // Add message if provided
    if (message) {
      return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }

    return baseUrl;
  };

  // Social Media Links Component
  const SocialMediaLinks = ({ socialLinks }) => {
    SocialMediaLinks.displayName = "SocialMediaLinks";
    
    // Don't render if no social links or if loading
    if (!socialLinks || contactLoading) return null;

    const platforms = [
      { key: "facebook", icon: FacebookIcon, label: "Facebook" },
      { key: "twitter", icon: TwitterIcon, label: "Twitter" },
      { key: "linkedin", icon: LinkedInIcon, label: "LinkedIn" },
      { key: "whatsapp", icon: WhatsAppIcon, label: "WhatsApp" },
      { key: "tiktok", icon: ShareIcon, label: "TikTok" },
    ];

    // Filter platforms that have actual links
    const availablePlatforms = platforms.filter(({ key }) => socialLinks[key]);
    
    // Don't render if no social links are available
    if (availablePlatforms.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="subtitle1"
          color="primary"
          sx={{ fontWeight: 600, mb: 2 }}
        >
          {t("landing.contact.socialMedia")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {availablePlatforms.map(({ key, icon: Icon, label }) => {
            const link = socialLinks[key];
            
            // Handle WhatsApp special case
            const href =
              key === "whatsapp"
                ? formatWhatsAppLink(link, socialLinks.whatsappMessage)
                : link;

            return (
              <Tooltip key={key} title={`${t("landing.contact.followUs")} ${label}` || `Follow us on ${label}`} arrow>
                <IconButton
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Icon />
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    );
  };

  const ContactInfo = ({ icon, title, content }) => {
    ContactInfo.displayName = "ContactInfo";
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <IconButton
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          {icon}
        </IconButton>
        <Box>
          <Typography
            variant="subtitle1"
            color="primary"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 12 },
        bgcolor: theme.palette.background.default,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.divider}, ${theme.palette.primary.main}, ${theme.palette.divider})`,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h3"
                color="primary"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                }}
              >
                {t("landing.contact.title")}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 4,
                  maxWidth: "500px",
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                }}
              >
                {t("landing.contact.subtitle")}
              </Typography>

              {contactLoading ? (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="text" width="80%" height={20} />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="text" width="80%" height={20} />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="text" width="80%" height={20} />
                    </Box>
                  </Box>
                </Box>
              ) : contactError ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="error" variant="body1">
                    {t("landing.contact.loadError") || "Unable to load contact information"}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => window.location.reload()}
                    sx={{ mt: 2 }}
                  >
                    {t("common.retry") || "Retry"}
                  </Button>
                </Box>
              ) : contactInfo ? (
                <>
                  {contactInfo?.email && (
                    <ContactInfo
                      icon={<EmailIcon />}
                      title={t("landing.contact.email")}
                      content={contactInfo.email}
                    />
                  )}
                  {contactInfo?.phone && (
                    <ContactInfo
                      icon={<PhoneIcon />}
                      title={t("landing.contact.phone")}
                      content={contactInfo.phone}
                    />
                  )}
                  {contactInfo?.location && (
                    <ContactInfo
                      icon={<LocationOnIcon />}
                      title={t("landing.contact.location")}
                      content={contactInfo.location}
                    />
                  )}
                  {/* Social Media Links */}
                  <SocialMediaLinks socialLinks={contactInfo.socialLinks} />
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary" variant="body1">
                    {t("landing.contact.noInfo") || "Contact information will be available soon"}
                  </Typography>
                  {/* Debug section - remove in production */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
                    <Typography variant="body2" color="warning.dark">
                      Debug Info: No contact data found
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={testFirebaseConnection}
                      sx={{ mt: 1 }}
                    >
                      Test Firebase Connection
                    </Button>
                  </Box>
                </Box>
              )}
            </motion.div>
          </Grid>

          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  bgcolor: "background.paper",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              >
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  onSubmit={handleSubmit}
                  aria-label="Contact form"
                >
                  <TextField
                    fullWidth
                    name="name"
                    label={t("landing.contact.name")}
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    margin="normal"
                    variant="outlined"
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    name="email"
                    label={t("landing.contact.email")}
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    margin="normal"
                    variant="outlined"
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Tooltip
                    title={t("landing.contact.messageTooltip")}
                    arrow
                    placement="top-start"
                  >
                    <TextField
                      fullWidth
                      name="message"
                      label={t("landing.contact.message")}
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      margin="normal"
                      variant="outlined"
                      multiline
                      rows={4}
                      sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Tooltip>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                    {...(isRTL
                      ? {
                          startIcon: isSubmitting ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <SendIcon />
                          ),
                        }
                      : {
                          endIcon: isSubmitting ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <SendIcon />
                          ),
                        }
                    )}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {isSubmitting
                      ? t("landing.contact.sending")
                      : t("landing.contact.send")}
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default ContactSection;
