import React from "react";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import {
  Container,
  Box,
  Alert,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Fade,
  Slide,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../contexts/ThemeContext";

// Import custom hook and modular components
import { useCourseDetails } from "../hooks/useCourseDetails";
import CourseHeader from "../components/course/CourseHeader";
import CourseOverview from "../components/course/CourseOverview";
import CourseDetailsTabs from "../components/course/CourseDetailsTabs";
import CourseOverviewTab from "../components/course/CourseOverviewTab";
import ModuleSection from "../components/course/ModuleSection";
import CourseLessonsTab from "../components/course/CourseLessonsTab";
import CourseAnalyticsTab from "../components/course/CourseAnalyticsTab";
import CourseDialogsContainer from "../components/course/CourseDialogsContainer";

/**
 * CourseDetailsScreen - Refactored modular course management screen
 * Reduced from 1275 to ~150 lines by using custom hooks and modular components
 */
const CourseDetailsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Use custom hook for all state and business logic
  const {
    course,
    modules,
    tasks,
    studentProgress,
    moduleLessons,
    sortedLessons,
    loading,
    loadingTasks,
    submitting,
    error,
    // Dialog states
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen,
    shareDialogOpen,
    setShareDialogOpen,
    validationDialogOpen,
    setValidationDialogOpen,
    createModuleOpen,
    setCreateModuleOpen,
    createLessonOpen,
    setCreateLessonOpen,
    taskDialogOpen,
    setTaskDialogOpen,
    // Selection states
    activeTab,
    selectedModuleId,
    setSelectedModuleId,
    selectedLesson,
    setSelectedLesson,
    selectedTask,
    setSelectedTask,
    editingLesson,
    setEditingLesson,
    // Filter states
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
    // Other states
    validationResults,
    courseId,
    // Handlers
    handleTabChange,
    handleDeleteCourse,
    handleEditCourse,
    handlePublishToggle,
    handleExportCourse,
    handleImportContent,
    handleCreateModule,
    handleUpdateModule,
    handleDeleteModule,
    handleCreateLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleLessonStatusChange,
    handleDeleteTask,
    handleTaskStatusChange,
    debugTasksWithEmptyIds,
  } = useCourseDetails();

  // Loading state
  if (loading) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: { xs: 2, md: 4 }, 
          mb: { xs: 2, md: 4 },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        <Fade in={loading}>
          <Paper 
            elevation={3}
            sx={{
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              minHeight: "60vh",
              borderRadius: 3,
              background: mode === "dark" 
                ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[800]} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
            }}
          >
            <Box textAlign="center">
              <CircularProgress 
                size={60}
                thickness={4}
                sx={{ 
                  color: theme.palette.primary.main,
                  mb: 2
                }} 
              />
            </Box>
          </Paper>
        </Fade>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: { xs: 2, md: 4 }, 
          mb: { xs: 2, md: 4 },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        <Slide direction="up" in={!!error}>
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              textAlign: "center"
            }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              {error}
            </Alert>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/courses")}
              variant="contained"
              size={isMobile ? "medium" : "large"}
              sx={{ 
                borderRadius: 2,
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 }
              }}
            >
              {t("courseDetails.backToCourses")}
            </Button>
          </Paper>
        </Slide>
      </Container>
    );
  }

  // Course not found state
  if (!course) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: { xs: 2, md: 4 }, 
          mb: { xs: 2, md: 4 },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        <Slide direction="up" in={!course}>
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              textAlign: "center"
            }}
          >
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              {t("courseDetails.courseNotFound")}
            </Alert>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/courses")}
              variant="contained"
              size={isMobile ? "medium" : "large"}
              sx={{ 
                borderRadius: 2,
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 }
              }}
            >
              {t("courseDetails.backToCourses")}
            </Button>
          </Paper>
        </Slide>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        background: mode === "dark"
          ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Course Header */}
        <Fade in timeout={600}>
          <Box>
            <CourseHeader
              course={course}
              onBack={() => navigate("/courses")}
              onPublishToggle={handlePublishToggle}
              onEdit={() => setEditDialogOpen(true)}
              onImport={() => handleImportContent()}
              onExport={handleExportCourse}
              onPreview={() => setPreviewDialogOpen(true)}
              onShare={() => setShareDialogOpen(true)}
              onDelete={() => setDeleteDialogOpen(true)}
            />
          </Box>
        </Fade>

        {/* Debug Button */}
        {process.env.NODE_ENV === "development" && (
          <Fade in timeout={800}>
            <Box sx={{ 
              mb: { xs: 2, md: 3 }, 
              display: "flex", 
              justifyContent: "flex-end" 
            }}>
              <Button
                variant="outlined"
                size="small"
                color="warning"
                onClick={debugTasksWithEmptyIds}
                sx={{ 
                  fontSize: "0.75rem",
                  borderRadius: 2,
                  px: 2
                }}
              >
                Debug: Check Empty ID Tasks
              </Button>
            </Box>
          </Fade>
        )}

        {/* Course Overview */}
        <Slide direction="up" in timeout={1000}>
          <Box mb={{ xs: 3, md: 4 }}>
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              <Grid item xs={12} lg={8}>
                <Paper 
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    background: mode === "dark"
                      ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[800]} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                    transition: "all 0.3s ease-in-out",
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CourseOverview course={course} />
                </Paper>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Paper 
                  elevation={4}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    height: "100%",
                    background: mode === "dark"
                      ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                    transition: "all 0.3s ease-in-out",
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-2px)'
                    },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    minHeight: { xs: "150px", md: "200px" }
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: mode === "dark" ? theme.palette.grey[800] : theme.palette.primary.main,
                      color: mode === "dark" ? theme.palette.text.primary : theme.palette.primary.contrastText,
                      mb: 2,
                      minWidth: "80px",
                      minHeight: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: "bold"
                    }}
                  >
                    {course?.modules?.length || 0}
                  </Box>
                  <Box sx={{ typography: "h6", fontWeight: "bold", mb: 1 }}>
                    Total Modules
                  </Box>
                  <Box sx={{ typography: "body2", color: "text.secondary" }}>
                    Course Progress: {course?.isPublished ? "Published" : "Draft"}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Slide>

        {/* Course Details Tabs */}
        <Slide direction="up" in timeout={1200}>
          <Paper 
            elevation={4}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              background: mode === "dark" ? theme.palette.grey[800] : theme.palette.background.paper,
              mb: { xs: 2, md: 4 }
            }}
          >
            <CourseDetailsTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              theme={theme}
              isMobile={isMobile}
            >
              {/* Tab Content */}
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Fade in key={activeTab} timeout={500}>
                  <Box>
                    {activeTab === 0 && (
                      <CourseOverviewTab
                        modules={modules}
                        theme={theme}
                        onCreateModule={() => setCreateModuleOpen(true)}
                        onDeleteModule={handleDeleteModule}
                      />
                    )}

                    {activeTab === 1 && (
                      <ModuleSection
                        modules={modules}
                        onDelete={handleDeleteModule}
                        onCreate={() => setCreateModuleOpen(true)}
                        onUpdateModule={handleUpdateModule}
                      />
                    )}

                    {activeTab === 2 && (
                      <CourseLessonsTab
                        theme={theme}
                        modules={modules}
                        selectedModuleId={selectedModuleId}
                        setSelectedModuleId={setSelectedModuleId}
                        sortedLessons={sortedLessons}
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
                        onDeleteLesson={handleDeleteLesson}
                        onUpdateLesson={(lesson) => {
                          setEditingLesson(lesson);
                          setCreateLessonOpen(true);
                        }}
                        onStatusChange={handleLessonStatusChange}
                        onCreate={() => setCreateLessonOpen(true)}
                        courseId={courseId}
                        moduleLessons={moduleLessons}
                        setSelectedLesson={setSelectedLesson}
                        tasks={tasks}
                        loadingTasks={loadingTasks}
                        onCreateTask={() => {
                          setSelectedTask(null);
                          setTaskDialogOpen(true);
                        }}
                        onEditTask={(task) => {
                          setSelectedTask(task);
                          setTaskDialogOpen(true);
                        }}
                        onDeleteTask={handleDeleteTask}
                        onTaskStatusChange={handleTaskStatusChange}
                      />
                    )}

                    {activeTab === 3 && (
                      <CourseAnalyticsTab theme={theme} studentProgress={studentProgress} />
                    )}
                  </Box>
                </Fade>
              </Box>
            </CourseDetailsTabs>
          </Paper>
        </Slide>

        {/* All Dialogs */}
        <CourseDialogsContainer
          editDialogOpen={editDialogOpen}
          setEditDialogOpen={setEditDialogOpen}
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          validationDialogOpen={validationDialogOpen}
          setValidationDialogOpen={setValidationDialogOpen}
          previewDialogOpen={previewDialogOpen}
          setPreviewDialogOpen={setPreviewDialogOpen}
          shareDialogOpen={shareDialogOpen}
          setShareDialogOpen={setShareDialogOpen}
          createLessonOpen={createLessonOpen}
          setCreateLessonOpen={setCreateLessonOpen}
          createModuleOpen={createModuleOpen}
          setCreateModuleOpen={setCreateModuleOpen}
          taskDialogOpen={taskDialogOpen}
          setTaskDialogOpen={setTaskDialogOpen}
          course={course}
          validationResults={validationResults}
          editingLesson={editingLesson}
          setEditingLesson={setEditingLesson}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          selectedLesson={selectedLesson}
          setSelectedLesson={setSelectedLesson}
          courseId={courseId}
          selectedModuleId={selectedModuleId}
          handleEditCourse={handleEditCourse}
          handleDeleteCourse={handleDeleteCourse}
          handleCreateLesson={handleCreateLesson}
          handleUpdateLesson={handleUpdateLesson}
          handleCreateModule={handleCreateModule}
          submitting={submitting}
          isMobile={isMobile}
          theme={theme}
        />
      </Container>
    </Box>
  );
};

export default CourseDetailsScreen;