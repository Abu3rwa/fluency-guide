import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuizIcon from "@mui/icons-material/Quiz";

const StudentLessonActionsBar = ({ lesson }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(lesson?.completed || false);

  const handleMarkComplete = () => {
    // TODO: Call backend to mark as complete
    setCompleted(true);
  };

  const handleStartQuiz = () => {
    // TODO: Navigate to quiz/assignment
    alert(t("lessonDetails.startQuiz"));
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 4 },
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <Button
        variant={completed ? "outlined" : "contained"}
        color="primary"
        startIcon={<CheckCircleIcon />}
        onClick={handleMarkComplete}
        disabled={completed}
        sx={{
          borderRadius: theme.shape.borderRadius,
          minWidth: 140,
          width: { xs: "100%", sm: "auto" },
          fontSize: { xs: "0.95rem", md: "1.05rem" },
        }}
        aria-label={t("lessonDetails.markComplete")}
      >
        {completed
          ? t("lessonDetails.completed")
          : t("lessonDetails.markComplete")}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<QuizIcon />}
        onClick={handleStartQuiz}
        sx={{
          borderRadius: theme.shape.borderRadius,
          minWidth: 140,
          width: { xs: "100%", sm: "auto" },
          fontSize: { xs: "0.95rem", md: "1.05rem" },
        }}
        aria-label={t("lessonDetails.startQuiz")}
      >
        {t("lessonDetails.startQuiz")}
      </Button>
    </Box>
  );
};
export default StudentLessonActionsBar;
