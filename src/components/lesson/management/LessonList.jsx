import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const getStatusColor = (status) => {
  switch (status) {
    case "published":
      return "success";
    case "draft":
      return "warning";
    case "archived":
      return "error";
    default:
      return "default";
  }
};

const LessonList = ({ lessons, onMenuClick }) => {
  const { t } = useTranslation();
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="lessons table">
        <TableHead>
          <TableRow>
            <TableCell>
              {t("lessonManagement.fields.title") || "Title"}
            </TableCell>

            <TableCell>
              {t("lessonManagement.fields.status") || "Status"}
            </TableCell>
            <TableCell>
              {t("lessonManagement.fields.duration") || "Duration"}
            </TableCell>
            <TableCell>
              {t("lessonManagement.fields.lastUpdated") || "Last Updated"}
            </TableCell>
            <TableCell align="right">
              {t("lessonManagement.fields.actions") || "Actions"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id} hover>
              <TableCell>
                <Typography variant="subtitle2">{lesson.title}</Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={
                    t(`lessonManagement.status.${lesson.status}`) ||
                    lesson.status
                  }
                  color={getStatusColor(lesson.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={`${lesson.duration} min`}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {lesson.updatedAt && lesson.updatedAt.toDate
                    ? lesson.updatedAt.toDate().toLocaleDateString()
                    : ""}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title={t("lessonManagement.actions.more") || "More"}>
                  <IconButton
                    size="small"
                    onClick={(e) => onMenuClick(e, lesson)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LessonList;
