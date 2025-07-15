import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  QueryBuilder as QueryBuilderIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import StatCard from "../StatCard";

const LessonAnalytics = ({ lessons, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3} mb={4}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const totalLessons = lessons.length;
  const averageDuration = (
    lessons.reduce((acc, lesson) => acc + lesson.duration, 0) / totalLessons
  ).toFixed(2);

  return (
    <Grid container spacing={3} mb={4}>
      <StatCard
        title="Total Lessons"
        value={totalLessons}
        icon={<AssignmentIcon fontSize="large" color="primary" />}
      />
      <StatCard
        title="Average Duration (minutes)"
        value={averageDuration}
        icon={<QueryBuilderIcon fontSize="large" color="secondary" />}
      />
      <StatCard
        title="Most Popular Lesson"
        value="Introduction to React"
        icon={<TrendingUpIcon fontSize="large" color="success" />}
      />
    </Grid>
  );
};

export default LessonAnalytics;
