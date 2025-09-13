import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import LockIcon from "@mui/icons-material/Lock";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../contexts/UserContext";
import { useCourseDetails } from "./hooks/useCourseDetails";
import { useCourseReviews } from "./hooks/useCourseReviews";
import {
  useCourseAccess,
  CourseAccessLevel,
} from "../../../hooks/useCourseAccess";
import { studentCoursePreviewService } from "../../../services/student-services/studentCoursePreviewService";
import StudentCourseDetailHeaderSection from "./components/StudentCourseDetailHeaderSection";
import StudentCourseDetailOverviewSection from "./components/StudentCourseDetailOverviewSection";
import StudentCourseDetailProgressStats from "./components/StudentCourseDetailProgressStats";
import StudentCourseDetailContentOutline from "./components/StudentCourseDetailContentOutline";
import StudentCourseDetailMaterialsDialog from "./components/StudentCourseDetailMaterialsDialog";
import StudentCourseDetailInstructorInfo from "./components/StudentCourseDetailInstructorInfo";
import StudentCourseDetailReviewsSection from "./components/StudentCourseDetailReviewsSection";
import StudentCourseDetailSupportDialog from "./components/StudentCourseDetailSupportDialog";
import StudentCourseDetailModuleList from "./components/StudentCourseDetailModuleList";
import PaymentDialog from "../../../components/PaymentDialog";
import EnrollmentPrompt from "../../../components/course-preview/EnrollmentPrompt";

// Preview Indicator Component
const PreviewIndicator = ({ type = "lesson" }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <PlayCircleOutlineIcon color="primary" fontSize="small" />
    <Typography variant="caption" color="primary" fontWeight={600}>
      PREVIEW
    </Typography>
  </Box>
);

// Locked Indicator Component
const LockedIndicator = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <LockIcon color="disabled" fontSize="small" />
    <Typography variant="caption" color="text.secondary">
      ENROLL TO UNLOCK
    </Typography>
  </Box>
);

