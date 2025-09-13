import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import LessonSection from "./LessonSection";
import TasksTable from "../tasks/TasksTable";

/**
 * CourseLessonsTab - Lessons tab content for CourseDetailsScreen
 * Handles lesson filtering, management, and task display
 */
const CourseLessonsTab = ({
  theme,
  modules,
  selectedModuleId,
  setSelectedModuleId,
  sortedLessons,
  searchQuery,
  setSearchQuery,
  filterAnchorEl,
  setFilterAnchorEl,
  sortAnchorEl,
  setSortAnchorEl,
  selectedStatus,
  setSelectedStatus,
  selectedSort,
  setSelectedSort,
  menuAnchorEl,
  setMenuAnchorEl,
  selectedLesson,
  onDeleteLesson,
  onUpdateLesson,
  onStatusChange,
  onCreate,
  courseId,
  moduleLessons,
  setSelectedLesson,
  tasks,
  loadingTasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onTaskStatusChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Module Filter Dropdown */}
      <Box
        mb={2}
        display="flex"
        alignItems="center"
        gap={2}
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: theme.palette.text.primary }}
        >
          {t("courseDetails.modules")}
        </Typography>
        <FormControl
          size="small"
          sx={{
            minWidth: { xs: "100%", sm: 200 },
            width: { xs: "100%", sm: "auto" },
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.palette.background.paper,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        >
          <InputLabel id="module-filter-label">
            {t("courseDetails.selectModule")}
          </InputLabel>
          <Select
            labelId="module-filter-label"
            value={selectedModuleId || (modules[0] && modules[0].id) || ""}
            label={t("courseDetails.selectModule")}
            onChange={(e) => setSelectedModuleId(e.target.value)}
          >
            {modules.map((module) => (
              <MenuItem key={module.id} value={module.id}>
                {module.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lessons Section */}
      <LessonSection
        lessons={sortedLessons}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterAnchorEl={filterAnchorEl}
        setFilterAnchorEl={setFilterAnchorEl}
        sortAnchorEl={sortAnchorEl}
        setSortAnchorEl={setSortAnchorEl}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        menuAnchorEl={menuAnchorEl}
        setMenuAnchorEl={setMenuAnchorEl}
        selectedLesson={selectedLesson}
        onDeleteLesson={onDeleteLesson}
        onUpdateLesson={onUpdateLesson}
        onStatusChange={onStatusChange}
        onCreate={onCreate}
        courseId={courseId}
        moduleId={selectedModuleId}
      />

      {/* Tasks Section */}
      {selectedModuleId && moduleLessons.length > 0 && (
        <Box mt={4}>
          {/* Lesson Filter Dropdown */}
          <Box
            mb={2}
            display="flex"
            alignItems="center"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.text.primary }}
            >
              {t("courseDetails.lessons")}
            </Typography>
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 200 },
                width: { xs: "100%", sm: "auto" },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: theme.palette.background.paper,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              <InputLabel id="lesson-filter-label">
                {t("courseDetails.selectLesson")}
              </InputLabel>
              <Select
                labelId="lesson-filter-label"
                value={selectedLesson?.id || moduleLessons[0]?.id || ""}
                label={t("courseDetails.selectLesson")}
                onChange={(e) => {
                  const lesson = moduleLessons.find(
                    (l) => l.id === e.target.value
                  );
                  setSelectedLesson(lesson);
                }}
              >
                {moduleLessons.map((lesson) => (
                  <MenuItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Tasks Display */}
          {selectedLesson && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={{ xs: 2, sm: 0 }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {t("courseDetails.tasksForLesson", {
                    count: tasks.length,
                  })}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onCreateTask}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {t("courseDetails.createTask")}
                </Button>
              </Box>
              {loadingTasks ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress
                    sx={{ color: theme.palette.primary.main }}
                  />
                </Box>
              ) : (
                <TasksTable
                  tasks={tasks}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onStatusChange={onTaskStatusChange}
                />
              )}
            </>
          )}
        </Box>
      )}
    </>
  );
};

export default CourseLessonsTab;