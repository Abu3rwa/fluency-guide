import React from "react";
import {
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import { useTheme } from "@mui/material/styles";

const StudentFillInBlanksFeedbackSection = ({
  blanksCorrectness,
  explanation,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const allCorrect = blanksCorrectness?.every(Boolean);
  const correctCount = blanksCorrectness?.filter(Boolean).length || 0;
  const totalBlanks = blanksCorrectness?.length || 0;

  const getFeedbackMessage = () => {
    if (allCorrect) {
      return "Excellent! All blanks are correct!";
    } else if (correctCount === 0) {
      return "Keep trying! Review the options and try again.";
    } else {
      return `Good progress! ${correctCount} out of ${totalBlanks} blanks are correct.`;
    }
  };

  const getFeedbackColor = () => {
    if (allCorrect) return "success";
    if (correctCount === 0) return "error";
    return "warning";
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: isMobile ? 2 : 3,
        mt: 2,
        background: theme.palette.background.default,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Alert
        severity={getFeedbackColor()}
        sx={{
          mb: explanation ? 2 : 0,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
        icon={
          allCorrect ? (
            <CheckCircleIcon />
          ) : correctCount === 0 ? (
            <CancelIcon />
          ) : (
            <InfoIcon />
          )
        }
      >
        <Box>
          <Typography
            variant={isMobile ? "body1" : "subtitle1"}
            sx={{ fontWeight: 600, mb: 1 }}
          >
            {getFeedbackMessage()}
          </Typography>

          {/* Individual blank feedback */}
          {totalBlanks > 1 && (
            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              {blanksCorrectness.map((isCorrect, index) => (
                <Chip
                  key={index}
                  label={`Blank ${index + 1}`}
                  size="small"
                  color={isCorrect ? "success" : "error"}
                  variant={isCorrect ? "filled" : "outlined"}
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Alert>

      {explanation && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: theme.palette.text.primary,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <InfoIcon fontSize="small" />
              Explanation
            </Typography>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.6,
                color: theme.palette.text.secondary,
                fontSize: isSmallScreen ? "0.875rem" : "0.9rem",
              }}
            >
              {explanation}
            </Typography>
          </Box>
        </>
      )}

      {/* Accessibility announcement for screen readers */}
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
      >
        {`Feedback: ${getFeedbackMessage()}. ${correctCount} out of ${totalBlanks} blanks correct.`}
      </Box>
    </Paper>
  );
};

export default React.memo(StudentFillInBlanksFeedbackSection);
