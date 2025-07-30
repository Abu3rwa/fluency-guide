import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const ScreenReaderAnnouncements = ({
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      component="div"
      sx={{
        position: "absolute",
        left: "-10000px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
      aria-live="polite"
      aria-atomic="true"
      id="sr-announcements"
    >
      {t("tasks.questionOf", {
        current: currentQuestionIndex + 1,
        total: totalQuestions,
      })}
      . {selectedAnswer ? t("tasks.blankSelected", { index: 1 }) : ""}
    </Box>
  );
};

export default ScreenReaderAnnouncements;
