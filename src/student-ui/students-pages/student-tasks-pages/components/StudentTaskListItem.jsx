import React from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const StudentTaskListItem = ({ task, progress = 0 }) => {
  const { t } = useTranslation();

  // Get task type icon
  const getTaskTypeIcon = () => {
    switch (task.type) {
      case "multipleChoice":
        return <AssignmentIcon />;
      case "trueFalse":
        return <AssignmentIcon />;
      case "fillInBlanks":
        return <AssignmentIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  // Get task type label
  const getTaskTypeLabel = () => {
    switch (task.type) {
      case "multipleChoice":
        return t("tasks.types.multipleChoice");
      case "trueFalse":
        return t("tasks.types.trueFalse");
      case "fillInBlanks":
        return t("tasks.types.fillInBlanks");
      default:
        return t("tasks.types.task");
    }
  };

  return (
    <ListItem button component={Link} to={`/student/tasks/${task.id}`}>
      <ListItemIcon>{getTaskTypeIcon()}</ListItemIcon>
      <ListItemText primary={task.title} secondary={getTaskTypeLabel()} />
      <ListItemSecondaryAction>
        {progress === 100 ? (
          <Tooltip title={t("tasks.completed")}>
            <CheckCircleIcon color="success" />
          </Tooltip>
        ) : (
          <Tooltip title={t("tasks.start")}>
            <IconButton edge="end">
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
        )}
        <Chip label={`${progress}%`} size="small" sx={{ ml: 2 }} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default StudentTaskListItem;
