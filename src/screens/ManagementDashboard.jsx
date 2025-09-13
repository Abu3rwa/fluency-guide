import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Container,
  Paper,
  Fade,
  Slide,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../contexts/ThemeContext";
import CourseDialog from "../components/course/CourseDialog";
import CreateLessonForm from "../components/CreateLessonForm";
import ManagementSearchBar from "../components/content-management/ManagementSearchBar";
import ManagementTable from "../components/content-management/ManagementTable";
import ManagementMenu from "../components/content-management/ManagementMenu";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import PaymentsTable from "../components/PaymentsTable";
import CenteredLoader from "../components/CenteredLoader";
import useManagementDashboard from "./management-dashboard/hooks/useManagementDashboard";

const ManagementDashboard = () => {
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    loading,
    submitting,
    menuAnchor,
    menuItem,
    deleteDialog,
    setDeleteDialog,
    dialogConfig,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    handleMenuOpen,
    handleMenuClose,
    openDialog,
    closeDialog,
    handleDialogSubmit,
    handlePublish,
    handleDeleteConfirm,
    getStatusColor,
    filteredData,
    resourceDefs,
    activeResource,
    courses,
  } = useManagementDashboard();

  // Lesson form states
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [updateLessonOpen, setUpdateLessonOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Lesson handling functions
  const handleCreateLesson = async (lessonData) => {
    try {
      // Implementation for creating lesson
      console.log("Creating lesson:", lessonData);
      resetLessonForms();
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleUpdateLesson = async (lessonData) => {
    try {
      // Get the lesson ID from the selected lesson
      const lessonId = selectedLesson?.id;
      if (!lessonId) {
        throw new Error("Lesson ID is required for updates");
      }

      console.log("Updating lesson with ID:", lessonId);
      console.log("Update data:", lessonData);

      // Import and use the updateLesson service
      const { updateLesson } = await import("../services/lessonService");
      const updatedLesson = await updateLesson(lessonId, lessonData);

      console.log("Lesson updated successfully:", updatedLesson);
      resetLessonForms();

      // Optionally refresh the data or show success message
      return updatedLesson;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const resetLessonForms = () => {
    setCreateLessonOpen(false);
    setUpdateLessonOpen(false);
    setSelectedLesson(null);
  };

  const openCreateLesson = (courseId, moduleId) => {
    setSelectedLesson({ courseId, moduleId });
    setCreateLessonOpen(true);
  };

  const openUpdateLesson = (lesson) => {
    setSelectedLesson(lesson);
    setUpdateLessonOpen(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          background: mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth="xl">
          <Fade in={loading}>
            <Paper 
              elevation={6}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                background: mode === "dark"
                  ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[800]} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                textAlign: "center"
              }}
            >
              <CenteredLoader
                type="skeleton"
                message="Loading management dashboard..."
                skeletonCount={5}
                skeletonHeight={24}
                minHeight="400px"
                fullScreen={false}
              />
            </Paper>
          </Fade>
        </Container>
      </Box>
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
        {/* Dashboard Header */}
        <Fade in timeout={600}>
          <Paper
            elevation={6}
            sx={{
              mb: { xs: 3, md: 4 },
              p: { xs: 2, sm: 3, md: 4 },
              background: mode === "dark"
                ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: mode === "dark"
                  ? `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
                  : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }
            }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: mode === "dark"
                  ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
                  : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              Management Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 1,
                color: theme.palette.text.secondary,
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              Manage courses, lessons, and track platform activity
            </Typography>
          </Paper>
        </Fade>

        {/* Search Bar Section */}
        <Slide direction="up" in timeout={800}>
          <Paper
            elevation={4}
            sx={{
              mb: { xs: 3, md: 4 },
              borderRadius: 3,
              overflow: "hidden",
              background: mode === "dark" ? theme.palette.grey[800] : theme.palette.background.paper,
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <ManagementSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
            </Box>
          </Paper>
        </Slide>

        {/* Main Content Table */}
        <Slide direction="up" in timeout={1000}>
          <Paper
            elevation={4}
            sx={{
              mb: { xs: 3, md: 4 },
              borderRadius: 3,
              overflow: "hidden",
              background: mode === "dark" ? theme.palette.grey[800] : theme.palette.background.paper,
            }}
          >
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              <ManagementTable
                resourceDefs={resourceDefs}
                activeResource={activeResource}
                openDialog={openDialog}
                filteredData={filteredData}
                handleMenuOpen={handleMenuOpen}
                getStatusColor={getStatusColor}
                courses={courses}
                loading={loading}
              />
            </Box>
          </Paper>
        </Slide>

        {/* Payments Section */}
        <Slide direction="up" in timeout={1200}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              background: mode === "dark" ? theme.palette.grey[800] : theme.palette.background.paper,
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                💳 Pending Payments
              </Typography>
              <PaymentsTable />
            </Box>
          </Paper>
        </Slide>
      </Container>

      {/* Dialogs and Menus */}
      <ManagementMenu
        menuAnchor={menuAnchor}
        menuItem={menuItem}
        handleMenuClose={handleMenuClose}
        openDialog={openDialog}
        activeResource={activeResource}
        setDeleteDialog={setDeleteDialog}
        handlePublish={handlePublish}
        openCreateLesson={openCreateLesson}
        openUpdateLesson={openUpdateLesson}
      />

      <CourseDialog
        open={dialogConfig.open}
        onClose={closeDialog}
        mode={dialogConfig.mode}
        initialData={dialogConfig.formData}
        onSave={handleDialogSubmit}
        loading={submitting}
      />

      <CreateLessonForm
        open={createLessonOpen}
        onClose={resetLessonForms}
        onSubmit={handleCreateLesson}
        courseId={selectedLesson?.courseId}
        moduleId={selectedLesson?.moduleId}
        dialogTitle="Create New Lesson"
        submitLabel="Create Lesson"
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "", item: null })}
        onConfirm={handleDeleteConfirm}
        item={deleteDialog}
        submitting={submitting}
      />
    </Box>
  );
};

export default ManagementDashboard;
