import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PaletteIcon from "@mui/icons-material/Palette";
import ImageIcon from "@mui/icons-material/Image";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LanguageIcon from "@mui/icons-material/Language";
import { useLandingPage } from "../../../contexts/LandingPageContext";

const HeroPanel = () => {
  const { heroContent, setHeroContent, uploadFile, saveHeroContent } =
    useLandingPage();
  const theme = useTheme();
  const [uploadProgress, setUploadProgress] = useState(false);
  const [removeProgress, setRemoveProgress] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (field, value) => {
    setHeroContent({
      ...heroContent,
      [field]: value,
    });
  };

  const brandPatterns = [
    { value: 'none', label: 'No Pattern' },
    { value: 'dots', label: 'Dots Pattern' },
    { value: 'grid', label: 'Grid Pattern' },
    { value: 'waves', label: 'Waves Pattern' },
  ];

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    setUploadError("");
    setSuccessMessage("");

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    
    if (file.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      return;
    }
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError("Only JPEG, JPG, PNG, and SVG files are allowed");
      return;
    }

    console.log("📸 Starting logo upload:", {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    });

    try {
      setUploadProgress(true);
      const result = await uploadFile(file, "brand-logos");
      
      console.log("📸 Upload result:", result);
      
      if (result && result.success && result.url) {
        const updatedHeroContent = {
          ...heroContent,
          logoUrl: result.url,
        };
        
        setHeroContent(updatedHeroContent);
        
        // Automatically save the updated content with new logo
        try {
          const saveResult = await saveHeroContent(updatedHeroContent);
          if (saveResult && saveResult.success) {
            setSuccessMessage("Brand logo uploaded and saved successfully!");
            console.log("📸 Hero content uploaded and saved with new logo:", result.url);
          } else {
            setSuccessMessage("Logo uploaded but failed to save. Please click 'Save Changes' manually.");
            console.warn("📸 Logo uploaded but save failed:", saveResult);
          }
        } catch (saveError) {
          console.error("📸 Error auto-saving after upload:", saveError);
          setSuccessMessage("Logo uploaded but failed to save. Please click 'Save Changes' manually.");
        }
      } else {
        const errorMsg = result?.error || "Upload failed - no URL returned";
        setUploadError(errorMsg);
        console.error("📸 Upload failed:", result);
      }
    } catch (error) {
      console.error("📸 Error uploading logo:", error);
      const errorMessage = error.message || "Failed to upload logo. Please try again.";
      setUploadError(errorMessage);
    } finally {
      setUploadProgress(false);
    }
  };

  const handleRemoveLogo = async () => {
    // Clear previous messages
    setUploadError("");
    setSaveError("");
    setSuccessMessage("");
    
    setRemoveProgress(true);
    
    const updatedHeroContent = {
      ...heroContent,
      logoUrl: "",
    };
    
    setHeroContent(updatedHeroContent);
    
    // Automatically save the updated content without logo
    try {
      const saveResult = await saveHeroContent(updatedHeroContent);
      if (saveResult && saveResult.success) {
        setSuccessMessage("Brand logo removed and saved successfully!");
        console.log("🗑️ Logo removed and hero content saved");
      } else {
        setSaveError("Logo removed but failed to save. Please click 'Save Changes' manually.");
        console.warn("🗑️ Logo removed but save failed:", saveResult);
      }
    } catch (saveError) {
      console.error("🗑️ Error auto-saving after logo removal:", saveError);
      setSaveError("Logo removed but failed to save. Please click 'Save Changes' manually.");
    } finally {
      setRemoveProgress(false);
    }
  };

  const handleSave = async () => {
    setSaveError("");
    setSuccessMessage("");
    
    console.log("💾 Saving hero content:", heroContent);
    
    try {
      const result = await saveHeroContent(heroContent);
      
      console.log("💾 Save result:", result);
      
      if (result && result.success) {
        setSuccessMessage("Hero content saved successfully!");
      } else {
        const errorMsg = result?.error || "Failed to save changes";
        setSaveError(errorMsg);
        console.error("💾 Save failed:", result);
      }
    } catch (error) {
      console.error("💾 Error saving hero content:", error);
      setSaveError(error.message || "Failed to save changes. Please try again.");
    }
  };

  const handleCloseSnackbar = () => {
    setUploadError("");
    setSaveError("");
    setSuccessMessage("");
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Title"
            value={heroContent.title}
            onChange={(e) => handleChange("title", e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Title Highlight"
            value={heroContent.titleHighlight}
            onChange={(e) => handleChange("titleHighlight", e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Subtitle"
            multiline
            rows={3}
            value={heroContent.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Demo Video ID"
            value={heroContent.demoVideoId}
            onChange={(e) => handleChange("demoVideoId", e.target.value)}
            margin="normal"
            helperText="YouTube video ID for the demo video"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon />
                Brand Customization
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Brand Colors */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Brand Colors
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Primary Color"
                    type="color"
                    value={heroContent.brandColors?.primary || '#7c3aed'}
                    onChange={(e) => handleChange("brandColors", {
                      ...heroContent.brandColors,
                      primary: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Secondary Color"
                    type="color"
                    value={heroContent.brandColors?.secondary || '#f59e0b'}
                    onChange={(e) => handleChange("brandColors", {
                      ...heroContent.brandColors,
                      secondary: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Accent Color"
                    type="color"
                    value={heroContent.brandColors?.accent || '#a855f7'}
                    onChange={(e) => handleChange("brandColors", {
                      ...heroContent.brandColors,
                      accent: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              {/* Brand Pattern */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Background Pattern</InputLabel>
                <Select
                  value={heroContent.brandPattern || 'none'}
                  onChange={(e) => handleChange("brandPattern", e.target.value)}
                  label="Background Pattern"
                >
                  {brandPatterns.map((pattern) => (
                    <MenuItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon />
                Brand Logo
              </Typography>
              
              {/* Brand Logo Upload */}
              {heroContent.logoUrl ? (
                <Box sx={{ position: "relative", mt: 2 }}>
                  <CardMedia
                    component="img"
                    image={heroContent.logoUrl}
                    alt="Brand Logo"
                    sx={{
                      width: "100%",
                      height: 150,
                      objectFit: "contain",
                      borderRadius: 1,
                      bgcolor: "action.hover",
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleRemoveLogo}
                    disabled={removeProgress}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "background.paper",
                      opacity: removeProgress ? 0.6 : 1,
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 150,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                  <Typography color="text.secondary">
                    No logo uploaded
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  disabled={uploadProgress || removeProgress}
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  {uploadProgress ? "Uploading..." : removeProgress ? "Removing..." : "Upload Brand Logo"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                    onChange={handleImageUpload}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Recommended: SVG or PNG with transparent background
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Branded Background Preview
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  borderRadius: 1,
                  overflow: "hidden",
                  position: "relative",
                  background: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 20%, ${heroContent.brandColors?.accent || theme.palette.primary.light}15 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, ${heroContent.brandColors?.accent || theme.palette.primary.light}10 0%, transparent 50%)
                    `,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(45deg, transparent 30%, rgba(0, 0, 0, 0.3) 50%, transparent 70%)'
                      : 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                  },
                }}
              >
                {/* Education Icons Preview */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '15%',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    zIndex: 1,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '60%',
                    right: '20%',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    zIndex: 1,
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 25 }} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '25%',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                    zIndex: 1,
                  }}
                >
                  <PsychologyIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '40%',
                    right: '10%',
                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                    zIndex: 1,
                  }}
                >
                  <LanguageIcon sx={{ fontSize: 35 }} />
                </Box>

                {heroContent.logoUrl && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      opacity: 0.3,
                      zIndex: 2,
                      '& img': {
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        filter: 'brightness(0) invert(1)',
                      },
                    }}
                  >
                    <img src={heroContent.logoUrl} alt="Brand Logo Preview" />
                  </Box>
                )}
                <Typography color="white" variant="body2" fontWeight={500} sx={{ zIndex: 2 }}>
                  Your Branded Hero
                </Typography>
                <Chip 
                  label={`${theme.palette.mode === 'dark' ? 'Dark' : 'Light'} Theme`}
                  size="small" 
                  sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.2)', zIndex: 2 }}
                />
                <Chip 
                  label={`Pattern: ${brandPatterns.find(p => p.value === heroContent.brandPattern)?.label || 'None'}`}
                  size="small" 
                  sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.2)', zIndex: 2 }}
                />
              </Box>
              {(uploadProgress || removeProgress) && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {uploadProgress ? "Uploading..." : "Processing..."}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  This branded background will automatically use your brand colors and logo to create a professional, consistent look.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>

      {/* Error and Success Messages */}
      <Snackbar
        open={!!uploadError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {uploadError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {saveError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HeroPanel;