import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";

const RecentActivitySection = ({ activities }) => {
  const theme = useTheme();

  const defaultActivities = [
    {
      id: 1,
      studentName: "Alex Johnson",
      initials: "AJ",
      action: 'completed "Advanced React Concepts"',
      time: "2 minutes ago",
      status: "Completed",
      statusColor: "success",
      avatarColor: theme.palette.primary.main,
      avatarBgColor: theme.palette.primary.light + "20",
    },
    {
      id: 2,
      studentName: "Sarah Miller",
      initials: "SM",
      action: "scored 95% on Python Quiz #3",
      time: "15 minutes ago",
      status: "High Score",
      statusColor: "warning",
      avatarColor: theme.palette.success.main,
      avatarBgColor: theme.palette.success.light + "20",
    },
    {
      id: 3,
      studentName: "Mike Rodriguez",
      initials: "MR",
      action: 'started "Database Design Fundamentals"',
      time: "1 hour ago",
      status: "Started",
      statusColor: "info",
      avatarColor: theme.palette.secondary.main,
      avatarBgColor: theme.palette.secondary.light + "20",
    },
    {
      id: 4,
      studentName: "Emily Wilson",
      initials: "EW",
      action: "submitted final project for Web Development",
      time: "3 hours ago",
      status: "Submitted",
      statusColor: "secondary",
      avatarColor: theme.palette.warning.main,
      avatarBgColor: theme.palette.warning.light + "20",
    },
  ];

  const activityData = activities || defaultActivities;

  const getStatusColor = (statusColor) => {
    switch (statusColor) {
      case "success":
        return {
          backgroundColor: theme.palette.success.light + "20",
          color: theme.palette.success.dark,
        };
      case "warning":
        return {
          backgroundColor: theme.palette.warning.light + "20",
          color: theme.palette.warning.dark,
        };
      case "info":
        return {
          backgroundColor: theme.palette.info.light + "20",
          color: theme.palette.info.dark,
        };
      case "secondary":
        return {
          backgroundColor: theme.palette.secondary.light + "20",
          color: theme.palette.secondary.dark,
        };
      default:
        return {
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.grey[700],
        };
    }
  };

  return (
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
          sx={{ mb: 3, color: theme.palette.grey[900] }}
        >
          Recent Student Activity
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {activityData.map((activity) => (
            <Box
              key={activity.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.grey[50],
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: activity.avatarBgColor,
                  color: activity.avatarColor,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {activity.initials}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight="500"
                  sx={{ color: theme.palette.grey[900], mb: 0.5 }}
                >
                  {activity.studentName} {activity.action}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.grey[600] }}
                >
                  {activity.time}
                </Typography>
              </Box>

              <Chip
                label={activity.status}
                size="small"
                sx={{
                  ...getStatusColor(activity.statusColor),
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentActivitySection;
