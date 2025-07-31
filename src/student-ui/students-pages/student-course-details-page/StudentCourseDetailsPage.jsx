import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../contexts/UserContext";
import { useCourseDetails } from "./hooks/useCourseDetails";
import { useCourseReviews } from "./hooks/useCourseReviews";
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

  const { reviews, submitReview } = useCourseReviews(courseId);

  // Dialog state
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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

  return (
    <Box
      sx={{
        width: "100%",
        // maxWidth: 1400,
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
      {undoSuccess && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={clearUndoSuccess}
          message={t("studentCourseDetails.page.lessonUndone")}
        />
      )}
      <StudentCourseDetailHeaderSection
        course={course}
        user={userData}
        onEnroll={handleEnroll}
        isEnrolled={isEnrolled}
        enrollmentStatus={enrollmentStatus}
      />
      <Grid container spacing={4} sx={{ mt: 4, px: 2 }}>
        <Grid item xs={12} md={8}>
          <StudentCourseDetailModuleList modules={modules} lessons={lessons} />

          <StudentCourseDetailOverviewSection course={course} />
          <StudentCourseDetailProgressStats
            progress={progress}
            achievements={achievements}
            loading={progressLoading || undoLoading}
          />
          <StudentCourseDetailContentOutline
            modules={modules}
            lessons={lessons}
            onLessonComplete={handleProgressUpdate}
            onLessonUndo={handleLessonUndo}
            user={userData}
          />
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
    </Box>
  );
};

export default StudentCourseDetailsPage;
