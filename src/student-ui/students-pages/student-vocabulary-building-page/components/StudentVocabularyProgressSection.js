import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";

const StudentVocabularyProgressSection = () => {
  const { t } = useTranslation();
  const { learnedCount, difficultWords, vocabularyWords, loading } =
    useStudentVocabulary();

  const totalWords = vocabularyWords.length;
  const difficultCount = difficultWords.length;
  const learningRate = totalWords > 0 ? (learnedCount / totalWords) * 100 : 0;

  const getLearningRateColor = () => {
    if (learningRate >= 80) return "success";
    if (learningRate >= 60) return "warning";
    return "error";
  };

  const getLearningRateText = () => {
    if (learningRate >= 80)
      return t("vocabulary.excellentProgress", "Excellent Progress");
    if (learningRate >= 60)
      return t("vocabulary.goodProgress", "Good Progress");
    if (learningRate >= 40)
      return t("vocabulary.fairProgress", "Fair Progress");
    return t("vocabulary.needsImprovement", "Needs Improvement");
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {t("vocabulary.learningProgress", "Learning Progress")}
        </Typography>

        <Grid container spacing={3}>
          {/* Total Words Learned */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <SchoolIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="h4" component="div" color="primary.main">
                {learnedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("vocabulary.wordsLearned", "Words Learned")}
              </Typography>
            </Box>
          </Grid>

          {/* Total Available Words */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <TrendingUpIcon
                sx={{ fontSize: 40, color: "info.main", mb: 1 }}
              />
              <Typography variant="h4" component="div" color="info.main">
                {totalWords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("vocabulary.totalWords", "Total Words")}
              </Typography>
            </Box>
          </Grid>

          {/* Difficult Words */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <WarningIcon
                sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
              />
              <Typography variant="h4" component="div" color="warning.main">
                {difficultCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("vocabulary.difficultWords", "Difficult Words")}
              </Typography>
            </Box>
          </Grid>

          {/* Learning Rate */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <StarIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main">
                {Math.round(learningRate)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("vocabulary.learningRate", "Learning Rate")}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Learning Rate Progress */}
        {totalWords > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {getLearningRateText()}
              </Typography>
              <Chip
                label={`${Math.round(learningRate)}%`}
                color={getLearningRateColor()}
                size="small"
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={learningRate}
              color={getLearningRateColor()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Difficult Words List */}
        {difficultCount > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("vocabulary.recentDifficultWords", "Recent Difficult Words")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {difficultWords.slice(0, 5).map((item) => (
                <Chip
                  key={item.word.id}
                  label={item.word.word}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              ))}
              {difficultCount > 5 && (
                <Chip
                  label={`+${difficultCount - 5} more`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {!loading.progress && learnedCount === 0 && difficultCount === 0 && (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <SchoolIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {t(
                "vocabulary.noProgressYet",
                "Start learning vocabulary to see your progress here"
              )}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentVocabularyProgressSection;
