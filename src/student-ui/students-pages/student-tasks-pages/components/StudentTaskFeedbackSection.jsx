import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";

const StudentTaskFeedbackSection = ({ isCorrect, explanation }) => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mt: 2,
        backgroundColor: isCorrect
          ? "rgba(76, 175, 80, 0.1)"
          : "rgba(244, 67, 54, 0.1)",
        borderLeft: isCorrect ? "4px solid #4caf50" : "4px solid #f44336",
        borderRadius: 1,
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        {isCorrect ? (
          <>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="success.main">
              {t("tasks.correct")}
            </Typography>
          </>
        ) : (
          <>
            <CancelIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="error">
              {t("tasks.incorrect")}
            </Typography>
          </>
        )}
      </Box>
      {explanation && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {explanation}
        </Typography>
      )}
    </Paper>
  );
};

export default StudentTaskFeedbackSection;
