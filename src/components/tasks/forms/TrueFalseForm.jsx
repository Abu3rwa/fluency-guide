import React, { useState, useMemo } from "react";
import { Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";
import { createTask } from "../../../services/taskService";
import { useFormPersistence } from "../../../hooks/useFormPersistence";
import {
  DraftRecoveryNotification,
  AutoSaveStatus,
  StorageErrorNotification,
  DraftStatusSummary,
} from "../components/DraftNotifications";
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
  Radio,
  RadioGroup,
} from "@mui/material";

const TrueFalseForm = ({ courseId, lessonId }) => {
  // Initial form data structure - memoized to prevent re-creation
  const initialFormData = useMemo(
    () => ({
      title: "",
      instructions: "",
      type: "trueFalse",
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
          id: Date.now().toString(),
          text: "",
          correctAnswer: true,
          explanation: "",
          points: 10,
        },
      ],
      lessonId: lessonId,
      courseId: courseId,
      status: "draft",
      metadata: {},
    }),
    [courseId, lessonId]
  );

  // Use persistence hook
  const {
    formData,
    updateFormData,
    isInitialized,
    draftLoaded,
    autoSaveStatus,
    hasUnsavedChanges,
    validationStatus,
    saveManually,
    clearDraft,
    cleanupAfterSubmission,
    dismissRecoveryNotification,
    recoveryNotification,
    storageError,
  } = useFormPersistence("trueFalse", courseId, lessonId, initialFormData, {
    onDraftLoaded: (data, timestamp) => {
      console.log("True/False draft loaded:", {
        timestamp,
        questionCount: data.questions?.length,
      });
    },
    onAutoSave: (data, timestamp) => {
      console.log("True/False auto-saved:", {
        timestamp,
        questionCount: data.questions?.length,
      });
    },
    onError: (error, context) => {
      console.error("True/False persistence error:", {
        error: error.message,
        context,
      });
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field, value) => {
    updateFormData((prev) => ({
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
    updateFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
      totalPoints: prev.pointsPerQuestion * updatedQuestions.length,
    }));
  };

  const addQuestion = () => {
    const questionId = Date.now().toString();
    const newQuestion = {
      id: questionId,
      text: "",
      correctAnswer: true,
      explanation: "",
      points: formData.pointsPerQuestion,
    };
    updateFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.pointsPerQuestion * (prev.questions.length + 1),
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      updateFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
        totalPoints: prev.pointsPerQuestion * updatedQuestions.length,
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    updateFormData((prev) => ({
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use the taskService to create the task in Firebase
      const createdTask = await createTask(courseId, lessonId, submitData);

      console.log("Task created successfully:", createdTask);
      setSuccess("Task created successfully!");

      // Clean up drafts after successful submission
      cleanupAfterSubmission();
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
        Create True/False Task
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Design interactive true or false questions for your students
      </Typography>

      {/* Draft Recovery Notification */}
      <DraftRecoveryNotification
        notification={recoveryNotification}
        onRestore={() => {
          // Data is already loaded by the hook
          dismissRecoveryNotification();
        }}
        onDismiss={() => {
          clearDraft();
          dismissRecoveryNotification();
        }}
        onClose={dismissRecoveryNotification}
      />

      {/* Storage Error Notification */}
      <StorageErrorNotification
        error={storageError}
        onClose={() => {
          // Clear storage error - this would need to be implemented in the context
        }}
      />

      {/* Draft Status Summary */}
      {isInitialized && (draftLoaded || hasUnsavedChanges) && (
        <DraftStatusSummary
          autoSaveStatus={autoSaveStatus}
          hasUnsavedChanges={hasUnsavedChanges}
          validationStatus={validationStatus}
          onManualSave={saveManually}
          onClearDraft={clearDraft}
        />
      )}

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
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Questions</Typography>
            <AutoSaveStatus status={autoSaveStatus} />
          </Box>
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
                    label="Question Statement *"
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
                    placeholder="Enter your true/false statement here..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight={500} mb={1}>
                    Correct Answer *
                  </Typography>
                  <RadioGroup
                    row
                    value={question.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "correctAnswer",
                        e.target.value === "true"
                      )
                    }
                  >
                    <FormControlLabel
                      value={true}
                      control={<Radio color="success" />}
                      label="True"
                    />
                    <FormControlLabel
                      value={false}
                      control={<Radio color="error" />}
                      label="False"
                    />
                  </RadioGroup>
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
                    placeholder="Explain why this statement is true or false..."
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
                    <Typography variant="body1" mb={2}>
                      {question.text}
                    </Typography>
                    <Box display="flex" gap={2} mb={2}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          border: 1,
                          borderColor:
                            showPreview && question.correctAnswer
                              ? "success.main"
                              : "grey.300",
                          bgcolor:
                            showPreview && question.correctAnswer
                              ? "success.50"
                              : "background.paper",
                          cursor: "default",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={
                            showPreview && question.correctAnswer ? 600 : 400
                          }
                        >
                          True
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          border: 1,
                          borderColor:
                            showPreview && !question.correctAnswer
                              ? "success.main"
                              : "grey.300",
                          bgcolor:
                            showPreview && !question.correctAnswer
                              ? "success.50"
                              : "background.paper",
                          cursor: "default",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={
                            showPreview && !question.correctAnswer ? 600 : 400
                          }
                        >
                          False
                        </Typography>
                      </Box>
                    </Box>
                    {showPreview && (
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: "info.50",
                          border: 1,
                          borderColor: "info.200",
                        }}
                      >
                        <Typography variant="caption" color="info.main">
                          <strong>Correct Answer:</strong>{" "}
                          {question.correctAnswer ? "True" : "False"}
                        </Typography>
                      </Box>
                    )}
                    {question.explanation && (
                      <Typography
                        variant="caption"
                        color="info.main"
                        mt={1}
                        display="block"
                      >
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

export default TrueFalseForm;
