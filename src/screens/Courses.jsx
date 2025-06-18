import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { db } from "../firebase";
import { useUser } from "../contexts/UserContext";
import CourseDialog from "../components/CourseDialog";
import LessonDialog from "../components/LessonDialog";
import courseService from "../services/courseService";

// Styled components
const AnimatedCard = motion(Card);
const AnimatedContainer = motion(Container);
const AnimatedDialog = motion(Dialog);

const Courses = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applicationNote, setApplicationNote] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { user: currentUser } = useUser();
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openLessonDialog, setOpenLessonDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isCreatingDummy, setIsCreatingDummy] = useState(false);
  const [success, setSuccess] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      y: -8,
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const dialogVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setNotification({
        open: true,
        message: "Error fetching courses. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });

      if (currentUser) {
        const userRef = collection(db, "users");
        await addDoc(userRef, {
          userId: currentUser.uid,
          fcmToken: token,
          updatedAt: serverTimestamp(),
        });
      }

      return token;
    } catch (err) {
      console.error("Error getting notification token:", err);
      return null;
    }
  };

  const handleApplyClick = (course) => {
    setSelectedCourse(course);
    setApplyDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setApplyDialogOpen(false);
    setSelectedCourse(null);
    setApplicationNote("");
  };

  const handleSubmitApplication = async () => {
    if (!currentUser) {
      setNotification({
        open: true,
        message: "Please log in to apply for courses",
        severity: "error",
      });
      return;
    }

    try {
      const token = await requestNotificationPermission();

      await addDoc(collection(db, "applications"), {
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        studentId: currentUser.uid,
        studentEmail: currentUser.email,
        note: applicationNote,
        status: "pending",
        createdAt: serverTimestamp(),
        fcmToken: token,
      });

      setNotification({
        open: true,
        message: "Application submitted successfully!",
        severity: "success",
      });
      handleCloseDialog();
    } catch (err) {
      console.error("Error submitting application:", err);
      setNotification({
        open: true,
        message: "Failed to submit application. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      await courseService.createCourse(courseData);
      setSuccess("Course created successfully");
      fetchCourses();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateLesson = async (lessonData) => {
    try {
      await courseService.createLesson(lessonData);
      setSuccess("Lesson created successfully");
      fetchCourses();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddLesson = (courseId) => {
    setSelectedCourseId(courseId);
    setOpenLessonDialog(true);
  };

  const handleCreateDummyCourses = async () => {
    try {
      setIsCreatingDummy(true);
      await courseService.createDummyCourses();
      setNotification({
        open: true,
        message: "Dummy courses created successfully!",
        severity: "success",
      });
      // Refresh the courses list
      fetchCourses();
    } catch (error) {
      console.error("Error creating dummy courses:", error);
      setNotification({
        open: true,
        message: "Error creating dummy courses. Please try again.",
        severity: "error",
      });
    } finally {
      setIsCreatingDummy(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
        <Typography sx={{ ml: 2 }}>{t("courses.screen.loading")}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {t("courses.screen.error")}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t("courses.screen.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("courses.screen.subtitle")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCreateDummyCourses}
            disabled={isCreatingDummy}
            startIcon={
              isCreatingDummy ? <CircularProgress size={20} /> : <AddIcon />
            }
          >
            {isCreatingDummy ? "Creating..." : "Create Dummy Courses"}
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenCourseDialog(true)}
            startIcon={<AddIcon />}
          >
            {t("courses.screen.createCourse")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {course.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Level:</Typography>
                  <Typography variant="body2" color="primary">
                    {course.level}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Duration:</Typography>
                  <Typography variant="body2">{course.duration}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2">Students:</Typography>
                  <Typography variant="body2">{course.maxStudents}</Typography>
                </Box>
              </CardContent>
              <CardActions
                sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
              >
                <Box>
                  <Tooltip title="Edit Course">
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Course">
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Tooltip title="Add Lesson">
                  <IconButton
                    color="primary"
                    onClick={() => handleAddLesson(course.id)}
                  >
                    <AddCircleIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CourseDialog
        open={openCourseDialog}
        onClose={() => setOpenCourseDialog(false)}
        onSave={handleCreateCourse}
      />

      <AnimatePresence>
        {applyDialogOpen && (
          <AnimatedDialog
            open={applyDialogOpen}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            PaperProps={{
              sx: {
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              },
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ color: theme.palette.primary.main }}
                >
                  {t("courses.screen.apply.title")}
                </Typography>
                <IconButton onClick={handleCloseDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("courses.screen.apply.description")}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder={t("courses.screen.apply.notePlaceholder")}
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
                sx={{ mt: 2 }}
                variant="outlined"
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={handleCloseDialog}
                sx={{ color: theme.palette.text.secondary }}
              >
                {t("courses.screen.apply.cancel")}
              </Button>
              <Button
                onClick={handleSubmitApplication}
                variant="contained"
                disabled={!applicationNote.trim()}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  color: "white",
                  "&:hover": {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                  },
                }}
              >
                {t("courses.screen.apply.submit")}
              </Button>
            </DialogActions>
          </AnimatedDialog>
        )}
      </AnimatePresence>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {notification.message === "Please log in to apply for courses"
            ? t("courses.screen.apply.loginRequired")
            : notification.message === "Application submitted successfully!"
            ? t("courses.screen.apply.success")
            : t("courses.screen.apply.error")}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Courses;
