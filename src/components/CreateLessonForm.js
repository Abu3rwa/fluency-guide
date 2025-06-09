import { useState } from "react";
import { db } from "../frebase"; // Adjust the path as needed
import {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
} from "firebase/firestore";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  YouTube as YouTubeIcon,
  Audiotrack as AudioIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

import "./createLessonForm.css";

const CreateLessonForm = ({ addLesson, setAddLesson }) => {
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    description: "",
    video: "",
    audio: "",
    instructions: "",
    vocab: [],
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get course ID from URL
  const courseId = window.location.pathname.split("/")[2];

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
      const lesson = {
        ...formData,
        courseId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const lessonsCollectionRef = collection(db, "english_lessons");
      await addDoc(lessonsCollectionRef, lesson);

      setSnackbar({
        open: true,
        message: "Lesson added successfully!",
        severity: "success",
      });

      // Reset form after successful submission
      setFormData({
        title: "",
        text: "",
        description: "",
        video: "",
        audio: "",
        instructions: "",
        vocab: [],
      });

      // Close form after a short delay
      setTimeout(() => {
        setAddLesson(false);
      }, 1500);
    } catch (error) {
      console.error("Error adding lesson: ", error);
      setSnackbar({
        open: true,
        message: "Failed to add lesson. Please try again.",
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      className="create-lesson-form"
    >
      <div className="form-grid">
        {/* Title Field */}
        <TextField
          fullWidth
          required
          label="Lesson Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-field title-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />

        {/* Video URL Field */}
        <TextField
          fullWidth
          required
          label="Video URL"
          name="video"
          value={formData.video}
          onChange={handleChange}
          placeholder="https://youtube.com/..."
          className="form-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <YouTubeIcon className="youtube-icon" />
              </InputAdornment>
            ),
          }}
        />

        {/* Audio URL Field */}
        <TextField
          fullWidth
          required
          label="Audio URL"
          name="audio"
          value={formData.audio}
          onChange={handleChange}
          placeholder="https://..."
          className="form-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AudioIcon className="audio-icon" />
              </InputAdornment>
            ),
          }}
        />

        {/* Instructions Field */}
        <TextField
          fullWidth
          required
          label="Instructions"
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          multiline
          rows={3}
          className="form-field instructions-field"
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ alignSelf: "flex-start", mt: 1.5 }}
              >
                <InfoIcon className="info-icon" />
              </InputAdornment>
            ),
          }}
        />

        {/* Description Field */}
        <TextField
          fullWidth
          required
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          className="form-field description-field"
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ alignSelf: "flex-start", mt: 1.5 }}
              >
                <DescriptionIcon className="description-icon" />
              </InputAdornment>
            ),
          }}
        />

        {/* Lesson Content Field */}
        <TextField
          fullWidth
          required
          label="Lesson Content"
          name="text"
          value={formData.text}
          onChange={handleChange}
          multiline
          rows={8}
          className="form-field content-field"
        />

        {/* Form Actions */}
        <div className="form-actions">
          <Button
            variant="outlined"
            onClick={() => setAddLesson(false)}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Adding..." : "Add Lesson"}
          </Button>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateLessonForm;
