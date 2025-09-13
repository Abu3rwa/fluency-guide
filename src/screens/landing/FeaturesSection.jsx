import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import FeatureCard from "./FeatureCard";
import GradientText from "./GradientText";
import {
  // 20 Most Important Icons for English Learning Platform
  Translate, // Language translation
  School, // Education/learning
  Quiz, // Tests/quizzes
  Assignment, // Homework/tasks
  Book, // Reading/study materials
  Mic, // Speaking practice
  VideoCall, // Video lessons
  Group, // Group learning
  Person, // Individual learning
  Chat, // Communication
  Message, // Messaging
  Email, // Communication
  Star, // Achievements/ratings
  EmojiEvents, // Achievements
  Assessment, // Progress tracking
  Analytics, // Learning analytics
  TrendingUp, // Progress improvement
  Speed, // Fast learning
  Timer, // Time management
  CheckCircle, // Completion/success
  Psychology,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

// Icon mapping for dynamic features
const iconMap = {
  // 20 Most Important Icons for English Learning Platform
  Translate, // Language translation
  School, // Education/learning
  Quiz, // Tests/quizzes
  Assignment, // Homework/tasks
  Book, // Reading/study materials
  Mic, // Speaking practice
  VideoCall, // Video lessons
  Group, // Group learning
  Person, // Individual learning
  Chat, // Communication
  Message, // Messaging
  Email, // Communication
  Star, // Achievements/ratings
  EmojiEvents, // Achievements
  Assessment, // Progress tracking
  Analytics, // Learning analytics
  TrendingUp, // Progress improvement
  Speed, // Fast learning
  Timer, // Time management
  Psychology,
  CheckCircle, // Completion/success
};

const FeaturesSection = React.memo(({ t, features = [] }) => {
  FeaturesSection.displayName = "FeaturesSection";
  const theme = useTheme();

  // Fallback features if no dynamic data is provided - reduced to key features for better UX
  const fallbackFeatures = [
    {
      icon: <Translate />,
      title: t("landing.features.items.interactiveLearning.title"),
      description: t("landing.features.items.interactiveLearning.description"),
      benefits: [
        t("landing.features.items.interactiveLearning.benefit1"),
        t("landing.features.items.interactiveLearning.benefit2"),
        t("landing.features.items.interactiveLearning.benefit3"),
      ],
    },
    {
      icon: <Mic />,
      title: t("landing.features.items.speakingPractice.title"),
      description: t("landing.features.items.speakingPractice.description"),
      benefits: [
        t("landing.features.items.speakingPractice.benefit1"),
        t("landing.features.items.speakingPractice.benefit2"),
        t("landing.features.items.speakingPractice.benefit3"),
      ],
    },
    {
      icon: <VideoCall />,
      title: t("landing.features.items.personalizedContent.title"),
      description: t("landing.features.items.personalizedContent.description"),
      benefits: [
        t("landing.features.items.personalizedContent.benefit1"),
        t("landing.features.items.personalizedContent.benefit2"),
        t("landing.features.items.personalizedContent.benefit3"),
      ],
    },
    {
      icon: <Assessment />,
      title: t("landing.features.items.progressTracking.title"),
      description: t("landing.features.items.progressTracking.description"),
      benefits: [
        t("landing.features.items.progressTracking.benefit1"),
        t("landing.features.items.progressTracking.benefit2"),
        t("landing.features.items.progressTracking.benefit3"),
      ],
    },
  ];

  // Use dynamic features if available, otherwise use fallback
  const displayFeatures = features.length > 0 ? features : fallbackFeatures;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 }, // Increased mobile padding
        px: { xs: 1, sm: 0 }, // Add horizontal padding on mobile
        bgcolor: "background.default",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.divider}, ${theme.palette.primary.main}, ${theme.palette.divider})`,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 3, md: 4 } }}>
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 6, md: 8 },
          }}
        >
          <GradientText
            variant="h2"
            sx={{
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
              fontWeight: 700,
            }}
          >
            {t("landing.features.title")}
          </GradientText>
        </Box>

        <Grid
          container
          spacing={{ xs: 3, sm: 4, md: 4 }}
          alignItems="stretch"
          sx={{
            "& > .MuiGrid-item": {
              display: "flex",
              mb: { xs: 2, sm: 0 }, // Add bottom margin on mobile
              minHeight: { xs: "auto", sm: "100%" }, // Ensure proper height on mobile
            },
            // Ensure cards don't overlap on mobile
            [theme.breakpoints.down("sm")]: {
              "& > .MuiGrid-item": {
                marginBottom: theme.spacing(2),
              },
            },
          }}
        >
          {displayFeatures.map((feature, index) => {
            // Handle dynamic icon mapping
            const IconComponent = feature.icon && iconMap[feature.icon];
            const icon = IconComponent ? <IconComponent /> : feature.icon;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={feature.id || index}>
                <FeatureCard {...feature} icon={icon} />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
});

export default FeaturesSection;
