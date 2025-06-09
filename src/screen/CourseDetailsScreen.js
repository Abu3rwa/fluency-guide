import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../frebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import CreateLessonScreen from "../components/CreateLessonForm";
import CreateQuizForm from "../components/CreateQuizForm";
import CustomSpinner from "../components/CustomSpinner";
import "./courseDetails.css";

const CourseDetailsScreen = () => {
  const id = window.location.pathname.split("/").pop();
  const navigate = useNavigate();

  // State management
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch course and lessons data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseDoc, lessonsSnapshot] = await Promise.all([
          getDoc(doc(db, "courses", id)),
          getDocs(
            query(
              collection(db, "english_lessons"),
              where("courseId", "==", id)
            )
          ),
        ]);

        if (!courseDoc.exists()) {
          throw new Error("Course not found");
        }

        setCourse({ id: courseDoc.id, ...courseDoc.data() });
        setLessons(
          lessonsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handlers
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = (type, item) => {
    setDeleteType(type);
    setItemToDelete(item);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === "course") {
        await deleteDoc(doc(db, "courses", id));
        navigate("/courses/all");
      } else if (deleteType === "lesson") {
        await deleteDoc(doc(db, "english_lessons", itemToDelete.id));
        setLessons((prev) =>
          prev.filter((lesson) => lesson.id !== itemToDelete.id)
        );
      }
    } catch (err) {
      setError("Failed to delete item");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  if (loading) return <CustomSpinner />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!course) return <Alert severity="warning">Course not found</Alert>;

  return (
    <Box className="course-details-container">
      {/* Only show course header when not adding lesson/quiz */}
      {!showAddLesson && !showAddQuiz && (
        <>
          {/* Course Header */}
          <Card className="course-header">
            <Grid container>
              <Grid item xs={12} md={4}>
                <CardMedia
                  component="img"
                  image={course.image}
                  alt={course.title}
                  className="course-image"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <CardContent className="course-info">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" className="course-title">
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="course-description"
                      >
                        {course.description}
                      </Typography>
                      <Box className="course-meta">
                        <Chip
                          label={course.published ? "Published" : "Draft"}
                          color={course.published ? "success" : "default"}
                        />
                        <Chip
                          label={`${lessons.length} Lessons`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <IconButton onClick={handleMenuOpen}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>

          {/* Course Actions Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                setShowAddLesson(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Lesson</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setShowAddQuiz(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <QuizIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Quiz</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => handleDeleteClick("course", course)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Course</ListItemText>
            </MenuItem>
          </Menu>

          {/* Main Content Area */}
          <Grid container spacing={3}>
            {/* Lessons List */}
            <Grid item xs={12}>
              <Paper className="lessons-container">
                <Box className="lessons-header">
                  <Typography variant="h6">Course Lessons</Typography>
                  {!showAddLesson && !showAddQuiz && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowAddLesson(true)}
                    >
                      Add Lesson
                    </Button>
                  )}
                </Box>

                {lessons.length === 0 ? (
                  <Box className="empty-lessons">
                    <SchoolIcon className="empty-lessons-icon" />
                    <Typography variant="h6">No lessons added yet</Typography>
                    <Typography variant="body2">
                      Start by adding your first lesson
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {lessons.map((lesson, index) => (
                      <Paper key={lesson.id} className="lesson-item">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Typography className="lesson-number">
                            {index + 1}.
                          </Typography>
                          <Typography variant="subtitle1">
                            {lesson.title}
                          </Typography>
                        </Box>
                        <Box className="lesson-actions">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/lessons/${lesson.id}`)}
                          >
                            View
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick("lesson", lesson)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {/* Add Lesson/Quiz Form - Centered when active */}
      {(showAddLesson || showAddQuiz) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: "100vh",
            padding: { xs: 2, sm: 4, md: 6 },
            backgroundColor: "#f5f5f5",
          }}
        >
          <Paper
            className="form-container"
            sx={{
              width: "100%",
              maxWidth: "800px",
              padding: { xs: 2, sm: 3, md: 4 },
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              backgroundColor: "white",
            }}
          >
            <Box
              className="form-header"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 3,
                paddingBottom: 2,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                {showAddLesson ? "Add New Lesson" : "Add New Quiz"}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowAddLesson(false);
                  setShowAddQuiz(false);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
            {showAddLesson ? (
              <CreateLessonScreen
                addLesson={showAddLesson}
                setAddLesson={setShowAddLesson}
              />
            ) : (
              <CreateQuizForm />
            )}
          </Paper>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete {deleteType === "course" ? "Course" : "Lesson"}?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteType}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailsScreen;
