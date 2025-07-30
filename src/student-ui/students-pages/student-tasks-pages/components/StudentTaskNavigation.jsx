import React from "react";
import { Box, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";

const StudentTaskNavigation = ({
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  onNext,
  onPrevious,
  onSubmit,
  isLastQuestion,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: { xs: 3, sm: 4 },
        gap: { xs: 1, sm: 2 },
        // Mobile-specific improvements
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
      }}
    >
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        sx={{
          // Mobile-specific improvements
          minHeight: { xs: 48, sm: 36 },
          fontSize: { xs: "0.9rem", sm: "0.875rem" },
          py: { xs: 1.5, sm: 1 },
          px: { xs: 2, sm: 1.5 },
          // Ensure proper touch target on mobile
          "@media (max-width: 600px)": {
            minHeight: 48,
            fontSize: "0.9rem",
          },
        }}
      >
        {t("tasks.previous")}
      </Button>

      {isLastQuestion ? (
        <Button
          variant="contained"
          color="primary"
          endIcon={<CheckIcon />}
          onClick={onSubmit}
          disabled={!isAnswered}
          sx={{
            // Mobile-specific improvements
            minHeight: { xs: 48, sm: 36 },
            fontSize: { xs: "0.9rem", sm: "0.875rem" },
            py: { xs: 1.5, sm: 1 },
            px: { xs: 2, sm: 1.5 },
            // Ensure proper touch target on mobile
            "@media (max-width: 600px)": {
              minHeight: 48,
              fontSize: "0.9rem",
            },
          }}
        >
          {t("tasks.finish")}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          disabled={!isAnswered}
          sx={{
            // Mobile-specific improvements
            minHeight: { xs: 48, sm: 36 },
            fontSize: { xs: "0.9rem", sm: "0.875rem" },
            py: { xs: 1.5, sm: 1 },
            px: { xs: 2, sm: 1.5 },
            // Ensure proper touch target on mobile
            "@media (max-width: 600px)": {
              minHeight: 48,
              fontSize: "0.9rem",
            },
          }}
        >
          {t("tasks.next")}
        </Button>
      )}
    </Box>
  );
};

export default StudentTaskNavigation;
