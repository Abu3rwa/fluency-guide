import React from "react";
import {
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControl,
  FormLabel,
  Box,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import StudentMultipleChoiceOption from "./StudentMultipleChoiceOption";

const StudentMultipleChoiceQuestionCard = ({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
  isMobile,
  isSmallScreen,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleChange = (event) => {
    onAnswer(question.id, event.target.value);
  };

  if (!question || !question.text || !question.options) {
    return (
      <Card
        elevation={3}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "visible",
          background: theme.palette.background.paper,
        }}
      >
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="error">
            {t("tasks.invalidQuestionFormat")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: "visible",
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[0],
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Question number indicator */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Chip
            label={`${t("tasks.questionOf", {
              current: question.questionNumber || 1,
              total: question.totalQuestions || 1,
            })}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Question text */}
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 500,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            lineHeight: 1.4,
            mb: 3,
            textAlign: "center",
          }}
          dir="auto"
        >
          {question.text}
        </Typography>

        {/* Options */}
        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <FormLabel
            component="legend"
            sx={{
              mb: 2,
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 500,
            }}
          >
            {t("tasks.selectCorrectAnswer")}
          </FormLabel>
          <RadioGroup
            aria-label={`multiple-choice-question-${question.id}`}
            name={`question-${question.id}`}
            value={selectedAnswer || ""}
            onChange={handleChange}
            sx={{ gap: 1 }}
          >
            {question.options.map((option, index) => {
              const optionText = option.text || option;
              return (
                <StudentMultipleChoiceOption
                  key={index}
                  value={optionText}
                  label={optionText}
                  selected={selectedAnswer === optionText}
                  onChange={handleChange}
                  disabled={disabled}
                  isMobile={isMobile}
                  isSmallScreen={isSmallScreen}
                  optionIndex={index}
                />
              );
            })}
          </RadioGroup>
        </FormControl>

        {/* Question metadata */}
        {question.difficulty && (
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={t(`tasks.difficulty.${question.difficulty.toLowerCase()}`)}
              size="small"
              color={
                question.difficulty === "EASY"
                  ? "success"
                  : question.difficulty === "MEDIUM"
                  ? "warning"
                  : "error"
              }
              variant="outlined"
            />
            {question.category && (
              <Chip label={question.category} size="small" variant="outlined" />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMultipleChoiceQuestionCard;
