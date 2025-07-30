import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Container,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import InfoIcon from "@mui/icons-material/Info";
import SchoolIcon from "@mui/icons-material/School";
import ReplayIcon from "@mui/icons-material/Replay";
import HomeIcon from "@mui/icons-material/Home";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import { useTranslation } from "react-i18next";

const StudentTaskResultsPage = ({
  score,
  totalPoints,
  onRestart,
  onFinish,
  task,
  timeSpent,
  questionsAnswered,
  totalQuestions,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const percentage =
    totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
  const passed = percentage >= (task?.passingScore || 50);

  // Determine color and icon based on percentage (matching Flutter logic)
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

  // Format time spent
  const formatTimeSpent = (seconds) => {
    if (!seconds) return "0m 0s";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
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
          {/* Header */}
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

          {/* Score Display */}
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
                {score} / {totalPoints}
              </Typography>
              <Typography variant="h5" color={resultData.color}>
                {percentage}%
              </Typography>
            </Box>

            {/* Statistics */}
            <Box sx={{ textAlign: "left", mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {t("results.statistics") || "Statistics"}
              </Typography>
              <StatRow
                label={t("results.questionsAnswered") || "Questions Answered"}
                value={`${
                  questionsAnswered || totalQuestions
                } / ${totalQuestions}`}
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
              {task?.passingScore && (
                <StatRow
                  label={t("results.passingScore") || "Passing Score"}
                  value={`${task.passingScore}%`}
                />
              )}
              <StatRow
                label={t("results.status") || "Status"}
                value={
                  passed
                    ? t("results.passed") || "PASSED"
                    : t("results.failed") || "FAILED"
                }
              />
            </Box>

            {/* Action Buttons */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<ReplayIcon />}
                  onClick={onRestart}
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
                  onClick={onFinish}
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