// Course Progress Bar Component
const CourseProgressBar = ({ course, previewLessons, lessons, isEnrolled }) => {
  const totalLessons = lessons?.length || 0;
  const availableLessons = isEnrolled ? totalLessons : previewLessons;
  const progressPercentage =
    totalLessons > 0 ? (availableLessons / totalLessons) * 100 : 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {isEnrolled
          ? `Course Progress: ${availableLessons} of ${totalLessons} lessons available`
          : `Preview Mode: ${previewLessons} of ${totalLessons} lessons available`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

const StudentCourseDetailsPage = () => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const { userData } = useUser();

  // Use the custom hooks for data management
  const {
    course,
    modules,
    lessons,
    progress,
    achievements,
    loading,
    error,
    progressLoading,
    undoLoading,
    undoSuccess,
    isEnrolled,
    enrollmentStatus,
    courseId,
    handleProgressUpdate,
    handleLessonUndo,
    clearError,
    clearUndoSuccess,
  } = useCourseDetails();

  // Course access hook for preview functionality
  const {
    accessLevel,
    previewLessons,
    loading: accessLoading,
    error: accessError,
  } = useCourseAccess(courseId);

  // Debug logging
  console.log("Course Details Debug:", {
    courseId,
    isEnrolled,
    enrollmentStatus,
    accessLevel,
    previewLessons,
    hasCourse: !!course,
    hasLessons: !!lessons,
    lessonsCount: lessons?.length || 0,
    isAuthenticated: !!userData,
  });

  const { reviews, submitReview } = useCourseReviews(courseId);

  // Dialog state
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEnrollmentPrompt, setShowEnrollmentPrompt] = useState(false);

  // Track preview page view when not enrolled
  useEffect(() => {
    if (!isEnrolled && courseId) {
      studentCoursePreviewService.trackPreviewView(courseId, userData?.uid);
    }
  }, [isEnrolled, courseId, userData?.uid]);

  // Backend integration for enroll, progress, reviews
  const handleEnroll = () => {
    // Show payment dialog instead of direct enrollment
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = (result) => {
    // Handle successful payment
    setShowPaymentDialog(false);
    clearError();
    // Note: Enrollment status will be updated by the hook on next data fetch
  };

  // Preview functionality handlers with analytics tracking
  const handlePreviewEnroll = () => {
    // Track conversion step
    studentCoursePreviewService.trackConversionStep(
      "enrollment_prompt",
      courseId,
      userData?.uid
    );
    studentCoursePreviewService.trackPreviewInteraction(
      courseId,
      "enrollment_prompt",
      userData?.uid
    );
    setShowEnrollmentPrompt(true);
  };

  const handleLessonClick = (lesson, index) => {
    if (
      !isEnrolled &&
      !studentCoursePreviewService.isLessonPreviewable(index, previewLessons)
    ) {
      // Track locked lesson interaction
      studentCoursePreviewService.trackPreviewInteraction(
        courseId,
        "lesson_locked",
        userData?.uid
      );
      setShowEnrollmentPrompt(true);
    } else {
      // Track lesson interaction
      studentCoursePreviewService.trackPreviewInteraction(
        courseId,
        isEnrolled ? "lesson_watch" : "lesson_watch_preview",
        userData?.uid
      );
      // Navigate to lesson (this would be handled by the existing lesson navigation)
      console.log("Navigate to lesson:", lesson.id);
    }
  };

  const handleReviewSubmit = async (rating, reviewText) => {
    await submitReview(rating, reviewText);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          bgcolor: theme.palette.background.default,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show full course page for all users (enrolled and non-enrolled)
  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        py: { xs: 1, md: 4 },
        px: { xs: 0, sm: 2, md: 4 },
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        overflowX: "hidden",
      }}
    >
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={clearError}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}

      <StudentCourseDetailHeaderSection
        course={course}
        enrollmentStatus={enrollmentStatus}
      />

      {/* Progress Bar for non-enrolled users */}
      {!isEnrolled && (
        <Box sx={{ mb: 3 }}>
          <CourseProgressBar
            course={course}
            previewLessons={previewLessons}
            lessons={lessons}
            isEnrolled={isEnrolled}
          />
        </Box>
      )}

      <Grid container spacing={4} sx={{ mt: 4, px: 2 }}>
        <Grid item xs={12} md={8}>
          <StudentCourseDetailModuleList
            modules={modules}
            lessons={lessons}
            accessLevel={accessLevel}
            previewLessons={previewLessons}
            onLessonClick={handleLessonClick}
            isEnrolled={isEnrolled}
          />

          <StudentCourseDetailOverviewSection course={course} />
          <StudentCourseDetailProgressStats
            progress={progress}
            achievements={achievements}
            loading={progressLoading || undoLoading}
          />
          {/* <StudentCourseDetailContentOutline
            modules={modules}
            lessons={lessons}
            onLessonComplete={handleProgressUpdate}
            onLessonUndo={handleLessonUndo}
            user={userData}
            accessLevel={accessLevel}
            previewLessons={previewLessons}
            onLessonClick={handleLessonClick}
            isEnrolled={isEnrolled}
          /> */}
          <StudentCourseDetailReviewsSection
            courseId={courseId}
            user={userData}
            reviews={reviews}
            onSubmit={handleReviewSubmit}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            width: { xs: "100%", md: "300px" },
            maxWidth: { xs: "100%", md: "300px" },
            margin: { xs: "0 auto", md: "0" },
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{ mb: 2, width: "100%" }}
            onClick={() => setMaterialsOpen(true)}
          >
            {t("studentCourseDetails.page.viewMaterials")}
          </Button>
          <StudentCourseDetailMaterialsDialog
            open={materialsOpen}
            onClose={() => setMaterialsOpen(false)}
            materials={course?.courseMaterials || []}
            loading={loading}
          />
          <StudentCourseDetailInstructorInfo
            instructor={course?.instructor}
            support={course?.support}
          />
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mt: 2, width: "100%" }}
            onClick={() => setSupportOpen(true)}
          >
            {t("studentCourseDetails.page.supportFaq")}
          </Button>
          <StudentCourseDetailSupportDialog
            open={supportOpen}
            onClose={() => setSupportOpen(false)}
            support={course?.support}
            faq={course?.faq || []}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        course={course}
        userData={userData}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Enrollment Prompt Modal for non-enrolled users */}
      <EnrollmentPrompt
        open={showEnrollmentPrompt}
        course={course}
        onClose={() => setShowEnrollmentPrompt(false)}
        lessons={lessons}
      />
    </Box>
  );
};

export default StudentCourseDetailsPage;
