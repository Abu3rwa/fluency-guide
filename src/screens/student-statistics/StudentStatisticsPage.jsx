import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  BarChart as BarChartIcon,
  GetApp as ExportIcon,
} from "@mui/icons-material";
import StatCard from "./components/StatCard";
import ProgressChart from "./components/ProgressChart";
import GradeDistributionChart from "./components/GradeDistributionChart";
import CoursePerformanceSection from "./components/CoursePerformanceSection";
import RecentActivitySection from "./components/RecentActivitySection";
import { useStudentStatistics } from "./hooks/useStudentStatistics";

const StudentStatisticsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [timeFilter, setTimeFilter] = useState("This Month");

  const {
    stats,
    progressData,
    gradeDistribution,
    coursePerformance,
    recentActivities,
    loading,
    error,
  } = useStudentStatistics(timeFilter);

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    alert(
      "Export functionality would generate a detailed PDF report with all student statistics and analytics."
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">Error loading dashboard: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.grey[50],
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: "white",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.5rem", md: "2rem" },
                color: theme.palette.grey[900],
              }}
            >
              Student Statistics Dashboard
            </Typography>

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.grey[300],
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  }}
                >
                  <MenuItem value="This Month">This Month</MenuItem>
                  <MenuItem value="Last Month">Last Month</MenuItem>
                  <MenuItem value="This Quarter">This Quarter</MenuItem>
                  <MenuItem value="This Year">This Year</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<ExportIcon />}
                onClick={handleExportReport}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Export Report
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              change="+12% from last month"
              changeType="positive"
              icon={<PeopleIcon />}
              iconColor={theme.palette.primary.main}
              iconBgColor={theme.palette.primary.light + "20"}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Active Students"
              value={stats.activeStudents}
              change="+8% from last month"
              changeType="positive"
              icon={<CheckCircleIcon />}
              iconColor={theme.palette.success.main}
              iconBgColor={theme.palette.success.light + "20"}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Average Grade"
              value={`${stats.averageGrade}%`}
              change="+2.1% from last month"
              changeType="positive"
              icon={<StarIcon />}
              iconColor={theme.palette.warning.main}
              iconBgColor={theme.palette.warning.light + "20"}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              change="+1.8% from last month"
              changeType="positive"
              icon={<BarChartIcon />}
              iconColor={theme.palette.secondary.main}
              iconBgColor={theme.palette.secondary.light + "20"}
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.grey[100]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  fontWeight="600"
                  sx={{ mb: 2, color: theme.palette.grey[900] }}
                >
                  Student Progress Over Time
                </Typography>
                <ProgressChart data={progressData} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.grey[100]}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  fontWeight="600"
                  sx={{ mb: 2, color: theme.palette.grey[900] }}
                >
                  Grade Distribution
                </Typography>
                <GradeDistributionChart data={gradeDistribution} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Course Performance Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <CoursePerformanceSection courses={coursePerformance} />
          </Grid>
        </Grid>

        {/* Recent Activity Section */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <RecentActivitySection activities={recentActivities} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentStatisticsPage;
