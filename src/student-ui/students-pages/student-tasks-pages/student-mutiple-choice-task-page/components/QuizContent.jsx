import React from "react";
import { Box, Typography, Fade } from "@mui/material";
import { useTranslation } from "react-i18next";
import StudentMultipleChoiceQuestionCard from "../StudentMultipleChoiceQuestionCard";
import StudentMultipleChoiceFeedbackSection from "../StudentMultipleChoiceFeedbackSection";

const QuizContent = ({
  currentQuestion,
  selectedAnswer,
  onAnswer,
  showFeedback,
  isCurrentCorrect,
  disabled,
  isMobile,
  isSmallScreen,
}) => {
  const { t } = useTranslation();

  // Validate current question
  if (!currentQuestion || !currentQuestion.text || !currentQuestion.options) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">
          {t("tasks.invalidQuestionFormat")}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <StudentMultipleChoiceQuestionCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onAnswer={onAnswer}
        disabled={disabled}
        isMobile={isMobile}
        isSmallScreen={isSmallScreen}
      />
      {showFeedback && currentQuestion.showFeedback && (
        <Fade in={showFeedback}>
          <div>
            <StudentMultipleChoiceFeedbackSection
              isCorrect={isCurrentCorrect}
              explanation={currentQuestion.explanation}
            />
          </div>
        </Fade>
      )}
    </>
  );
};

export default QuizContent;
