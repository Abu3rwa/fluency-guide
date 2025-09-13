import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import CourseDialog from "./CourseDialog";
import ContentValidationDialog from "../ContentValidationDialog";
import CoursePreviewDialog from "./CoursePreviewDialog";
import ShareCourseDialog from "./ShareCourseDialog";
import CreateLessonForm from "../CreateLessonForm";
import UpdateLessonForm from "../UpdateLessonForm";
import CreateModuleForm from "../CreateModuleForm";
import TaskFormTabs from "../tasks/TaskFormTabs";

/**
 * CourseDialogsContainer - Manages all dialogs for CourseDetailsScreen
 * Centralizes dialog management to reduce main component complexity
 */
const CourseDialogsContainer = ({
  // Dialog states
  editDialogOpen,
  setEditDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  validationDialogOpen,
  setValidationDialogOpen,
  previewDialogOpen,
  setPreviewDialogOpen,
  shareDialogOpen,
  setShareDialogOpen,
  createLessonOpen,
  setCreateLessonOpen,
  createModuleOpen,
  setCreateModuleOpen,
  taskDialogOpen,
  setTaskDialogOpen,

  // Data
  course,
  validationResults,
  editingLesson,
  setEditingLesson,
  selectedTask,
  setSelectedTask,
  selectedLesson,
  setSelectedLesson,
  courseId,
  selectedModuleId,

  // Handlers
  handleEditCourse,
  handleDeleteCourse,
  handleCreateLesson,
  handleUpdateLesson,
  handleCreateModule,

  // Other props
  submitting,
  isMobile,
  theme,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Course Edit Dialog */}
      <CourseDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditCourse}
        initialData={course}
        mode="edit"
      />

      {/* Course Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-course-dialog-title"
        aria-describedby="delete-course-dialog-description"
      >
        <DialogTitle id="delete-course-dialog-title">
          {t("courseDetails.deleteLesson")}
        </DialogTitle>
        <DialogContent id="delete-course-dialog-description">
          <Typography>{t("courseDetails.deleteLessonConfirmation")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={submitting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => {
              handleDeleteCourse();
              setDeleteDialogOpen(false);
            }}
            color="error"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t("common.delete")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Validation Dialog */}
      <ContentValidationDialog
        open={validationDialogOpen}
        onClose={() => setValidationDialogOpen(false)}
        validationResults={validationResults}
      />

      {/* Preview Dialog */}
      <CoursePreviewDialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        course={course}
      />

      {/* Share Dialog */}
      <ShareCourseDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        course={course}
      />

      {/* Create Lesson Dialog */}
      <CreateLessonForm
        open={createLessonOpen && !editingLesson}
        onClose={() => {
          setCreateLessonOpen(false);
          setEditingLesson(null);
        }}
        onSubmit={handleCreateLesson}
        courseId={courseId}
        moduleId={selectedModuleId}
        dialogTitle="Create New Lesson"
        submitLabel="Create Lesson"
      />

      {/* Update Lesson Dialog */}
      <UpdateLessonForm
        open={createLessonOpen && editingLesson !== null}
        onClose={() => {
          setCreateLessonOpen(false);
          setEditingLesson(null);
        }}
        onSubmit={handleUpdateLesson}
        lessonData={editingLesson}
        courseId={courseId}
        moduleId={selectedModuleId}
        dialogTitle="Edit Lesson"
        submitLabel="Update Lesson"
      />

      {/* Create Module Dialog */}
      <CreateModuleForm
        open={createModuleOpen}
        onClose={() => setCreateModuleOpen(false)}
        onSubmit={handleCreateModule}
        courseId={courseId}
      />

      {/* Task Dialog */}
      <Dialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setSelectedTask(null);
          setSelectedLesson(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="task-dialog-title"
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: isMobile ? 0 : theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[8],
            m: { xs: 0, md: 2 },
            height: { xs: "100%", md: "auto" },
          },
        }}
      >
        <DialogTitle id="task-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">
              {selectedTask
                ? t("courseDetails.editTask")
                : t("courseDetails.createTask")}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TaskFormTabs courseId={courseId} lessonId={selectedLesson?.id} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseDialogsContainer;