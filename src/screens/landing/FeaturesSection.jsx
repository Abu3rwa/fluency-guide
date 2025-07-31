import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import FeatureCard from "./FeatureCard";
import GradientText from "./GradientText";
import LanguageIcon from "@mui/icons-material/Language";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import SpeedIcon from "@mui/icons-material/Speed";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { useTheme } from "@mui/material/styles";

const FeaturesSection = ({ t }) => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 4, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <GradientText
          variant="h2"
          align="center"
          sx={{
            mb: { xs: 3, md: 8 },
            fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
          }}
        >
          {t("landing.features.title")}
        </GradientText>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="stretch">
          {[
            {
              icon: (
                <LanguageIcon
                  color="primary"
                  sx={{
                    fontSize: 48,
                    background: theme.icon.background,
                    padding: theme.icon.padding,
                    borderRadius: theme.icon.borderRadius,
                  }}
                />
              ),
              title: t("landing.features.items.interactiveLearning.title"),
              description: t(
                "landing.features.items.interactiveLearning.description"
              ),
            },
            {
              icon: (
                <HeadsetMicIcon
                  color="primary"
                  sx={{
                    fontSize: 48,
                    background: theme.icon.background,
                    padding: theme.icon.padding,
                    borderRadius: theme.icon.borderRadius,
                  }}
                />
              ),
              title: t("landing.features.items.speakingPractice.title"),
              description: t(
                "landing.features.items.speakingPractice.description"
              ),
            },
            {
              icon: (
                <SpeedIcon
                  color="primary"
                  sx={{
                    fontSize: 48,
                    background: theme.icon.background,
                    padding: theme.icon.padding,
                    borderRadius: theme.icon.borderRadius,
                  }}
                />
              ),
              title: t("landing.features.items.fastProgress.title"),
              description: t("landing.features.items.fastProgress.description"),
            },
            {
              icon: (
                <PsychologyIcon
                  color="primary"
                  sx={{
                    fontSize: 48,
                    background: theme.icon.background,
                    padding: theme.icon.padding,
                    borderRadius: theme.icon.borderRadius,
                  }}
                />
              ),
              title: t("landing.features.items.smartLearning.title"),
              description: t(
                "landing.features.items.smartLearning.description"
              ),
            },
          ].map((feature, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={index}
              style={{ height: "100%" }}
            >
              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {feature.icon}
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ opacity: 0.8 }}
                >
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
