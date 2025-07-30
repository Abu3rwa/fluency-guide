import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const StudentTaskProgressBar = ({ currentQuestionIndex, totalQuestions }) => {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        {`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};

export default StudentTaskProgressBar;
