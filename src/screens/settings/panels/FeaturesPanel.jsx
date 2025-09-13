import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLandingPage } from "../../../contexts/LandingPageContext";

const AVAILABLE_ICONS = [
  // 20 Most Important Icons for English Learning Platform
  "Translate", // Language translation
  "School", // Education/learning
  "Quiz", // Tests/quizzes
  "Assignment", // Homework/tasks
  "Book", // Reading/study materials
  "Mic", // Speaking practice
  "VideoCall", // Video lessons
  "Group", // Group learning
  "Person", // Individual learning
  "Chat", // Communication
  "Message", // Messaging
  "Email", // Communication
  "Star", // Achievements/ratings
  "EmojiEvents", // Achievements
  "Assessment", // Progress tracking
  "Analytics", // Learning analytics
  "TrendingUp", // Progress improvement
  "Speed", // Fast learning
  "Timer", // Time management
  "CheckCircle", // Completion/success
  "Psychology", // Personalized learning
];

const FeaturesPanel = () => {
  const { features, setFeatures, reorderItems, saveFeatures } =
    useLandingPage();
  const [expanded, setExpanded] = React.useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleMove = (index, direction) => {
    const newFeatures = reorderItems(features, index, direction);
    setFeatures(newFeatures);
  };

  const handleDelete = (index) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const handleAdd = () => {
    setFeatures([
      ...features,
      {
        id: Date.now(),
        title: "",
        description: "",
        icon: "School",
        benefits: ["", "", ""],
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value,
    };
    setFeatures(newFeatures);
  };

  const handleBenefitChange = (featureIndex, benefitIndex, value) => {
    const newFeatures = [...features];
    newFeatures[featureIndex].benefits[benefitIndex] = value;
    setFeatures(newFeatures);
  };

  const handleSave = async () => {
    try {
      // Validate features before saving
      const validFeatures = features.filter(
        (f) => f && f.title && f.description // Only save features with title and description
      );

      const result = await saveFeatures(validFeatures);

      if (!result.success) {
        console.error("Failed to save features:", result.error);
      }
    } catch (error) {
      console.error("Error saving features:", error);
    }
  };

  return (
    <Box>
      {features.map((feature, index) => (
        <Accordion
          key={feature.id}
          expanded={expanded === `feature-${index}`}
          onChange={handleAccordionChange(`feature-${index}`)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                pr: 2,
              }}
            >
              <Typography>{feature.title || `Feature ${index + 1}`}</Typography>
              <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, "up");
                  }}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === features.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, "down");
                  }}
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={feature.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Icon</InputLabel>
                  <Select
                    value={feature.icon}
                    label="Icon"
                    onChange={(e) =>
                      handleChange(index, "icon", e.target.value)
                    }
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <MenuItem key={icon} value={icon}>
                        {icon}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={feature.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Benefits
                </Typography>
                {feature.benefits.map((benefit, benefitIndex) => (
                  <TextField
                    key={benefitIndex}
                    fullWidth
                    label={`Benefit ${benefitIndex + 1}`}
                    value={benefit}
                    onChange={(e) =>
                      handleBenefitChange(index, benefitIndex, e.target.value)
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Feature
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default FeaturesPanel;
