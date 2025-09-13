import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Rollback,
  PlayArrow,
  Pause,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";
import { rolloutManager } from "../../services/student-services/rolloutManager";
import { getMonitoringData } from "../../services/student-services/lessonCompletionMonitoring";

const RolloutMonitoringDashboard = () => {
  const { t } = useTranslation();
  
  // Safely get theme with fallback
  let theme;
  try {
    const themeContext = useCustomTheme();
    theme = themeContext.theme;
  } catch (error) {
    console.warn("Theme context not available:", error);
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading theme...</Typography>
      </Box>
    );
  }

  // Guard against undefined theme
  if (!theme) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading theme...</Typography>
      </Box>
    );
  }
  const [rolloutStatus, setRolloutStatus] = useState(null);
  const [monitoringData, setMonitoringData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [rollbackInProgress, setRollbackInProgress] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Initialize rollout manager
      await rolloutManager.initialize();

      // Get rollout status
      const status = rolloutManager.getRolloutStatus();
      setRolloutStatus(status);

      // Get monitoring data
      const today = new Date().toISOString().split("T")[0];
      const data = await getMonitoringData(today);
      setMonitoringData(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancePhase = async () => {
    try {
      const nextPhase = await rolloutManager.advancePhase();
      if (nextPhase) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Error advancing phase:", error);
    }
  };

  const handleEmergencyRollback = async () => {
    try {
      setRollbackInProgress(true);
      await rolloutManager.emergencyRollback();
      await loadDashboardData();
      setShowRollbackDialog(false);
    } catch (error) {
      console.error("Error during emergency rollback:", error);
    } finally {
      setRollbackInProgress(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const getMetricStatus = (metric, threshold) => {
    if (metric >= threshold) return "healthy";
    if (metric >= threshold * 0.8) return "warning";
    return "critical";
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          {t("admin.rollout.title", "Rollout Monitoring Dashboard")}
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={loadDashboardData}
          variant="outlined"
        >
          {t("common.refresh", "Refresh")}
        </Button>
      </Box>

      {/* Current Phase Status */}
      {rolloutStatus && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("admin.rollout.currentPhase", "Current Phase")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              label={rolloutStatus.phaseInfo.name}
              color="primary"
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              {rolloutStatus.phaseInfo.description}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    {t("admin.rollout.rolloutPercentage", "Rollout Percentage")}
                  </Typography>
                  <Typography variant="h4">
                    {rolloutStatus.phaseInfo.rolloutPercentage}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={rolloutStatus.phaseInfo.rolloutPercentage}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    {t("admin.rollout.duration", "Duration")}
                  </Typography>
                  <Typography variant="h4">
                    {rolloutStatus.phaseInfo.duration}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    {t("admin.rollout.maxUsers", "Max Users")}
                  </Typography>
                  <Typography variant="h4">
                    {rolloutStatus.phaseInfo.maxUsers || "∞"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleAdvancePhase}
              disabled={rolloutStatus.currentPhase === "general"}
            >
              {t("admin.rollout.advancePhase", "Advance Phase")}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<Rollback />}
              onClick={() => setShowRollbackDialog(true)}
            >
              {t("admin.rollout.emergencyRollback", "Emergency Rollback")}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Monitoring Metrics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("admin.rollout.metrics", "Monitoring Metrics")}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {t("admin.rollout.completionRate", "Completion Rate")}
                  </Typography>
                  {monitoringData.completionRate > 80 ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                </Box>
                <Typography variant="h4">
                  {monitoringData.completionRate || 0}%
                </Typography>
                <Chip
                  label={getMetricStatus(
                    monitoringData.completionRate || 0,
                    80
                  )}
                  color={getStatusColor(
                    getMetricStatus(monitoringData.completionRate || 0, 80)
                  )}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {t("admin.rollout.errorRate", "Error Rate")}
                  </Typography>
                  {monitoringData.errorRate < 5 ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Error color="error" />
                  )}
                </Box>
                <Typography variant="h4">
                  {monitoringData.errorRate || 0}%
                </Typography>
                <Chip
                  label={getMetricStatus(monitoringData.errorRate || 0, 5)}
                  color={getStatusColor(
                    getMetricStatus(monitoringData.errorRate || 0, 5)
                  )}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {t("admin.rollout.satisfaction", "User Satisfaction")}
                  </Typography>
                  {monitoringData.satisfactionScore > 70 ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                </Box>
                <Typography variant="h4">
                  {monitoringData.satisfactionScore || 0}%
                </Typography>
                <Chip
                  label={getMetricStatus(
                    monitoringData.satisfactionScore || 0,
                    70
                  )}
                  color={getStatusColor(
                    getMetricStatus(monitoringData.satisfactionScore || 0, 70)
                  )}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("admin.rollout.recentActivity", "Recent Activity")}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("admin.rollout.timestamp", "Timestamp")}
                </TableCell>
                <TableCell>{t("admin.rollout.event", "Event")}</TableCell>
                <TableCell>{t("admin.rollout.details", "Details")}</TableCell>
                <TableCell>{t("admin.rollout.status", "Status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Sample data - will be replaced with real data */}
              <TableRow>
                <TableCell>2024-01-15 10:30</TableCell>
                <TableCell>Phase Advancement</TableCell>
                <TableCell>Pilot → Beta</TableCell>
                <TableCell>
                  <Chip label="Success" color="success" size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-01-15 09:15</TableCell>
                <TableCell>Feature Usage</TableCell>
                <TableCell>Lesson Requirements enabled for 25% users</TableCell>
                <TableCell>
                  <Chip label="Active" color="primary" size="small" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Emergency Rollback Dialog */}
      <Dialog
        open={showRollbackDialog}
        onClose={() => setShowRollbackDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Warning color="error" />
            {t("admin.rollback.title", "Emergency Rollback")}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t(
              "admin.rollback.warning",
              "This will immediately disable all lesson completion requirements for all users. This action cannot be undone easily."
            )}
          </Alert>
          <Typography>
            {t(
              "admin.rollback.confirmation",
              "Are you sure you want to perform an emergency rollback? This will:"
            )}
          </Typography>
          <ul>
            <li>
              {t(
                "admin.rollback.disableFeatures",
                "Disable all enhanced features"
              )}
            </li>
            <li>{t("admin.rollback.revertPhase", "Revert to pilot phase")}</li>
            <li>
              {t("admin.rollback.maintainData", "Maintain all existing data")}
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRollbackDialog(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleEmergencyRollback}
            color="error"
            variant="contained"
            disabled={rollbackInProgress}
          >
            {rollbackInProgress
              ? t("admin.rollback.inProgress", "Rolling Back...")
              : t("admin.rollback.confirm", "Confirm Rollback")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolloutMonitoringDashboard;
