import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@mui/material/styles";

const StudentTrueFalseFeedbackSection = ({ isCorrect, explanation }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={1}
      sx={{ p: 2, mt: 2, background: theme.palette.background.default }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        {isCorrect ? (
          <>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="success.main" dir="auto">
              Correct
            </Typography>
          </>
        ) : (
          <>
            <CancelIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="error" dir="auto">
              Incorrect
            </Typography>
          </>
        )}
      </Box>
      {explanation && (
        <Typography variant="body2" sx={{ mt: 1 }} dir="auto">
          {explanation}
        </Typography>
      )}
    </Paper>
  );
};

export default StudentTrueFalseFeedbackSection;
