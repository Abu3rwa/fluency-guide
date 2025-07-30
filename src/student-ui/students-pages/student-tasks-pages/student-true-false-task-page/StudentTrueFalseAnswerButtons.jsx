import React from "react";
import { Box, Button } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const StudentTrueFalseAnswerButtons = ({
  onAnswer,
  disabled,
  isCorrect,
  selectedAnswer,
}) => {
  const getButtonColor = (isButtonForTrue) => {
    if (disabled) {
      if (selectedAnswer === isButtonForTrue) {
        return isCorrect ? "success" : "error";
      }
    }
    return "primary";
  };

  return (
    <Box display="flex" justifyContent="center" gap={2} mt={2}>
      <Button
        variant={selectedAnswer === true ? "contained" : "outlined"}
        color={getButtonColor(true)}
        startIcon={<ThumbUpIcon />}
        onClick={() => onAnswer(true)}
        disabled={disabled}
        sx={{ minWidth: 120 }}
        dir="auto"
      >
        True
      </Button>
      <Button
        variant={selectedAnswer === false ? "contained" : "outlined"}
        color={getButtonColor(false)}
        startIcon={<ThumbDownIcon />}
        onClick={() => onAnswer(false)}
        disabled={disabled}
        sx={{ minWidth: 120 }}
        dir="auto"
      >
        False
      </Button>
    </Box>
  );
};

export default StudentTrueFalseAnswerButtons;
