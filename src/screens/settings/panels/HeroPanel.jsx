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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useLandingPage } from "../../../contexts/LandingPageContext";

const HeroPanel = () => {
  const { heroContent, setHeroContent, uploadFile, saveHeroContent } =
    useLandingPage();
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear previous errors
    setUploadError("");
    setSuccessMessage("");

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      return;
    }
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError("Only JPEG, JPG, PNG, and WebP files are allowed");
      return;
    }

    console.log("📸 Starting image upload:", {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    });

    try {
      setUploadProgress(true);
      const result = await uploadFile(file, "hero-backgrounds");
      
      console.log("📸 Upload result:", result);
      
      if (result && result.success && result.url) {
        const updatedHeroContent = {
          ...heroContent,
          backgroundImage: result.url,
          backgroundImagePath: result.path || "",
        };
        
        setHeroContent(updatedHeroContent);
        
        // Automatically save the updated content with new image
        try {
          const saveResult = await saveHeroContent(updatedHeroContent);
          if (saveResult && saveResult.success) {
            setSuccessMessage("Background image uploaded and saved successfully!");
            console.log("📸 Hero content uploaded and saved with new image:", result.url);
          } else {
            setSuccessMessage("Image uploaded but failed to save. Please click 'Save Changes' manually.");
            console.warn("📸 Image uploaded but save failed:", saveResult);
          }
        } catch (saveError) {
          console.error("📸 Error auto-saving after upload:", saveError);
          setSuccessMessage("Image uploaded but failed to save. Please click 'Save Changes' manually.");
        }
      } else {
        const errorMsg = result?.error || "Upload failed - no URL returned";
        setUploadError(errorMsg);
        console.error("📸 Upload failed:", result);
      }
    } catch (error) {
      console.error("📸 Error uploading image:", error);
      const errorMessage = error.message || "Failed to upload image. Please try again.";
      setUploadError(errorMessage);
    } finally {
      setUploadProgress(false);
    }
  };

  const handleRemoveImage = async () => {
    // Clear previous messages
    setUploadError("");
    setSaveError("");
    setSuccessMessage("");
    
    setRemoveProgress(true);
    
    const updatedHeroContent = {
      ...heroContent,
      backgroundImage: "",
      backgroundImagePath: "",
    };
    
    setHeroContent(updatedHeroContent);
    
    // Automatically save the updated content without image
    try {
      const saveResult = await saveHeroContent(updatedHeroContent);
      if (saveResult && saveResult.success) {
        setSuccessMessage("Background image removed and saved successfully!");
        console.log("🗑️ Image removed and hero content saved");
      } else {
        setSaveError("Image removed but failed to save. Please click 'Save Changes' manually.");
        console.warn("🗑️ Image removed but save failed:", saveResult);
      }
    } catch (saveError) {
      console.error("🗑️ Error auto-saving after image removal:", saveError);
      setSaveError("Image removed but failed to save. Please click 'Save Changes' manually.");
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
              <Typography variant="subtitle1" gutterBottom>
                Background Image
              </Typography>
              {heroContent.backgroundImage ? (
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={heroContent.backgroundImage}
                    alt="Hero background"
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={handleRemoveImage}
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
                    height: 200,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    No image selected
                  </Typography>
                </Box>
              )}
              {(uploadProgress || removeProgress) && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {uploadProgress ? "Uploading image..." : "Removing image..."}
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
                  {uploadProgress ? "Uploading..." : removeProgress ? "Removing..." : "Upload Background Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Max size: 5MB. Supported formats: JPEG, JPG, PNG, WebP
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
