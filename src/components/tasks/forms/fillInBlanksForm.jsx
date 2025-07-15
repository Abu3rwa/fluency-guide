import React, { useState } from "react";
import { Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { createTask } from "../../../services/taskService";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  FormGroup,
  FormControl,
  InputLabel,
} from "@mui/material";

const FillInBlanksForm = ({ courseId, lessonId }) => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    instructions: "",
    type: "fillInBlanks",
    timeLimit: 30,
    passingScore: 70,
    attemptsAllowed: 3,
    difficulty: "medium",
    tags: [],
    isPublished: false,
    showFeedback: true,
    randomizeQuestions: false,
    showCorrectAnswers: true,
    allowReview: true,
    pointsPerQuestion: 10,
    totalPoints: 0,
    questions: [
      {
        id: "1",
        text: "",
        blanks: [{ id: "1", answer: "", position: 0 }],
        explanation: "",
        points: 10,
      },
    ],
    lessonId: lessonId,
    courseId: courseId,
    status: "draft",
    metadata: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "pointsPerQuestion" && {
        totalPoints: value * prev.questions.length,
      }),
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
      totalPoints: prev.pointsPerQuestion * updatedQuestions.length,
    }));
  };

  const handleBlankChange = (questionIndex, blankIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].blanks[blankIndex] = {
      ...updatedQuestions[questionIndex].blanks[blankIndex],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: "",
      blanks: [{ id: Date.now().toString(), answer: "", position: 0 }],
      explanation: "",
      points: formData.pointsPerQuestion,
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.pointsPerQuestion * (prev.questions.length + 1),
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
        totalPoints: prev.pointsPerQuestion * updatedQuestions.length,
      }));
    }
  };

  const addBlank = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    const newBlank = {
      id: Date.now().toString(),
      answer: "",
      position: updatedQuestions[questionIndex].blanks.length,
    };
    updatedQuestions[questionIndex].blanks.push(newBlank);
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const removeBlank = (questionIndex, blankIndex) => {
    if (formData.questions[questionIndex].blanks.length > 1) {
      const updatedQuestions = [...formData.questions];
      updatedQuestions[questionIndex].blanks = updatedQuestions[
        questionIndex
      ].blanks.filter((_, i) => i !== blankIndex);
      setFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const submitData = {
        ...formData,
        id: formData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use the taskService to create the task in Firebase
      const createdTask = await createTask(courseId, lessonId, submitData);

      console.log("Task created successfully:", createdTask);
      setSuccess("Task created successfully!");
      // Optionally reset form here
      // setFormData(initialFormData);
    } catch (err) {
      setError("Failed to create task. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary">
        Create Fill-in-the-Blank Task
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Design interactive tasks with customizable blanks
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Basic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Title *"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                label="Difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  handleInputChange("difficulty", e.target.value)
                }
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Instructions"
              value={formData.instructions}
              onChange={(e) =>
                handleInputChange("instructions", e.target.value)
              }
              fullWidth
              multiline
              minRows={2}
              placeholder="Provide instructions for completing this task..."
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Task Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Time Limit (minutes)"
              type="number"
              value={formData.timeLimit}
              onChange={(e) =>
                handleInputChange("timeLimit", parseInt(e.target.value))
              }
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Passing Score (%)"
              type="number"
              value={formData.passingScore}
              onChange={(e) =>
                handleInputChange("passingScore", parseInt(e.target.value))
              }
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Attempts Allowed"
              type="number"
              value={formData.attemptsAllowed}
              onChange={(e) =>
                handleInputChange("attemptsAllowed", parseInt(e.target.value))
              }
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
        <Box mt={2}>
          <FormGroup row>
            {[
              "showFeedback",
              "randomizeQuestions",
              "showCorrectAnswers",
              "allowReview",
            ].map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={formData[key]}
                    onChange={(e) => handleInputChange(key, e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  key === "showFeedback"
                    ? "Show Feedback"
                    : key === "randomizeQuestions"
                    ? "Randomize Questions"
                    : key === "showCorrectAnswers"
                    ? "Show Correct Answers"
                    : "Allow Review"
                }
              />
            ))}
          </FormGroup>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Tags
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {formData.tags.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              onDelete={() => removeTag(tag)}
              color="primary"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            label="Add a tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={addTag}>
            Add
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Questions</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Hide Answers" : "Show Answers"}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Plus size={16} />}
              onClick={addQuestion}
            >
              Add Question
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" flexDirection="column" gap={3}>
          {formData.questions.map((question, questionIndex) => (
            <Paper
              key={question.id}
              variant="outlined"
              sx={{ p: 2, bgcolor: "background.paper" }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1">
                  Question {questionIndex + 1}
                </Typography>
                {formData.questions.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Question Text *"
                    value={question.text}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "text",
                        e.target.value
                      )
                    }
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="The capital of France is [blank1] and it's located in [blank2]."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      Blank Answers
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => addBlank(questionIndex)}
                    >
                      + Add Blank
                    </Button>
                  </Box>
                  <Grid container spacing={1}>
                    {question.blanks.map((blank, blankIndex) => (
                      <Grid item xs={12} md={6} key={blank.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TextField
                            value={blank.answer}
                            onChange={(e) =>
                              handleBlankChange(
                                questionIndex,
                                blankIndex,
                                "answer",
                                e.target.value
                              )
                            }
                            placeholder={`Answer for blank ${blankIndex + 1}`}
                            size="small"
                            fullWidth
                          />
                          {question.blanks.length > 1 && (
                            <IconButton
                              color="error"
                              onClick={() =>
                                removeBlank(questionIndex, blankIndex)
                              }
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Explanation (Optional)"
                    value={question.explanation}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "explanation",
                        e.target.value
                      )
                    }
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="Explain why this is the correct answer..."
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
        {/* Preview */}
        {formData.questions.some((q) => q.text) && (
          <Box mt={4} p={2} bgcolor="blue.50" borderRadius={2}>
            <Typography variant="subtitle1" mb={2}>
              Preview
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {formData.questions
                .filter((q) => q.text)
                .map((question, index) => {
                  const textParts = question.text.split(/(\[blank\d*\])/g);
                  let blankIndex = 0;
                  return (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{ p: 2, bgcolor: "background.default" }}
                    >
                      <Typography variant="subtitle2" mb={1}>
                        Question {index + 1}
                      </Typography>
                      <Typography variant="body1" mb={1}>
                        {textParts.map((part, i) => {
                          if (part.match(/\[blank\d*\]/)) {
                            const blank = question.blanks[blankIndex];
                            blankIndex++;
                            return (
                              <Box
                                key={i}
                                component="span"
                                sx={{
                                  borderBottom: 2,
                                  borderColor: "primary.main",
                                  minWidth: 40,
                                  px: 1,
                                  mx: 0.5,
                                  bgcolor: "background.paper",
                                }}
                              >
                                {showPreview ? blank?.answer || "____" : "____"}
                              </Box>
                            );
                          }
                          return part;
                        })}
                      </Typography>
                      {question.explanation && (
                        <Typography variant="caption" color="info.main" mt={1}>
                          <strong>Explanation:</strong> {question.explanation}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
            </Box>
          </Box>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Scoring & Metadata
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Points per Question"
              type="number"
              value={formData.pointsPerQuestion}
              onChange={(e) =>
                handleInputChange("pointsPerQuestion", parseInt(e.target.value))
              }
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Total Points"
              type="number"
              value={formData.totalPoints}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Course ID"
              value={formData.courseId}
              onChange={(e) => handleInputChange("courseId", e.target.value)}
              fullWidth
              placeholder="Optional"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        pt={3}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isPublished}
              onChange={(e) =>
                handleInputChange("isPublished", e.target.checked)
              }
              color="primary"
            />
          }
          label="Publish immediately"
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save size={18} />}
          onClick={handleSubmit}
          disabled={
            loading ||
            !formData.title ||
            formData.questions.some((q) => !q.text)
          }
          size="large"
        >
          {loading ? "Creating..." : "Create Task"}
        </Button>
      </Box>
    </Box>
  );
};

export default FillInBlanksForm;
