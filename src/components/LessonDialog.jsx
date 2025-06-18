import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const LessonDialog = ({ open, onClose, onSave, courseId }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    duration: "",
    content: "",
    order: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave({ ...formData, courseId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New Lesson</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Lesson Title"
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
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Lesson Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Lesson Type"
              >
                <MenuItem value="video">Video Lesson</MenuItem>
                <MenuItem value="reading">Reading Material</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="discussion">Discussion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={6}
              placeholder="Enter lesson content or instructions..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} color="primary">
          Create Lesson
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LessonDialog;
