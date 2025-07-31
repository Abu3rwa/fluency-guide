import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuizIcon from "@mui/icons-material/Quiz";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../routes/constants";
import { useStudyTime } from "../../../../contexts/StudyTimeContext";
import { updateTodayStats } from "../../../../services/student-services/studentTodayStatsService";
import { createActivityFromLessonCompletion } from "../../../../services/student-services/studentRecentActivityService";
import { getAuth } from "firebase/auth";

const StudentLessonActionsBar = ({ lesson }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(lesson?.completed || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { endSession, activeSessionDuration } = useStudyTime();
  const auth = getAuth();

  const handleMarkComplete = async () => {
    if (completed || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // End the current study session and get the duration
      const sessionDuration = activeSessionDuration;
      console.log(
        "Session duration before ending:",
        sessionDuration,
        "seconds"
      );

      endSession();

      // Submit lesson completion activity with study time
      const userId = auth.currentUser?.uid;
      console.log("User ID:", userId);
      console.log("Lesson ID:", lesson.id);
      console.log("Lesson title:", lesson.title);

      if (userId && sessionDuration > 0) {
        const durationInMinutes = Math.ceil(sessionDuration / 60);
        console.log("Duration in minutes:", durationInMinutes);

        const activityData = {
          type: "lesson_completed",
          duration: durationInMinutes,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          timestamp: new Date(),
        };

        console.log("Submitting activity data:", activityData);

        await updateTodayStats(userId, activityData);
        console.log("Activity submitted successfully!");

        // Create recent activity for lesson completion
        try {
          const lessonTitle = lesson.title || "Lesson Completed";

          await createActivityFromLessonCompletion(
            userId,
            lesson.id,
            lessonTitle,
            lesson.courseId,
            durationInMinutes
          );

          console.log("Recent activity created for lesson completion");
        } catch (error) {
          console.error("Error creating recent activity for lesson:", error);
        }
      } else {
        console.warn("No user ID or session duration too low:", {
          userId,
          sessionDuration,
        });
      }

      setCompleted(true);

      // Show success message
      console.log(
        "Lesson completed! Study time recorded:",
        sessionDuration,
        "seconds"
      );
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
      // You can add error handling here
    } finally {
      setIsSubmitting(false);
    }
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
        disabled={completed || isSubmitting}
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
          : isSubmitting
          ? "Recording..."
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
