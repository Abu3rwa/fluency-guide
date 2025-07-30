import React, { useState, useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import { createTask } from "../../../services/taskService";
import { useFormPersistence } from "../../../hooks/useFormPersistence";
import {
  DraftRecoveryNotification,
  AutoSaveStatus,
  StorageErrorNotification,
  DraftStatusSummary,
} from "../components/DraftNotifications";

const MultipleChoiceForm = ({ courseId, lessonId }) => {
  const { t } = useTranslation();

  // Initial form data structure - memoized to prevent re-creation
  const initialFormData = useMemo(
    () => ({
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
          id: Date.now().toString(),
          text: "",
          options: [
            { id: `${Date.now()}-1`, text: "", isCorrect: false },
            { id: `${Date.now()}-2`, text: "", isCorrect: false },
            { id: `${Date.now()}-3`, text: "", isCorrect: false },
            { id: `${Date.now()}-4`, text: "", isCorrect: false },
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
  } = useFormPersistence(
    "multipleChoice",
    courseId,
    lessonId,
    initialFormData,
    {
      onDraftLoaded: (data, timestamp) => {
        console.log("Draft loaded:", {
          timestamp,
          questionCount: data.questions?.length,
        });
      },
      onAutoSave: (data, timestamp) => {
        console.log("Auto-saved:", {
          timestamp,
          questionCount: data.questions?.length,
        });
      },
      onError: (error, context) => {
        console.error("Persistence error:", { error: error.message, context });
      },
    }
  );

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

    updateFormData((prev) => ({
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

    updateFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    const questionId = Date.now().toString();
    const newQuestion = {
      id: questionId,
      text: "",
      options: [
        { id: `${questionId}-1`, text: "", isCorrect: false },
        { id: `${questionId}-2`, text: "", isCorrect: false },
        { id: `${questionId}-3`, text: "", isCorrect: false },
      ],
      explanation: "",
      points: formData.pointsPerQuestion,
      multipleCorrect: false,
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

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    const questionId = updatedQuestions[questionIndex].id;
    const newOption = {
      id: `${questionId}-${Date.now()}`,
      text: "",
      isCorrect: false,
    };
    updatedQuestions[questionIndex].options.push(newOption);
    updateFormData((prev) => ({
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
      updateFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation - allow publishing even with incomplete questions if isPublished is true
    const hasInvalidQuestions = formData.questions.some(
      (q) =>
        !q.text.trim() ||
        q.options.some((opt) => !opt.text.trim()) ||
        !q.options.some((opt) => opt.isCorrect)
    );

    if (hasInvalidQuestions && !formData.isPublished) {
      setError(t("tasks.form.validationError"));
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use the taskService to create the task in Firebase
      const createdTask = await createTask(courseId, lessonId, submitData);

      console.log("Task created successfully:", createdTask);
      setSuccess(t("tasks.form.createSuccess"));

      // Clean up drafts after successful submission
      cleanupAfterSubmission();
    } catch (err) {
      setError(t("tasks.form.createError"));
      console.error("Error creating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary">
        {t("tasks.form.createMultipleChoiceQuiz")}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        {t("tasks.form.description")}
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
          {t("tasks.form.basicInformation")}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label={t("tasks.form.title")}
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t("tasks.form.difficulty")}</InputLabel>
              <Select
                label={t("tasks.form.difficulty")}
                value={formData.difficulty}
                onChange={(e) =>
                  handleInputChange("difficulty", e.target.value)
                }
              >
                <MenuItem value="easy">{t("tasks.form.easy")}</MenuItem>
                <MenuItem value="medium">{t("tasks.form.medium")}</MenuItem>
                <MenuItem value="hard">{t("tasks.form.hard")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("tasks.form.instructions")}
              value={formData.instructions}
              onChange={(e) =>
                handleInputChange("instructions", e.target.value)
              }
              fullWidth
              multiline
              minRows={2}
              placeholder={t("tasks.form.instructionsPlaceholder")}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          {t("tasks.form.quizSettings")}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label={t("tasks.form.timeLimit")}
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
              label={t("tasks.form.passingScore")}
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
              label={t("tasks.form.attemptsAllowed")}
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
                    ? t("tasks.form.showFeedback")
                    : key === "randomizeQuestions"
                    ? t("tasks.form.randomizeQuestions")
                    : key === "showCorrectAnswers"
                    ? t("tasks.form.showCorrectAnswers")
                    : t("tasks.form.allowReview")
                }
              />
            ))}
          </FormGroup>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          {t("tasks.form.tags")}
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
            label={t("tasks.form.addTag")}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag())
            }
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={addTag}>
            {t("tasks.form.add")}
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
            <Typography variant="h6">{t("tasks.form.questions")}</Typography>
            <AutoSaveStatus status={autoSaveStatus} />
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview
                ? t("tasks.form.hideAnswers")
                : t("tasks.form.showAnswers")}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Plus size={16} />}
              onClick={addQuestion}
            >
              {t("tasks.form.addQuestion")}
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" flexDirection="column" gap={3}>
          {formData.questions.map((question, questionIndex) => {
            // Check if question is complete
            const isQuestionComplete =
              question.text.trim() &&
              question.options.every((opt) => opt.text.trim()) &&
              question.options.some((opt) => opt.isCorrect);

            return (
              <Paper
                key={questionIndex}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: isQuestionComplete
                    ? "success.50"
                    : "background.paper",
                  borderColor: isQuestionComplete ? "success.main" : "divider",
                  borderWidth: isQuestionComplete ? 2 : 1,
                  position: "relative",
                  "&::before": isQuestionComplete
                    ? {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: "success.main",
                        borderRadius: "4px 4px 0 0",
                      }
                    : {},
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">
                      {t("tasks.form.question")} {questionIndex + 1}
                    </Typography>
                    {isQuestionComplete && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          bgcolor: "success.main",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <Check size={12} />
                        Complete
                      </Box>
                    )}
                  </Box>
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
                      label={t("tasks.form.questionText")}
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
                      placeholder={t("tasks.form.questionPlaceholder")}
                      inputProps={{ dir: "auto" }}
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
                      label={t("tasks.form.allowMultipleCorrect")}
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
                        {t("tasks.form.answerOptions")}
                      </Typography>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => addOption(questionIndex)}
                      >
                        + {t("tasks.form.addOption")}
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
                              placeholder={`${t(
                                "tasks.form.option"
                              )} ${String.fromCharCode(65 + optionIndex)}`}
                              size="small"
                              fullWidth
                              inputProps={{ dir: "auto" }}
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
                        ? t("tasks.form.checkAllCorrect")
                        : t("tasks.form.selectOneCorrect")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <TextField
                      label={`${t("tasks.form.explanation")} (Question ${
                        questionIndex + 1
                      })`}
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
                      placeholder={t("tasks.form.explanationPlaceholder")}
                    />
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>
        {/* Preview */}
        {formData.questions.some((q) => q.text) && (
          <Box mt={4} p={2} bgcolor="blue.50" borderRadius={2}>
            <Typography variant="subtitle1" mb={2}>
              {t("tasks.form.preview")}
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
                      {t("tasks.form.question")} {index + 1}
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
                        <strong>{t("tasks.form.explanation")}:</strong>{" "}
                        {question.explanation}
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
          {t("tasks.form.scoringAndMetadata")}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label={t("tasks.form.pointsPerQuestion")}
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
              label={t("tasks.form.totalPoints")}
              type="number"
              value={formData.totalPoints}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label={t("tasks.form.courseId")}
              value={formData.courseId}
              onChange={(e) => handleInputChange("courseId", e.target.value)}
              fullWidth
              placeholder={t("tasks.form.optional")}
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
          label={t("tasks.form.publishImmediately")}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save size={18} />}
          onClick={handleSubmit}
          disabled={
            loading ||
            !formData.title ||
            (!formData.isPublished &&
              formData.questions.some(
                (q) => !q.text || !q.options.some((opt) => opt.isCorrect)
              ))
          }
          size="large"
        >
          {loading ? t("tasks.form.creating") : t("tasks.form.createQuiz")}
        </Button>
      </Box>
    </Box>
  );
};

export default MultipleChoiceForm;
