import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";
import {
  getDifficultyColor,
  getFrequencyDescription,
} from "../utils/vocabularyHelpers";

const StudentVocabularyWordCard = React.memo(
  ({
    word,
    onMarkAsLearned,
    onMarkAsDifficult,
    onToggleFavorite,
    onPronunciationClick,
  }) => {
    const { t } = useTranslation();
    const { getWordProgress } = useStudentVocabulary();
    const [expanded, setExpanded] = useState(false);

    // Memoized word progress and status
    const wordProgress = useMemo(
      () => getWordProgress(word.id),
      [getWordProgress, word.id]
    );
    const isFavorite = useMemo(
      () => wordProgress?.isFavorite || false,
      [wordProgress?.isFavorite]
    );
    const isLearned = useMemo(
      () => wordProgress?.status === "learned",
      [wordProgress?.status]
    );
    const isDifficult = useMemo(
      () => wordProgress?.status === "difficult",
      [wordProgress?.status]
    );

    // Memoized status helpers
    const statusColor = useMemo(() => {
      if (isLearned) return "success";
      if (isDifficult) return "warning";
      return "default";
    }, [isLearned, isDifficult]);

    const statusIcon = useMemo(() => {
      if (isLearned) return <CheckCircleIcon />;
      if (isDifficult) return <WarningIcon />;
      return null;
    }, [isLearned, isDifficult]);

    const statusText = useMemo(() => {
      if (isLearned) return t("vocabulary.learned", "Learned");
      if (isDifficult) return t("vocabulary.difficult", "Difficult");
      return t("vocabulary.new", "New");
    }, [isLearned, isDifficult, t]);

    // Memoized difficulty color
    const difficultyColor = useMemo(
      () => getDifficultyColor(word.level),
      [word.level]
    );

    // Memoized frequency description
    const frequencyDescription = useMemo(
      () => (word.frequency ? getFrequencyDescription(word.frequency) : null),
      [word.frequency]
    );

    // Memoized examples to show
    const examplesToShow = useMemo(
      () => word.examples?.slice(0, expanded ? word.examples.length : 2) || [],
      [word.examples, expanded]
    );

    // Memoized action handlers
    const handleToggleExpand = useCallback(() => {
      setExpanded((prev) => !prev);
    }, []);

    const handlePronunciation = useCallback(() => {
      if (onPronunciationClick) {
        onPronunciationClick(word);
      }
    }, [onPronunciationClick, word]);

    const handleMarkAsLearned = useCallback(() => {
      onMarkAsLearned(word.id);
    }, [onMarkAsLearned, word.id]);

    const handleMarkAsDifficult = useCallback(() => {
      onMarkAsDifficult(word.id);
    }, [onMarkAsDifficult, word.id]);

    const handleToggleFavorite = useCallback(() => {
      onToggleFavorite(word.id);
    }, [onToggleFavorite, word.id]);

    return (
      <Card sx={{ mb: 3, position: "relative" }}>
        <CardContent>
          {/* Word Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                {word.word}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {word.level && (
                  <Chip
                    label={word.level}
                    size="small"
                    sx={{
                      bgcolor: difficultyColor,
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                )}

                {word.category && (
                  <Chip label={word.category} size="small" variant="outlined" />
                )}

                <Chip
                  icon={statusIcon}
                  label={statusText}
                  size="small"
                  color={statusColor}
                  variant={isLearned || isDifficult ? "filled" : "outlined"}
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                onClick={handlePronunciation}
                color="primary"
                size="small"
              >
                <VolumeUpIcon />
              </IconButton>

              <IconButton
                onClick={handleToggleFavorite}
                color={isFavorite ? "secondary" : "default"}
                size="small"
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Definition */}
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            {word.definition}
          </Typography>

          {/* Frequency Information */}
          {frequencyDescription && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {frequencyDescription}
              </Typography>
            </Box>
          )}

          {/* Examples */}
          {word.examples && word.examples.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: "bold" }}
              >
                {t("vocabulary.examples", "Examples")}:
              </Typography>
              <List dense sx={{ py: 0 }}>
                {examplesToShow.map((example, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemText
                      primary={example}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontStyle: "italic",
                          color: "text.secondary",
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              {word.examples.length > 2 && (
                <Button
                  size="small"
                  onClick={handleToggleExpand}
                  endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mt: 1 }}
                >
                  {expanded
                    ? t("common.showLess", "Show Less")
                    : t("common.showMore", "Show More")}
                </Button>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<WarningIcon />}
              onClick={handleMarkAsDifficult}
              disabled={isDifficult}
              fullWidth
            >
              {isDifficult
                ? t("vocabulary.markedAsDifficult", "Marked as Difficult")
                : t("vocabulary.markAsDifficult", "Mark as Difficult")}
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAsLearned}
              disabled={isLearned}
              fullWidth
            >
              {isLearned
                ? t("vocabulary.alreadyLearned", "Already Learned")
                : t("vocabulary.markAsLearned", "Mark as Learned")}
            </Button>
          </Box>

          {/* Review Count */}
          {wordProgress && wordProgress.reviewCount > 0 && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {t("vocabulary.reviewedTimes", "Reviewed {{count}} times", {
                  count: wordProgress.reviewCount,
                })}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }
);

StudentVocabularyWordCard.displayName = "StudentVocabularyWordCard";

export default StudentVocabularyWordCard;
