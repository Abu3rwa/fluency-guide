import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useLandingPage } from "../../../contexts/LandingPageContext";

const ShowcasePanel = () => {
  const { showcaseContent, setShowcaseContent, saveShowcaseContent } =
    useLandingPage();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (field, value) => {
    setShowcaseContent({
      ...showcaseContent,
      [field]: value,
    });
  };

  const handleBenefitChange = (index, field, value) => {
    const newBenefits = [...showcaseContent.benefits];
    newBenefits[index] = {
      ...newBenefits[index],
      [field]: value,
    };
    handleChange("benefits", newBenefits);
  };

  const addBenefit = () => {
    const newBenefit = {
      id: Date.now(),
      label: "",
      color: "primary",
      orderIndex: showcaseContent.benefits.length,
    };
    handleChange("benefits", [...showcaseContent.benefits, newBenefit]);
  };

  const removeBenefit = (index) => {
    const newBenefits = showcaseContent.benefits.filter((_, i) => i !== index);
    handleChange("benefits", newBenefits);
  };

  const handleSave = async () => {
    try {
      const result = await saveShowcaseContent(showcaseContent);
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Showcase content saved successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to save showcase content",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error saving showcase content",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const colorOptions = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "success", label: "Success" },
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
    { value: "error", label: "Error" },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Showcase Content Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize the showcase section content that appears on your landing
        page.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Section Title"
            value={showcaseContent.title}
            onChange={(e) => handleChange("title", e.target.value)}
            margin="normal"
            helperText="Main title for the showcase section"
          />

          <TextField
            fullWidth
            label="Overview Text"
            multiline
            rows={4}
            value={showcaseContent.overviewText}
            onChange={(e) => handleChange("overviewText", e.target.value)}
            margin="normal"
            helperText="Text displayed in the Overview tab"
          />

          <TextField
            fullWidth
            label="How It Works Text"
            multiline
            rows={4}
            value={showcaseContent.howItWorksText}
            onChange={(e) => handleChange("howItWorksText", e.target.value)}
            margin="normal"
            helperText="Text displayed in the How It Works tab"
          />

          <FormControlLabel
            control={
              <Switch
                checked={showcaseContent.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
            }
            label="Showcase Section Active"
            sx={{ mt: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Benefits</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addBenefit}
                  variant="outlined"
                  size="small"
                >
                  Add Benefit
                </Button>
              </Box>

              {showcaseContent.benefits.map((benefit, index) => (
                <Card key={benefit.id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                      label="Label"
                      value={benefit.label}
                      onChange={(e) =>
                        handleBenefitChange(index, "label", e.target.value)
                      }
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Color</InputLabel>
                      <Select
                        value={benefit.color}
                        onChange={(e) =>
                          handleBenefitChange(index, "color", e.target.value)
                        }
                        label="Color"
                      >
                        {colorOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <IconButton
                      onClick={() => removeBenefit(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={benefit.label || "Preview"}
                      color={benefit.color}
                      size="small"
                    />
                  </Box>
                </Card>
              ))}

              {showcaseContent.benefits.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No benefits added yet. Click "Add Benefit" to get started.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!showcaseContent.title || !showcaseContent.overviewText}
        >
          Save Changes
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShowcasePanel;
