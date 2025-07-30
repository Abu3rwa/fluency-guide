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
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        {selectedTask ? "Edit Task" : "Create New Task"}
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
