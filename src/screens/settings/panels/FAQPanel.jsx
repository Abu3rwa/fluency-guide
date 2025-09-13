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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useLandingPage } from "../../../contexts/LandingPageContext";

const FAQ_CATEGORIES = [
  "general",
  "courses",
  "pricing",
  "technical",
  "support",
  "other",
];

const FAQPanel = () => {
  const { faqs, setFaqs, reorderItems, saveFaqs } = useLandingPage();

  const handleMove = (index, direction) => {
    const newFaqs = reorderItems(faqs, index, direction);
    setFaqs(newFaqs);
  };

  const handleDelete = (index) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  const handleAdd = () => {
    setFaqs([
      ...faqs,
      {
        id: Date.now(),
        question: "",
        answer: "",
        category: "general",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index] = {
      ...newFaqs[index],
      [field]: value,
    };
    setFaqs(newFaqs);
  };

  const handleSave = async () => {
    try {
      console.log('=== FAQS PANEL DEBUG ===');
      console.log('FAQs to save:', faqs);
      console.log('FAQs type:', typeof faqs);
      console.log('FAQs length:', faqs.length);
      
      // Validate FAQs before saving
      const validFaqs = faqs.filter(f => 
        f && f.question && f.answer // Only save FAQs with question and answer
      );

      console.log('Valid FAQs after filtering:', validFaqs);

      const result = await saveFaqs(validFaqs);
      
      console.log('Save result:', result);
      
      if (result.success) {
        console.log('FAQs saved successfully');
      } else {
        console.error('Failed to save FAQs:', result.error);
      }
    } catch (error) {
      console.error('Error saving FAQs:', error);
    }
  };

  return (
    <Box>
      {faqs.map((faq, index) => (
        <Card key={faq.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1">FAQ {index + 1}</Typography>
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
                  disabled={index === faqs.length - 1}
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
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={faq.category}
                    label="Category"
                    onChange={(e) =>
                      handleChange(index, "category", e.target.value)
                    }
                  >
                    {FAQ_CATEGORIES.map((category) => (
                      <MenuItem
                        key={category}
                        value={category}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Question"
                  value={faq.question}
                  onChange={(e) =>
                    handleChange(index, "question", e.target.value)
                  }
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Answer"
                  value={faq.answer}
                  onChange={(e) =>
                    handleChange(index, "answer", e.target.value)
                  }
                  multiline
                  rows={5}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
          Add FAQ
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default FAQPanel;
