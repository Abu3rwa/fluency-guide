import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { getLessonAnalytics } from "../services/analyticsService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const LessonAnalyticsScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [timeRange, setTimeRange] = useState("week");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [id, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getLessonAnalytics(id, timeRange);
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implement export functionality
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate(`/lessons/${id}`)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {t("lessonAnalytics.title")}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>{t("lessonAnalytics.timeRange")}</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label={t("lessonAnalytics.timeRange")}
          >
            <MenuItem value="week">
              {t("lessonAnalytics.timeRange.week")}
            </MenuItem>
            <MenuItem value="month">
              {t("lessonAnalytics.timeRange.month")}
            </MenuItem>
            <MenuItem value="year">
              {t("lessonAnalytics.timeRange.year")}
            </MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={handleExport}>
          <DownloadIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t("lessonAnalytics.totalEnrollments")}
              </Typography>
              <Typography variant="h4">
                {analytics?.totalEnrollments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t("lessonAnalytics.completionRate")}
              </Typography>
              <Typography variant="h4">{analytics?.completionRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t("lessonAnalytics.averageScore")}
              </Typography>
              <Typography variant="h4">{analytics?.averageScore}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t("lessonAnalytics.activeUsers")}
              </Typography>
              <Typography variant="h4">{analytics?.activeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Over Time */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("lessonAnalytics.engagementOverTime")}
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke={theme.palette.primary.main}
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke={theme.palette.success.main}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Completion Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("lessonAnalytics.completionStatus")}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.completionStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics?.completionStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Performance by Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("lessonAnalytics.performanceBySection")}
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.sectionPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* User Demographics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("lessonAnalytics.userDemographics")}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.userLevels}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics?.userLevels.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.userProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="progress"
                        fill={theme.palette.success.main}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LessonAnalyticsScreen;
