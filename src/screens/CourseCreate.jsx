import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import courseService from "../services/courseService";

const steps = ["Basic Info", "Content", "Pricing", "Publishing"];

const categories = [
  "Language Learning",
  "Business",
  "Technology",
  "Arts & Design",
  "Music",
  "Health & Fitness",
  "Personal Development",
  "Other",
];

const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const CourseCreate = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    price: "",
    discount: "",
    status: "draft",
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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        instructor: currentUser.uid,
        instructorName: currentUser.displayName,
      };
      const newCourse = await courseService.createCourse(courseData);
      navigate(`/courses/${newCourse.id}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  required
                >
                  <MenuItem value="grammar">Grammar</MenuItem>
                  <MenuItem value="vocabulary">Vocabulary</MenuItem>
                  <MenuItem value="pronunciation">Pronunciation</MenuItem>
                  <MenuItem value="conversation">Conversation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  label="Level"
                  required
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Course Content Structure
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, border: "1px dashed grey", borderRadius: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Drag and drop to organize your course content
                </Typography>
                {/* Add your content builder component here */}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Duration (hours)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount (%)"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Pricing Model</InputLabel>
                <Select
                  name="pricingModel"
                  value={formData.pricingModel || "one-time"}
                  onChange={handleChange}
                  label="Pricing Model"
                >
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="one-time">One-time Payment</MenuItem>
                  <MenuItem value="subscription">Subscription</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SEO Title"
                name="seoTitle"
                value={formData.seoTitle || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                name="metaDescription"
                value={formData.metaDescription || ""}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
        }}
      >
        <IconButton onClick={() => navigate("/courses")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Create New Course
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>{renderStepContent(activeStep)}</Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
              >
                Create Course
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CourseCreate;
