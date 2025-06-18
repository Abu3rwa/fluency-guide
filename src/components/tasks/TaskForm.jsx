import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

const TaskForm = ({ onClose, onSubmit, task }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    type: "multipleChoice",
    questions: [],
    timeLimit: 0,
    passingScore: 70,
    attemptsAllowed: 1,
    difficulty: "medium",
    tags: [],
    isPublished: false,
    showFeedback: true,
    randomizeQuestions: false,
    showCorrectAnswers: true,
    allowReview: true,
    pointsPerQuestion: 1,
    totalPoints: 0,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        instructions: task.instructions || "",
        type: task.type || "multipleChoice",
        questions: task.questions || [],
        timeLimit: task.timeLimit || 0,
        passingScore: task.passingScore || 70,
        attemptsAllowed: task.attemptsAllowed || 1,
        difficulty: task.difficulty || "medium",
        tags: task.tags || [],
        isPublished: task.isPublished || false,
        showFeedback: task.showFeedback ?? true,
        randomizeQuestions: task.randomizeQuestions || false,
        showCorrectAnswers: task.showCorrectAnswers ?? true,
        allowReview: task.allowReview ?? true,
        pointsPerQuestion: task.pointsPerQuestion || 1,
        totalPoints: task.totalPoints || 0,
      });
    }
  }, [task]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalPoints: prev.questions.length * prev.pointsPerQuestion,
    }));
  }, [formData.questions.length, formData.pointsPerQuestion]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If task type is changing, reset questions
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        questions: [], // Reset questions array
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTagAdd = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete),
    }));
  };

  const addQuestion = () => {
    setFormData((prev) => {
      const newQuestion = {
        text: "",
        points: 1,
        explanation: "",
      };

      switch (prev.type) {
        case "multipleChoice":
          newQuestion.options = ["", "", ""];
          newQuestion.correctAnswer = 0;
          break;
        case "trueFalse":
          newQuestion.correctAnswer = true;
          break;
        case "fillInBlanks":
          newQuestion.text = "Enter text with _____ for blanks";
          newQuestion.answers = [];
          break;
        case "shortAnswer":
          newQuestion.expectedAnswer = "";
          newQuestion.wordLimit = 50;
          break;
        default:
          break;
      }

      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
      };
    });
  };

  const removeQuestion = (questionIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== questionIndex),
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        [field]: value,
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const renderQuestionFields = (question, questionIndex) => {
    switch (formData.type) {
      case "multipleChoice":
        return (
          <Box>
            <TextField
              fullWidth
              label="Question Text"
              value={question.text}
              onChange={(e) =>
                handleQuestionChange(questionIndex, "text", e.target.value)
              }
              sx={{ mb: 2 }}
            />
            {question.options.map((option, optionIndex) => (
              <Box
                key={optionIndex}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <TextField
                  fullWidth
                  label={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[optionIndex] = e.target.value;
                    handleQuestionChange(questionIndex, "options", newOptions);
                  }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={question.correctAnswer === optionIndex}
                      onChange={() =>
                        handleQuestionChange(
                          questionIndex,
                          "correctAnswer",
                          optionIndex
                        )
                      }
                    />
                  }
                  label="Correct"
                  sx={{ ml: 2 }}
                />
              </Box>
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
              sx={{ mt: 2 }}
            />
          </Box>
        );

      case "trueFalse":
        return (
          <Box>
            <TextField
              fullWidth
              label="Question Text"
              value={question.text}
              onChange={(e) =>
                handleQuestionChange(questionIndex, "text", e.target.value)
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(
                      questionIndex,
                      "correctAnswer",
                      e.target.checked
                    )
                  }
                />
              }
              label={question.correctAnswer ? "True" : "False"}
            />
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
              sx={{ mt: 2 }}
            />
          </Box>
        );

      case "fillInBlanks":
        return (
          <Box>
            <TextField
              fullWidth
              label="Text with Blanks"
              value={question.text}
              onChange={(e) =>
                handleQuestionChange(questionIndex, "text", e.target.value)
              }
              helperText="Use _____ for blanks"
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Answers for Blanks:
            </Typography>
            {question.text.split("_____").length > 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Array.from({
                  length: question.text.split("_____").length - 1,
                }).map((_, blankIndex) => (
                  <TextField
                    key={blankIndex}
                    label={`Blank ${blankIndex + 1}`}
                    value={question.answers[blankIndex] || ""}
                    onChange={(e) => {
                      const newAnswers = [...(question.answers || [])];
                      newAnswers[blankIndex] = e.target.value;
                      handleQuestionChange(
                        questionIndex,
                        "answers",
                        newAnswers
                      );
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        );

      case "shortAnswer":
        return (
          <Box>
            <TextField
              fullWidth
              label="Question"
              value={question.text}
              onChange={(e) =>
                handleQuestionChange(questionIndex, "text", e.target.value)
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Expected Answer"
              value={question.expectedAnswer}
              onChange={(e) =>
                handleQuestionChange(
                  questionIndex,
                  "expectedAnswer",
                  e.target.value
                )
              }
              sx={{ mb: 2 }}
            />
            <TextField
              type="number"
              label="Word Limit"
              value={question.wordLimit}
              onChange={(e) =>
                handleQuestionChange(
                  questionIndex,
                  "wordLimit",
                  parseInt(e.target.value)
                )
              }
              sx={{ mb: 2 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const taskData = {
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: formData.isPublished ? "published" : "draft",
      metadata: {
        totalQuestions: formData.questions.length,
        averageDifficulty: formData.difficulty,
        estimatedTime: formData.timeLimit,
      },
    };

    onSubmit(taskData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("tasks.title")}
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t("tasks.instructions")}
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t("tasks.questionType")}</InputLabel>
            <Select
              value={formData.type}
              onChange={handleChange}
              name="type"
              label={t("tasks.questionType")}
            >
              <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
              <MenuItem value="trueFalse">True/False</MenuItem>
              <MenuItem value="fillInBlanks">Fill in the Blanks</MenuItem>
              <MenuItem value="shortAnswer">Short Answer</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t("tasks.difficulty")}</InputLabel>
            <Select
              value={formData.difficulty}
              onChange={handleChange}
              name="difficulty"
              label={t("tasks.difficulty")}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label={t("tasks.timeLimit")}
            name="timeLimit"
            value={formData.timeLimit}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
            helperText="Minutes (0 for no limit)"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label={t("tasks.passingScore")}
            name="passingScore"
            value={formData.passingScore}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            helperText="Percentage required to pass"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label={t("tasks.attemptsAllowed")}
            name="attemptsAllowed"
            value={formData.attemptsAllowed}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("tasks.tags")}
            placeholder="Add tags (press Enter)"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTagAdd(e.target.value);
                e.target.value = "";
              }
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {formData.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleTagDelete(tag)}
              />
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "isPublished", value: e.target.checked },
                    })
                  }
                />
              }
              label={t("tasks.publish")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.showFeedback}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "showFeedback", value: e.target.checked },
                    })
                  }
                />
              }
              label={t("tasks.showFeedback")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.randomizeQuestions}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "randomizeQuestions",
                        value: e.target.checked,
                      },
                    })
                  }
                />
              }
              label={t("tasks.randomizeQuestions")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.showCorrectAnswers}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "showCorrectAnswers",
                        value: e.target.checked,
                      },
                    })
                  }
                />
              }
              label={t("tasks.showCorrectAnswers")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowReview}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "allowReview", value: e.target.checked },
                    })
                  }
                />
              }
              label={t("tasks.allowReview")}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("tasks.questions")} ({formData.questions.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Total Points: {formData.totalPoints}
          </Typography>
          <List>
            {formData.questions.map((question, questionIndex) => (
              <ListItem
                key={questionIndex}
                sx={{
                  flexDirection: "column",
                  alignItems: "stretch",
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Question {questionIndex + 1}
                      </Typography>
                      {renderQuestionFields(question, questionIndex)}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Button
            startIcon={<AddIcon />}
            onClick={addQuestion}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            {t("tasks.addQuestion")}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button onClick={onClose} variant="outlined">
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {task ? t("common.update") : t("common.create")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskForm;
