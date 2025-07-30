import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const LoadingState = ({ loading, error, retryCount, onRetry }) => {
  const { t } = useTranslation();

  if (!loading && !error) return null;

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={2}
      >
        <Typography color="error" variant="h6" gutterBottom>
          {t("tasks.loadingError")}
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          {error}
        </Typography>
        {retryCount < 3 && (
          <Typography variant="body2" color="text.secondary">
            {t("tasks.retryingIn", { count: retryCount + 1 })}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        {t("tasks.loadingTask")}
      </Typography>
    </Box>
  );
};

export default LoadingState;
