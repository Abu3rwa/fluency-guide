import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Typography,
  Box,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StudentProgressList = ({ students }) => {
  const { t } = useTranslation();

  if (!students || students.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="text.secondary">
          {t("courses.progress.noProgress")}
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {students.map((student) => (
        <ListItem key={student.id} divider>
          <ListItemAvatar>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={student.name}
            secondary={
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t("courses.progress.completion")}: {student.completionRate}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={student.completionRate}
                  sx={{ mt: 1 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {t("courses.progress.lastActivity")}: {student.lastActivity}
                </Typography>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default StudentProgressList;
