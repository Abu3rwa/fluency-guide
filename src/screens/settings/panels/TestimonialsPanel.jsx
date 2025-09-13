import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Rating,
  Grid,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useLandingPage } from "../../../contexts/LandingPageContext";

const TestimonialsPanel = () => {
  const {
    testimonials,
    setTestimonials,
    reorderItems,
    uploadFile,
    saveTestimonials,
  } = useLandingPage();

  const handleMove = (index, direction) => {
    const newTestimonials = reorderItems(testimonials, index, direction);
    setTestimonials(newTestimonials);
  };

  const handleDelete = (index) => {
    const newTestimonials = testimonials.filter((_, i) => i !== index);
    setTestimonials(newTestimonials);
  };

  const handleAdd = () => {
    setTestimonials([
      ...testimonials,
      {
        id: Date.now(),
        name: "",
        role: "",
        quote: "",
        avatar: "",
        rating: 5,
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = {
      ...newTestimonials[index],
      [field]: value,
    };
    setTestimonials(newTestimonials);
  };

  const handleAvatarUpload = async (index, file) => {
    const result = await uploadFile(file, "testimonials");
    if (result.success) {
      handleChange(index, "avatar", result.url);
    }
  };

  const handleSave = async () => {
    try {
      console.log('=== TESTIMONIALS PANEL DEBUG ===');
      console.log('Testimonials to save:', testimonials);
      console.log('Testimonials type:', typeof testimonials);
      console.log('Testimonials length:', testimonials.length);
      
      // Validate testimonials before saving
      const validTestimonials = testimonials.filter(t => 
        t && t.name && t.quote // Only save testimonials with name and quote
      );

      console.log('Valid testimonials after filtering:', validTestimonials);

      const result = await saveTestimonials(validTestimonials);
      
      console.log('Save result:', result);
      
      if (result.success) {
        console.log('Testimonials saved successfully');
      } else {
        console.error('Failed to save testimonials:', result.error);
      }
    } catch (error) {
      console.error('Error saving testimonials:', error);
    }
  };

  return (
    <Box>
      {testimonials.map((testimonial, index) => (
        <Card key={testimonial.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1">
                Testimonial {index + 1}
              </Typography>
              <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => handleMove(index, "up")}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === testimonials.length - 1}
                  onClick={() => handleMove(index, "down")}
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDelete(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    src={testimonial.avatar}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Button variant="outlined" component="label">
                    Upload Avatar
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) =>
                        handleAvatarUpload(index, e.target.files[0])
                      }
                    />
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  label="Name"
                  value={testimonial.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Role"
                  value={testimonial.role}
                  onChange={(e) => handleChange(index, "role", e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    value={testimonial.rating}
                    onChange={(_, value) =>
                      handleChange(index, "rating", value)
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quote"
                  multiline
                  rows={6}
                  value={testimonial.quote}
                  onChange={(e) => handleChange(index, "quote", e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Testimonial
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default TestimonialsPanel;
