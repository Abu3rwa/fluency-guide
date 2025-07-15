import React from "react";
import {
  Grid,
  Skeleton,
} from "@mui/material";
import StatCard from "../StatCard";
import {
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    Folder as ModuleIcon,
    Task as TaskIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckIcon,
  } from "@mui/icons-material";

const ManagementStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3} mb={4}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={2} key={index}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} mb={4}>
        <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<SchoolIcon fontSize="large" color="primary" />}
        />
        <StatCard
            title="Active Courses"
            value={stats.activeCourses}
            icon={<CheckIcon fontSize="large" color="success" />}
        />
        <StatCard
            title="Total Modules"
            value={stats.totalModules}
            icon={<ModuleIcon fontSize="large" color="secondary" />}
        />
        <StatCard
            title="Total Lessons"
            value={stats.totalLessons}
            icon={<AssignmentIcon fontSize="large" color="info" />}
        />
        <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={<TaskIcon fontSize="large" color="warning" />}
        />
        <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={<TrendingUpIcon fontSize="large" color="error" />}
        />
    </Grid>
  );
};

export default ManagementStats;
