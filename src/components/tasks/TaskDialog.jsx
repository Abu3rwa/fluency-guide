import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TaskFormTabs from "./TaskFormTabs";
import { useTranslation } from "react-i18next";

const TaskDialog = ({
  open,
  onClose,
  onSubmit,
  selectedTask,
  selectedLesson,
  courseId,
  lessonId,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="task-dialog-title"
    >
      <DialogTitle id="task-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6">
            {selectedTask ? t("tasks.editTask") : t("tasks.createTask")}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TaskFormTabs
          courseId={courseId}
          lessonId={lessonId}
          initialTask={selectedTask}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
