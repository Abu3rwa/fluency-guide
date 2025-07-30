import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useStudentCourse } from "../../../contexts/studentCourseContext";
import { useStudentModule } from "../../../contexts/studentModuleContext";
import { useStudentLesson } from "../../../contexts/studentLessonContext";
import { useStudentTask } from "../../../contexts/studentTaskContext";
import { useStudentAchievement } from "../../../contexts/studentAchievementContext";
import StudentCourseDetailHeaderSection from "./components/StudentCourseDetailHeaderSection";
import StudentCourseDetailOverviewSection from "./components/StudentCourseDetailOverviewSection";
import StudentCourseDetailProgressStats from "./components/StudentCourseDetailProgressStats";
import StudentCourseDetailContentOutline from "./components/StudentCourseDetailContentOutline";
import StudentCourseDetailMaterialsDialog from "./components/StudentCourseDetailMaterialsDialog";
import StudentCourseDetailInstructorInfo from "./components/StudentCourseDetailInstructorInfo";
import StudentCourseDetailReviewsSection from "./components/StudentCourseDetailReviewsSection";
import StudentCourseDetailSupportDialog from "./components/StudentCourseDetailSupportDialog";
import { enrollmentService } from "../../../services/enrollmentService";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import StudentCourseDetailModuleList from "./components/StudentCourseDetailModuleList";
import { useTranslation } from "react-i18next";
import PaymentDialog from "../../../components/PaymentDialog";

const StudentCourseDetailsPage = () => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const { id } = useParams();
  const courseId = id;
  const { userData, isStudent } = useUser();
  const { getCourseById } = useStudentCourse();
  const { getModulesByCourse } = useStudentModule();
  const { getLessonsByModule } = useStudentLesson();
  const { getTasksByLesson } = useStudentTask();
  const { getUserAchievements } = useStudentAchievement();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [undoSuccess, setUndoSuccess] = useState(false);

  // Dialog state
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState("not-enrolled");

  // Fetch reviews from Firestore
  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, "courseReviews"),
        where("courseId", "==", courseId)
      );
      const snapshot = await getDocs(reviewsQuery);
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setError(t("studentCourseDetails.page.fetchReviewsError"));
    }
  };

  // Fetch all data
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const courseData = await getCourseById(courseId);
        if (!mounted) return;
        setCourse(courseData);
        const modulesData = await getModulesByCourse(courseId); // <-- real Firestore data
        console.log("modulesData", modulesData);
        console.log("courseId", courseId);
        if (!mounted) return;
        setModules(modulesData);

        // Check enrollment status
        if (userData) {
          try {
            const enrollments = await enrollmentService.getEnrollmentsByStudent(
              userData.uid || userData.id
            );
            const enrollment = enrollments.find((e) => e.courseId === courseId);
            if (enrollment) {
              setIsEnrolled(enrollment.status === "active");
              setEnrollmentStatus(enrollment.status);
            } else {
              setIsEnrolled(false);
              setEnrollmentStatus("not-enrolled");
            }
          } catch (e) {
            console.error("Error checking enrollment:", e);
            setIsEnrolled(false);
          }
        }
        // Fetch all lessons for all modules
        let allLessons = [];
        for (const mod of modulesData) {
          const lessonsData = await getLessonsByModule(mod.id); // <-- real Firestore data
          allLessons = allLessons.concat(lessonsData);
        }
        if (!mounted) return;
        setLessons(allLessons);
        // Fetch achievements
        if (userData) {
          const ach = await getUserAchievements(userData.uid || userData.id);
          if (!mounted) return;
          setAchievements(ach);
        }
        // Fetch reviews from backend
        await fetchReviews();
        // Calculate progress
        if (userData && allLessons.length > 0) {
          const completedLessons = allLessons.filter(
            (l) =>
              Array.isArray(l.completedBy) &&
              l.completedBy.includes(userData.uid || userData.id)
          ).length;
          setProgress({
            completedLessons,
            totalLessons: allLessons.length,
          });
        } else {
          setProgress({ completedLessons: 0, totalLessons: allLessons.length });
        }
      } catch (e) {
        setError(t("studentCourseDetails.page.loadDetailsError"));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [
    courseId,
    userData,
    getCourseById,
    getModulesByCourse,
    getLessonsByModule,
    getUserAchievements,
  ]);

  // Backend integration for enroll, progress, reviews
  const handleEnroll = async () => {
    // Show payment dialog instead of direct enrollment
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = (result) => {
    // Handle successful payment
    setShowPaymentDialog(false);
    setError(null);
    // Update enrollment status to show pending
    setEnrollmentStatus("pending");
  };

  // Real progress update logic: mark lesson as completed
  const handleProgressUpdate = async (lessonId, status = "completed") => {
    if (!userData) return;
    setProgressLoading(true);
    try {
      const lessonRef = doc(db, "lessons", lessonId);
      await updateDoc(lessonRef, {
        completedBy: arrayUnion(userData.uid || userData.id),
      });
      // Recalculate progress after marking as completed
      const updatedLessons = lessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              completedBy: Array.isArray(l.completedBy)
                ? [...l.completedBy, userData.uid || userData.id]
                : [userData.uid || userData.id],
            }
          : l
      );
      setLessons(updatedLessons);
      const completedLessons = updatedLessons.filter(
        (l) =>
          Array.isArray(l.completedBy) &&
          l.completedBy.includes(userData.uid || userData.id)
      ).length;
      setProgress({
        completedLessons,
        totalLessons: updatedLessons.length,
      });
      setError(null);
    } catch (e) {
      setError(t("studentCourseDetails.page.progressError"));
    } finally {
      setProgressLoading(false);
    }
  };

  // Undo lesson completion logic
  const handleLessonUndo = async (lessonId) => {
    if (!userData) return;
    setUndoLoading(true);
    try {
      const lessonRef = doc(db, "lessons", lessonId);
      await updateDoc(lessonRef, {
        completedBy: arrayRemove(userData.uid || userData.id),
      });
      // Update lessons and progress state
      const updatedLessons = lessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              completedBy: Array.isArray(l.completedBy)
                ? l.completedBy.filter(
                    (uid) => uid !== (userData.uid || userData.id)
                  )
                : [],
            }
          : l
      );
      setLessons(updatedLessons);
      const completedLessons = updatedLessons.filter(
        (l) =>
          Array.isArray(l.completedBy) &&
          l.completedBy.includes(userData.uid || userData.id)
      ).length;
      setProgress({
        completedLessons,
        totalLessons: updatedLessons.length,
      });
      setUndoSuccess(true);
    } catch (e) {
      setError(t("studentCourseDetails.page.undoError"));
    } finally {
      setUndoLoading(false);
    }
  };

  const handleReviewSubmit = async (rating, reviewText) => {
    try {
      await addDoc(collection(db, "courseReviews"), {
        studentId: userData.uid || userData.id,
        courseId,
        rating,
        review: reviewText,
        userName:
          userData.displayName ||
          userData.name ||
          t("studentCourseDetails.reviews.student"),
        createdAt: serverTimestamp(),
      });
      setError(null);
      await fetchReviews();
    } catch (e) {
      setError(t("studentCourseDetails.page.reviewError"));
    }
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
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {undoSuccess && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={() => setUndoSuccess(false)}
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
