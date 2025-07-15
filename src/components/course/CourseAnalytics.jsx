import React from "react";
import { Typography, Card, CardContent, Grid } from "@mui/material";
import {
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  EmojiEvents as EmojiEventsIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import AnalyticsCard from "../AnalyticsCard";

const CourseAnalytics = ({ analytics }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("courses.analytics.title")}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <AnalyticsCard
              title="completionRate"
              value={`${analytics.completionRate}%`}
              icon={<TimelineIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={6}>
            <AnalyticsCard
              title="activeStudents"
              value={analytics.activeStudents}
              icon={<PeopleIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={6}>
            <AnalyticsCard
              title="totalEnrolled"
              value={analytics.totalEnrolled}
              icon={<GroupIcon color="primary" />}
            />
          </Grid>
          <Grid item xs={6}>
            <AnalyticsCard
              title="satisfactionRate"
              value={`${analytics.satisfactionRate}%`}
              icon={<EmojiEventsIcon color="primary" />}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CourseAnalytics;
