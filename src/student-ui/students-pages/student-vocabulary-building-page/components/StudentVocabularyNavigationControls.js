import React from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Shuffle as ShuffleIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StudentVocabularyNavigationControls = ({
  currentIndex,
  totalWords,
  onNext,
  onPrevious,
  onRandom,
  onFirst,
  onLast,
  canGoNext,
  canGoPrevious,
}) => {
  const { t } = useTranslation();

  const handleFirst = () => {
    if (onFirst) {
      onFirst();
    }
  };

  const handleLast = () => {
    if (onLast) {
      onLast();
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* Navigation Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t("vocabulary.wordProgress", {
            current: currentIndex + 1,
            total: totalWords,
          })}
        </Typography>
      </Box>

      {/* Navigation Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* First Button */}
        <Tooltip title={t("vocabulary.firstWord")}>
          <IconButton
            onClick={handleFirst}
            disabled={!canGoPrevious}
            size="small"
          >
            <FirstPageIcon />
          </IconButton>
        </Tooltip>

        {/* Previous Button */}
        <Tooltip title={t("vocabulary.previousWord")}>
          <IconButton
            onClick={onPrevious}
            disabled={!canGoPrevious}
            size="small"
          >
            <NavigateBeforeIcon />
          </IconButton>
        </Tooltip>

        {/* Random Button */}
        <Tooltip title={t("vocabulary.randomWord")}>
          <IconButton onClick={onRandom} color="primary" size="small">
            <ShuffleIcon />
          </IconButton>
        </Tooltip>

        {/* Next Button */}
        <Tooltip title={t("vocabulary.nextWord")}>
          <IconButton onClick={onNext} disabled={!canGoNext} size="small">
            <NavigateNextIcon />
          </IconButton>
        </Tooltip>

        {/* Last Button */}
        <Tooltip title={t("vocabulary.lastWord")}>
          <IconButton onClick={handleLast} disabled={!canGoNext} size="small">
            <LastPageIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Progress Indicator */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {Math.round(((currentIndex + 1) / totalWords) * 100)}%
        </Typography>
      </Box>
    </Paper>
  );
};

export default StudentVocabularyNavigationControls;
