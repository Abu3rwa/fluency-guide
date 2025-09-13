import React from "react";
import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import StudentProgressList from "../StudentProgressList";

/**
 * CourseAnalyticsTab - Analytics tab content for CourseDetailsScreen
 * Displays student progress and course analytics
 */
const CourseAnalyticsTab = ({ theme, studentProgress }) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        borderRadius: theme.shape.borderRadius * 2,
      }}
    >
      <CardContent
        sx={{ p: { xs: theme.spacing(2), md: theme.spacing(3) } }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          {t("courseDetails.progress")}
        </Typography>
        <StudentProgressList students={studentProgress} />
      </CardContent>
    </Card>
  );
};

export default CourseAnalyticsTab;