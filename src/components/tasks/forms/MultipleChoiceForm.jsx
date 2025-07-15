import React, { useState } from "react";
import { Plus, Trash2, Save, Eye, EyeOff, Check } from "lucide-react";
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
  Radio,
  FormGroup,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { createTask } from "../../../services/taskService";

const MultipleChoiceForm = ({ courseId, lessonId }) => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    instructions: "",
    type: "multipleChoice",
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
        options: [
          { id: "1", text: "", isCorrect: false },
          { id: "2", text: "", isCorrect: false },
          { id: "3", text: "", isCorrect: false },
          { id: "4", text: "", isCorrect: false },
        ],
        explanation: "",
        points: 10,
        multipleCorrect: false,
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

    // If changing to single correct, ensure only one option is correct
    if (field === "multipleCorrect" && !value) {
      const firstCorrectIndex = updatedQuestions[
        questionIndex
      ].options.findIndex((opt) => opt.isCorrect);
      updatedQuestions[questionIndex].options = updatedQuestions[
        questionIndex
      ].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === firstCorrectIndex,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
      totalPoints: prev.pointsPerQuestion * updatedQuestions.length,
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];

    if (field === "isCorrect") {
      if (!question.multipleCorrect) {
        // Single correct answer - uncheck all others
        question.options = question.options.map((opt, idx) => ({
          ...opt,
          isCorrect: idx === optionIndex ? value : false,
        }));
      } else {
        // Multiple correct answers allowed
        question.options[optionIndex].isCorrect = value;
      }
    } else {
      question.options[optionIndex][field] = value;
    }

    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: "",
      options: [
        { id: Date.now().toString() + "-1", text: "", isCorrect: false },
        { id: Date.now().toString() + "-2", text: "", isCorrect: false },
        { id: Date.now().toString() + "-3", text: "", isCorrect: false },
      ],
      explanation: "",
      points: formData.pointsPerQuestion,
      multipleCorrect: false,
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

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    const newOption = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
    };
    updatedQuestions[questionIndex].options.push(newOption);
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    if (formData.questions[questionIndex].options.length > 2) {
      const updatedQuestions = [...formData.questions];
      updatedQuestions[questionIndex].options = updatedQuestions[
        questionIndex
      ].options.filter((_, i) => i !== optionIndex);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    const hasInvalidQuestions = formData.questions.some(
      (q) =>
        !q.text.trim() ||
        q.options.some((opt) => !opt.text.trim()) ||
        !q.options.some((opt) => opt.isCorrect)
    );

    if (hasInvalidQuestions) {
      setError(
        "Please fill in all questions, options, and mark at least one correct answer for each question."
      );
      setLoading(false);
      return;
    }

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
      setSuccess("Multiple choice quiz created successfully!");

      // Optionally reset form or redirect
      // setFormData(initialFormData);
    } catch (err) {
      setError("Failed to create quiz. Please try again.");
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary">
        Create Multiple Choice Quiz
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Design interactive multiple choice quizzes with single or multiple
        correct answers
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
              placeholder="Choose the best answer for each question..."
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Quiz Settings
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
                    placeholder="Enter your question here..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={question.multipleCorrect}
                        onChange={(e) =>
                          handleQuestionChange(
                            questionIndex,
                            "multipleCorrect",
                            e.target.checked
                          )
                        }
                        color="primary"
                      />
                    }
                    label="Allow multiple correct answers"
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
                      Answer Options *
                    </Typography>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => addOption(questionIndex)}
                    >
                      + Add Option
                    </Button>
                  </Box>
                  <Grid container spacing={1}>
                    {question.options.map((option, optionIndex) => (
                      <Grid item xs={12} md={6} key={option.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {question.multipleCorrect ? (
                            <Checkbox
                              checked={option.isCorrect}
                              onChange={(e) =>
                                handleOptionChange(
                                  questionIndex,
                                  optionIndex,
                                  "isCorrect",
                                  e.target.checked
                                )
                              }
                              color="success"
                            />
                          ) : (
                            <Radio
                              checked={option.isCorrect}
                              onChange={(e) =>
                                handleOptionChange(
                                  questionIndex,
                                  optionIndex,
                                  "isCorrect",
                                  e.target.checked
                                )
                              }
                              color="success"
                              name={`question-${questionIndex}`}
                            />
                          )}
                          <TextField
                            value={option.text}
                            onChange={(e) =>
                              handleOptionChange(
                                questionIndex,
                                optionIndex,
                                "text",
                                e.target.value
                              )
                            }
                            placeholder={`Option ${String.fromCharCode(
                              65 + optionIndex
                            )}`}
                            size="small"
                            fullWidth
                          />
                          {question.options.length > 2 && (
                            <IconButton
                              color="error"
                              onClick={() =>
                                removeOption(questionIndex, optionIndex)
                              }
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="caption" color="text.secondary" mt={1}>
                    {question.multipleCorrect
                      ? "Check all correct answers"
                      : "Select the one correct answer"}
                  </Typography>
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
                .map((question, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 2, bgcolor: "background.default" }}
                  >
                    <Typography variant="subtitle2" mb={1}>
                      Question {index + 1}
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {question.text}
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {question.options.map((option, optionIndex) => (
                        <Box
                          key={optionIndex}
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          {showPreview && option.isCorrect ? (
                            <Check size={16} style={{ color: "#4CAF50" }} />
                          ) : (
                            <Box
                              width={16}
                              height={16}
                              borderRadius={8}
                              border={1}
                              borderColor="grey.400"
                            />
                          )}
                          <Typography
                            variant="body2"
                            color={
                              showPreview && option.isCorrect
                                ? "success.main"
                                : "text.primary"
                            }
                          >
                            {String.fromCharCode(65 + optionIndex)}.{" "}
                            {option.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    {question.explanation && (
                      <Typography variant="caption" color="info.main" mt={1}>
                        <strong>Explanation:</strong> {question.explanation}
                      </Typography>
                    )}
                  </Paper>
                ))}
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
            formData.questions.some(
              (q) => !q.text || !q.options.some((opt) => opt.isCorrect)
            )
          }
          size="large"
        >
          {loading ? "Creating..." : "Create Quiz"}
        </Button>
      </Box>
    </Box>
  );
};

export default MultipleChoiceForm;
