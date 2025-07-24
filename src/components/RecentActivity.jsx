import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useCustomTheme } from "../contexts/ThemeContext";

const RecentActivity = ({ activities = [] }) => {
  const { theme } = useCustomTheme();

  return (
    <Card>
      <CardHeader title="Recent Activity" />
      <CardContent>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id} sx={{ px: 0 }}>
              <ListItemIcon>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  {activity.type === "course" ? (
                    <SchoolIcon />
                  ) : activity.type === "assignment" ? (
                    <AssignmentIcon />
                  ) : (
                    <PersonIcon />
                  )}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={activity.title}
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                    <Chip
                      label={activity.time}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
