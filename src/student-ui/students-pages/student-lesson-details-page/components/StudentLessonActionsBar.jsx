import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuizIcon from "@mui/icons-material/Quiz";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../routes/constants";

const StudentLessonActionsBar = ({ lesson }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(lesson?.completed || false);
  const navigate = useNavigate();

  const handleMarkComplete = () => {
    setCompleted(true);
  };

  // Example: lesson.tasks = [{ id, type }]
  const handleGoToTask = (task) => {
    if (task.type === "fill-in-blanks") {
      navigate(ROUTES.STUDENT_FILL_IN_BLANKS_TASK.replace(":taskId", task.id));
    } else if (task.type === "multiple-choice") {
      navigate(ROUTES.STUDENT_MULTIPLE_CHOICE_TASK.replace(":taskId", task.id));
    } else if (task.type === "true-false") {
      navigate(ROUTES.STUDENT_TRUE_FALSE_TASK.replace(":taskId", task.id));
    }
  };

  return (
    <Box
      sx={{
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
      {lesson?.tasks?.map((task) => (
        <Button
          key={task.id}
          variant="contained"
          color="secondary"
          startIcon={<QuizIcon />}
          onClick={() => handleGoToTask(task)}
          sx={{
            borderRadius: theme.shape.borderRadius,
            minWidth: 180,
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "0.95rem", md: "1.05rem" },
          }}
          aria-label={t("lessonDetails.startQuiz") + `: ${task.type}`}
        >
          {t("lessonDetails.startQuiz")}: {task.type.replace(/-/g, " ")}
        </Button>
      ))}
    </Box>
  );
};
export default StudentLessonActionsBar;
