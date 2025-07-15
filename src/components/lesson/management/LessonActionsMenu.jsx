import React from "react";
import { Menu, MenuItem } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const LessonActionsMenu = ({
  anchorEl,
  onClose,
  lesson,
  onDeleteClick,
  onEditClick, // new prop
  onAssignClick,
  onAnalyticsClick,
  onResourcesClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!lesson) {
    return null;
  }

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuItem onClick={() => navigate(`/lessons/${lesson.id}`)}>
        <VisibilityIcon sx={{ mr: 1 }} />
        {t("lessonManagement.actions.view")}
      </MenuItem>
      <MenuItem
        onClick={
          onEditClick
            ? () => onEditClick(lesson)
            : () => navigate(`/lessons/${lesson.id}/edit`)
        }
      >
        <EditIcon sx={{ mr: 1 }} />
        {t("lessonManagement.actions.edit")}
      </MenuItem>
      <MenuItem
        onClick={
          onAssignClick
            ? () => onAssignClick(lesson)
            : () => navigate(`/lessons/${lesson.id}/assign`)
        }
      >
        <AssignmentIcon sx={{ mr: 1 }} />
        {t("lessonManagement.actions.assign")}
      </MenuItem>
      <MenuItem
        onClick={
          onAnalyticsClick
            ? () => onAnalyticsClick(lesson)
            : () => navigate(`/lessons/${lesson.id}/analytics`)
        }
      >
        <BarChartIcon sx={{ mr: 1 }} />
        {t("lessonManagement.actions.analytics")}
      </MenuItem>
      <MenuItem
        onClick={
          onResourcesClick
            ? () => onResourcesClick(lesson)
            : () => navigate(`/lessons/${lesson.id}/resources`)
        }
      >
        <CloudUploadIcon sx={{ mr: 1 }} />
        {t("lessonManagement.actions.resources")}
      </MenuItem>
      <MenuItem onClick={onDeleteClick}>
        <DeleteIcon sx={{ mr: 1 }} />
        {t("lessonManagement.actions.delete")}
      </MenuItem>
    </Menu>
  );
};

export default LessonActionsMenu;
