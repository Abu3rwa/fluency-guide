import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../frebase";
import { collection, addDoc } from "firebase/firestore";
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import {
  Title as TitleIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  School as SchoolIcon,
  AttachMoney as PriceIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import "./createCourseForm.css";

const CreateCourseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    prerequisites: "",
    objectives: "",
  });
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        published: false,
        students: [],
        lessons: [],
        createdAt: new Date().toISOString(),
        objectives: formData.objectives.split(",").map((obj) => obj.trim()),
        prerequisites: formData.prerequisites
          .split(",")
          .map((req) => req.trim()),
      };

      const docRef = await addDoc(collection(db, "courses"), courseData);

      setSnackbar({
        open: true,
        message: "Course created successfully!",
        severity: "success",
      });

      // Clear form
      setFormData({
        title: "",
        description: "",
        image: "",
        price: "",
        prerequisites: "",
        objectives: "",
      });

      // Navigate to course details after a short delay
      setTimeout(() => {
        navigate(`/courses/${docRef.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error adding course: ", error);
      setSnackbar({
        open: true,
        message: "Failed to create course. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <form onSubmit={handleSubmit} className="create-course-form">
      <div className="form-container">
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12}>
            <Paper elevation={0} className="form-column">
              <TextField
                fullWidth
                required
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                label="Course Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                label="Course Prerequisites (comma-separated)"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                helperText="Enter prerequisites separated by commas"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12}>
            <Paper elevation={0} className="form-column">
              <TextField
                fullWidth
                required
                label="Course Price (SDG)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PriceIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                label="Course Objectives (comma-separated)"
                name="objectives"
                value={formData.objectives}
                onChange={handleChange}
                helperText="Enter learning objectives separated by commas"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InfoIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                label="Course Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Form Actions */}
        <div className="form-actions">
          <Button
            variant="outlined"
            onClick={() => navigate("/courses/all")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ ml: 2 }}
          >
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default CreateCourseForm;
