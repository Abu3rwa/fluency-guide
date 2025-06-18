import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { createQuiz } from "../services/lessonService";

const CreateQuizForm = ({ courseId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "quiz",
    courseId: courseId,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options[optionIndex] = value;
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    formData.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}`] = "Question is required";
      }

      question.options.forEach((option, optionIndex) => {
        if (!option.trim()) {
          newErrors[`option_${index}_${optionIndex}`] = "Option is required";
        }
      });

      if (!question.explanation.trim()) {
        newErrors[`explanation_${index}`] = "Explanation is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await createQuiz(formData);
      onSuccess();
    } catch (error) {
      setErrors({
        submit: error.message || "Failed to create quiz",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New Quiz
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Quiz Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
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
            error={!!errors.description}
            helperText={errors.description}
            required
          />
        </Grid>

        {formData.questions.map((question, questionIndex) => (
          <Grid item xs={12} key={questionIndex}>
            <Paper sx={{ p: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">
                  Question {questionIndex + 1}
                </Typography>
                {formData.questions.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <TextField
                fullWidth
                label="Question"
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(
                    questionIndex,
                    "question",
                    e.target.value
                  )
                }
                error={!!errors[`question_${questionIndex}`]}
                helperText={errors[`question_${questionIndex}`]}
                required
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      "correctAnswer",
                      e.target.value
                    )
                  }
                  label="Correct Answer"
                >
                  {question.options.map((_, index) => (
                    <MenuItem key={index} value={index}>
                      Option {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {question.options.map((option, optionIndex) => (
                <TextField
                  key={optionIndex}
                  fullWidth
                  label={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) =>
                    handleOptionChange(
                      questionIndex,
                      optionIndex,
                      e.target.value
                    )
                  }
                  error={!!errors[`option_${questionIndex}_${optionIndex}`]}
                  helperText={errors[`option_${questionIndex}_${optionIndex}`]}
                  required
                  sx={{ mb: 2 }}
                />
              ))}

              <TextField
                fullWidth
                label="Explanation"
                value={question.explanation}
                onChange={(e) =>
                  handleQuestionChange(
                    questionIndex,
                    "explanation",
                    e.target.value
                  )
                }
                multiline
                rows={2}
                error={!!errors[`explanation_${questionIndex}`]}
                helperText={errors[`explanation_${questionIndex}`]}
                required
              />
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button
            startIcon={<AddIcon />}
            onClick={addQuestion}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Add Question
          </Button>
        </Grid>

        {errors.submit && (
          <Grid item xs={12}>
            <FormHelperText error>{errors.submit}</FormHelperText>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateQuizForm;
