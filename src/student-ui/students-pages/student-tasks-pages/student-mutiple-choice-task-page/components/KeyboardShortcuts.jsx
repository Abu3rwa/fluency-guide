import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const KeyboardShortcuts = ({ isMobile }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (isMobile) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        opacity: 0.7,
        "&:hover": { opacity: 1 },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 1,
          fontSize: "0.75rem",
          maxWidth: 200,
          backgroundColor: theme.palette.background.paper + "E6",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, display: "block" }}
        >
          {t("tasks.keyboardShortcuts")}
        </Typography>
        <Typography variant="caption" sx={{ display: "block" }}>
          {t("tasks.navigateQuestions")}
        </Typography>
        <Typography variant="caption" sx={{ display: "block" }}>
          {t("tasks.selectBlanks")}
        </Typography>
        <Typography variant="caption" sx={{ display: "block" }}>
          {t("tasks.pauseResume")}
        </Typography>
        <Typography variant="caption" sx={{ display: "block" }}>
          {t("tasks.clearSelection")}
        </Typography>
      </Paper>
    </Box>
  );
};

export default KeyboardShortcuts;
