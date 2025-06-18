import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { getLesson, createQuiz } from "../services/lessonService";

const LessonDetailsScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: "",
    passingScore: "",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ],
  });

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const lessonData = await getLesson(lessonId);
      setLesson(lessonData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (field) => (event) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleQuestionChange = (index, field) => (event) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: event.target.value } : q
      ),
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex) => (event) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? event.target.value : opt
              ),
            }
          : q
      ),
    }));
  };

  const handleCorrectAnswerChange = (questionIndex) => (event) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? { ...q, correctAnswer: parseInt(event.target.value) }
          : q
      ),
    }));
  };

  const handleAddQuestion = () => {
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index) => () => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleCreateQuiz = async () => {
    try {
      const quizToCreate = {
        ...quizData,
        courseId,
        lessonId,
        type: "quiz",
        createdAt: new Date().toISOString(),
      };

      await createQuiz(quizToCreate);
      setShowQuizDialog(false);
      setQuizData({
        title: "",
        description: "",
        timeLimit: "",
        passingScore: "",
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
          },
        ],
      });
      // Refresh lesson data to show the new quiz
      fetchLesson();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Lesson Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              {lesson?.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {lesson?.description}
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Content
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {lesson?.content}
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Learning Objectives
              </Typography>
              <ul>
                {lesson?.objectives?.map((objective, index) => (
                  <li key={index}>
                    <Typography variant="body1">{objective}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resources
              </Typography>
              <ul>
                {lesson?.resources?.map((resource, index) => (
                  <li key={index}>
                    <Typography variant="body1">{resource}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          </Paper>
        </Grid>

        {/* Quiz Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Typography variant="h6">Quiz</Typography>
              <Button
                variant="contained"
                startIcon={<QuizIcon />}
                onClick={() => setShowQuizDialog(true)}
              >
                Create Quiz
              </Button>
            </Box>
            {lesson?.quiz ? (
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  {lesson.quiz.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time Limit: {lesson.quiz.timeLimit} minutes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Passing Score: {lesson.quiz.passingScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Questions: {lesson.quiz.questions.length}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No quiz available for this lesson
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quiz Creation Dialog */}
      <Dialog
        open={showQuizDialog}
        onClose={() => setShowQuizDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Quiz</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Quiz Title"
              value={quizData.title}
              onChange={handleQuizChange("title")}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={quizData.description}
              onChange={handleQuizChange("description")}
              multiline
              rows={2}
              required
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  type="number"
                  value={quizData.timeLimit}
                  onChange={handleQuizChange("timeLimit")}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Passing Score (%)"
                  type="number"
                  value={quizData.passingScore}
                  onChange={handleQuizChange("passingScore")}
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Questions
            </Typography>
            {quizData.questions.map((question, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1">
                    Question {index + 1}
                  </Typography>
                  <IconButton
                    onClick={handleRemoveQuestion(index)}
                    disabled={quizData.questions.length === 1}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  label="Question"
                  value={question.question}
                  onChange={handleQuestionChange(index, "question")}
                  required
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Options
                </Typography>
                {question.options.map((option, optionIndex) => (
                  <Box
                    key={optionIndex}
                    sx={{ display: "flex", gap: 1, mb: 1 }}
                  >
                    <TextField
                      fullWidth
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={handleOptionChange(index, optionIndex)}
                      required
                    />
                    <Button
                      variant={
                        question.correctAnswer === optionIndex
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() =>
                        handleCorrectAnswerChange(index)({
                          target: { value: optionIndex },
                        })
                      }
                      sx={{ minWidth: 100 }}
                    >
                      {question.correctAnswer === optionIndex
                        ? "Correct"
                        : "Mark Correct"}
                    </Button>
                  </Box>
                ))}
              </Paper>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
              sx={{ mt: 1 }}
            >
              Add Question
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuizDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateQuiz}
            disabled={!quizData.title || !quizData.description}
          >
            Create Quiz
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonDetailsScreen;
