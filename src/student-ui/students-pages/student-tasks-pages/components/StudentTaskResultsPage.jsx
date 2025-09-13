import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import InfoIcon from "@mui/icons-material/Info";
import SchoolIcon from "@mui/icons-material/School";
import ReplayIcon from "@mui/icons-material/Replay";
import HomeIcon from "@mui/icons-material/Home";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const StudentTaskResultsPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { taskId } = useParams();

  const resultsData = location.state;

  if (!resultsData) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error" gutterBottom>
          {t("results.noDataTitle") || "Results Not Available"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t("results.noDataMessage") ||
            "No results data found. Please complete the task first."}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          {t("common.back") || "Go Back"}
        </Button>
      </Container>
    );
  }

  const {
    score,
    totalPoints,
    task,
    timeSpent,
    questionsAnswered,
  } = resultsData;
  const totalQuestions = task?.questions?.length;
  
  // Calculate actual total points from task structure
  const actualTotalPoints = task?.totalPoints || 
    task?.questions?.reduce((sum, question) => sum + (question.points || task?.pointsPerQuestion || 1), 0) || 
    totalPoints;
  
  // Use the actual total points for calculations
  const effectiveTotalPoints = actualTotalPoints || totalPoints;
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Task Results Debug:', {
      task: task,
      score: score,
      totalPoints: totalPoints,
      actualTotalPoints: actualTotalPoints,
      effectiveTotalPoints: effectiveTotalPoints,
      questionsAnswered: questionsAnswered,
      totalQuestions: totalQuestions,
      timeSpent: timeSpent
    });
  }

  const handleRestart = () => {
    const taskType = task?.type;
    switch (taskType) {
      case "multipleChoice":
        navigate(`/student/tasks/multiple-choice/${taskId}`);
        break;
      case "trueFalse":
        navigate(`/student/tasks/true-false/${taskId}`);
        break;
      case "fillInBlanks":
        navigate(`/student/tasks/fill-in-blanks/${taskId}`);
        break;
      default:
        navigate(`/student/tasks/${taskId}`);
        break;
    }
  };

  const handleFinish = () => {
    navigate("/student/courses");
  };

  // Ensure we have valid data first
  const safeScore = score || 0;
  const safeTotalPoints = effectiveTotalPoints || 1;
  const safeQuestionsAnswered = questionsAnswered || totalQuestions || 0;
  const safeTotalQuestions = totalQuestions || 0;

  const percentage = safeTotalQuestions > 0 
    ? Math.round((safeScore / safeTotalQuestions) * 100) 
    : 0;
  const passed = percentage >= (task?.passingScore || 70);

  const getResultData = () => {
    if (percentage >= 80) {
      return {
        color: theme.palette.success.main,
        title: t("results.excellent") || "Excellent!",
        icon: CelebrationIcon,
      };
    } else if (percentage >= 60) {
      return {
        color: theme.palette.warning.main,
        title: t("results.goodJob") || "Good Job!",
        icon: ThumbUpIcon,
      };
    } else if (percentage >= 40) {
      return {
        color: theme.palette.warning.main,
        title: t("results.keepTrying") || "Keep Trying!",
        icon: InfoIcon,
      };
    } else {
      return {
        color: theme.palette.error.main,
        title: t("results.needMorePractice") || "Need More Practice",
        icon: SchoolIcon,
      };
    }
  };

  const resultData = getResultData();
  const ResultIcon = resultData.icon;

  const formatTimeSpent = (seconds) => {
    if (!seconds) return "0m 0s";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };
  
  const formatTimeLimit = (minutes) => {
    if (!minutes) return "No limit";
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const StatRow = ({ label, value, icon: Icon }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {Icon && <Icon fontSize="small" color="primary" />}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${resultData.color}20, ${theme.palette.background.default})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            maxWidth: 600,
            width: "100%",
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${resultData.color}15, ${resultData.color}05)`,
              p: 4,
              textAlign: "center",
            }}
          >
            <ResultIcon
              sx={{ fontSize: 100, color: resultData.color, mb: 2 }}
            />
            <Typography
              variant="h3"
              fontWeight="bold"
              color={resultData.color}
              gutterBottom
            >
              {resultData.title}
            </Typography>
          </Box>

          <Box sx={{ p: 4, textAlign: "center" }}>
            <Box
              sx={{
                background: `${resultData.color}10`,
                border: `2px solid ${resultData.color}30`,
                borderRadius: 3,
                p: 3,
                mb: 3,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("results.yourScore") || "Your Score"}
              </Typography>
              <Typography
                variant="h2"
                fontWeight="bold"
                color={resultData.color}
                gutterBottom
              >
                {safeScore} / {safeTotalQuestions}
              </Typography>
              <Typography variant="h5" color={resultData.color}>
                {percentage}%
              </Typography>
            </Box>

            <Box sx={{ textAlign: "left", mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {t("results.statistics") || "Statistics"}
              </Typography>
              <StatRow
                label={t("results.questionsAnswered") || "Questions Answered"}
                value={`${safeQuestionsAnswered} / ${safeTotalQuestions}`}
                icon={QuizIcon}
              />
              <StatRow
                label={t("results.timeSpent") || "Time Spent"}
                value={formatTimeSpent(timeSpent)}
                icon={AccessTimeIcon}
              />
              <StatRow
                label={t("results.difficulty") || "Difficulty"}
                value={(task?.difficulty || "medium").toUpperCase()}
              />
              {task?.timeLimit && (
                <StatRow
                  label={t("results.timeLimit") || "Time Limit"}
                  value={formatTimeLimit(task.timeLimit)}
                  icon={AccessTimeIcon}
                />
              )}
              <StatRow
                label={t("results.passingScore") || "Passing Score"}
                value={`${task?.passingScore || 70}%`}
              />
              <StatRow
                label={t("results.totalPoints") || "Total Points Available"}
                value={safeTotalPoints}
              />
              <StatRow
                label={t("results.status") || "Status"}
                value={
                  passed
                    ? t("results.passed") || "PASSED"
                    : t("results.failed") || "FAILED"
                }
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<ReplayIcon />}
                  onClick={handleRestart}
                  sx={{ py: 1.5 }}
                >
                  {t("results.tryAgain") || "Try Again"}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={handleFinish}
                  sx={{ py: 1.5 }}
                >
                  {t("results.finish") || "Finish"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentTaskResultsPage;
