import { useReducer, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../../../contexts/UserContext";
import { useStudentCourse } from "../../../../contexts/studentCourseContext";
import { useStudentModule } from "../../../../contexts/studentModuleContext";
import { useStudentLesson } from "../../../../contexts/studentLessonContext";
import { useStudentAchievement } from "../../../../contexts/studentAchievementContext";
import { enrollmentService } from "../../../../services/enrollmentService";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useTranslation } from "react-i18next";

// Initial state for the reducer
const initialState = {
  course: null,
  modules: [],
  lessons: [],
  progress: null,
  achievements: [],
  reviews: [],
  loading: true,
  error: null,
  progressLoading: false,
  undoLoading: false,
  undoSuccess: false,
  isEnrolled: false,
  enrollmentStatus: "not-enrolled",
};

// Action types
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_COURSE: "SET_COURSE",
  SET_MODULES: "SET_MODULES",
  SET_LESSONS: "SET_LESSONS",
  SET_PROGRESS: "SET_PROGRESS",
  SET_ACHIEVEMENTS: "SET_ACHIEVEMENTS",
  SET_REVIEWS: "SET_REVIEWS",
  SET_ENROLLMENT: "SET_ENROLLMENT",
  SET_PROGRESS_LOADING: "SET_PROGRESS_LOADING",
  SET_UNDO_LOADING: "SET_UNDO_LOADING",
  SET_UNDO_SUCCESS: "SET_UNDO_SUCCESS",
  UPDATE_LESSON: "UPDATE_LESSON",
  RESET_ERROR: "RESET_ERROR",
};

// Reducer function
const courseDetailsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_COURSE:
      return { ...state, course: action.payload };
    case ACTIONS.SET_MODULES:
      return { ...state, modules: action.payload };
    case ACTIONS.SET_LESSONS:
      return { ...state, lessons: action.payload };
    case ACTIONS.SET_PROGRESS:
      return { ...state, progress: action.payload };
    case ACTIONS.SET_ACHIEVEMENTS:
      return { ...state, achievements: action.payload };
    case ACTIONS.SET_REVIEWS:
      return { ...state, reviews: action.payload };
    case ACTIONS.SET_ENROLLMENT:
      return {
        ...state,
        isEnrolled: action.payload.isEnrolled,
        enrollmentStatus: action.payload.status,
      };
    case ACTIONS.SET_PROGRESS_LOADING:
      return { ...state, progressLoading: action.payload };
    case ACTIONS.SET_UNDO_LOADING:
      return { ...state, undoLoading: action.payload };
    case ACTIONS.SET_UNDO_SUCCESS:
      return { ...state, undoSuccess: action.payload };
    case ACTIONS.UPDATE_LESSON:
      return {
        ...state,
        lessons: action.payload.lessons,
        progress: action.payload.progress,
      };
    case ACTIONS.RESET_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const useCourseDetails = () => {
  const { t } = useTranslation();
  const { id: courseId } = useParams();
  const { userData } = useUser();
  const { getCourseById } = useStudentCourse();
  const { getModulesByCourse } = useStudentModule();
  const { getLessonsByModule } = useStudentLesson();
  const { getUserAchievements } = useStudentAchievement();

  const [state, dispatch] = useReducer(courseDetailsReducer, initialState);

  // Fetch reviews from Firestore
  const fetchReviews = useCallback(async () => {
    try {
      const reviewsQuery = query(
        collection(db, "courseReviews"),
        where("courseId", "==", courseId)
      );
      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch({ type: ACTIONS.SET_REVIEWS, payload: reviews });
    } catch (e) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: t("studentCourseDetails.page.fetchReviewsError"),
      });
    }
  }, [courseId, t]);

  // Calculate progress based on lessons and user
  const calculateProgress = useCallback((lessons, userId) => {
    if (!userId || lessons.length === 0) {
      return { completedLessons: 0, totalLessons: lessons.length };
    }

    const completedLessons = lessons.filter(
      (l) => Array.isArray(l.completedBy) && l.completedBy.includes(userId)
    ).length;

    return {
      completedLessons,
      totalLessons: lessons.length,
    };
  }, []);

  // Fetch all data concurrently
  const fetchData = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });

    try {
      // Fetch course data
      const courseData = await getCourseById(courseId);
      dispatch({ type: ACTIONS.SET_COURSE, payload: courseData });

      // Fetch modules data
      const modulesData = await getModulesByCourse(courseId);
      dispatch({ type: ACTIONS.SET_MODULES, payload: modulesData });

      // Fetch lessons for all modules concurrently
      const lessonPromises = modulesData.map((mod) =>
        getLessonsByModule(mod.id)
      );
      const lessonsForAllModules = await Promise.all(lessonPromises);
      const allLessons = lessonsForAllModules.flat();
      dispatch({ type: ACTIONS.SET_LESSONS, payload: allLessons });

      // Check enrollment status
      if (userData) {
        try {
          const enrollments = await enrollmentService.getEnrollmentsByStudent(
            userData.uid || userData.id
          );
          const enrollment = enrollments.find((e) => e.courseId === courseId);
          const isEnrolled = enrollment
            ? enrollment.status === "active"
            : false;
          const status = enrollment ? enrollment.status : "not-enrolled";

          dispatch({
            type: ACTIONS.SET_ENROLLMENT,
            payload: { isEnrolled, status },
          });
        } catch (e) {
          console.error("Error checking enrollment:", e);
          dispatch({
            type: ACTIONS.SET_ENROLLMENT,
            payload: { isEnrolled: false, status: "not-enrolled" },
          });
        }

        // Fetch achievements
        const achievements = await getUserAchievements(
          userData.uid || userData.id
        );
        dispatch({ type: ACTIONS.SET_ACHIEVEMENTS, payload: achievements });

        // Calculate progress
        const progress = calculateProgress(
          allLessons,
          userData.uid || userData.id
        );
        dispatch({ type: ACTIONS.SET_PROGRESS, payload: progress });
      } else {
        const progress = calculateProgress(allLessons, null);
        dispatch({ type: ACTIONS.SET_PROGRESS, payload: progress });
      }

      // Fetch reviews
      await fetchReviews();
    } catch (e) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: t("studentCourseDetails.page.loadDetailsError"),
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [
    courseId,
    userData,
    getCourseById,
    getModulesByCourse,
    getLessonsByModule,
    getUserAchievements,
    calculateProgress,
    fetchReviews,
    t,
  ]);

  // Progress update with rollback capability
  const handleProgressUpdate = useCallback(
    async (lessonId, status = "completed") => {
      if (!userData) return;

      const userId = userData.uid || userData.id;
      const currentLessons = state.lessons;
      const currentProgress = state.progress;

      // Optimistic update
      const updatedLessons = currentLessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              completedBy: Array.isArray(l.completedBy)
                ? [...l.completedBy, userId]
                : [userId],
            }
          : l
      );

      const updatedProgress = calculateProgress(updatedLessons, userId);

      dispatch({
        type: ACTIONS.UPDATE_LESSON,
        payload: { lessons: updatedLessons, progress: updatedProgress },
      });
      dispatch({ type: ACTIONS.SET_PROGRESS_LOADING, payload: true });

      try {
        const lessonRef = doc(db, "lessons", lessonId);
        await updateDoc(lessonRef, {
          completedBy: arrayUnion(userId),
        });
        dispatch({ type: ACTIONS.RESET_ERROR });
      } catch (e) {
        // Rollback on failure
        dispatch({
          type: ACTIONS.UPDATE_LESSON,
          payload: { lessons: currentLessons, progress: currentProgress },
        });
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: t("studentCourseDetails.page.progressError"),
        });
      } finally {
        dispatch({ type: ACTIONS.SET_PROGRESS_LOADING, payload: false });
      }
    },
    [state.lessons, state.progress, userData, calculateProgress, t]
  );

  // Undo lesson completion with rollback capability
  const handleLessonUndo = useCallback(
    async (lessonId) => {
      if (!userData) return;

      const userId = userData.uid || userData.id;
      const currentLessons = state.lessons;
      const currentProgress = state.progress;

      // Optimistic update
      const updatedLessons = currentLessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              completedBy: Array.isArray(l.completedBy)
                ? l.completedBy.filter((uid) => uid !== userId)
                : [],
            }
          : l
      );

      const updatedProgress = calculateProgress(updatedLessons, userId);

      dispatch({
        type: ACTIONS.UPDATE_LESSON,
        payload: { lessons: updatedLessons, progress: updatedProgress },
      });
      dispatch({ type: ACTIONS.SET_UNDO_LOADING, payload: true });

      try {
        const lessonRef = doc(db, "lessons", lessonId);
        await updateDoc(lessonRef, {
          completedBy: arrayRemove(userId),
        });
        dispatch({ type: ACTIONS.SET_UNDO_SUCCESS, payload: true });
        dispatch({ type: ACTIONS.RESET_ERROR });
      } catch (e) {
        // Rollback on failure
        dispatch({
          type: ACTIONS.UPDATE_LESSON,
          payload: { lessons: currentLessons, progress: currentProgress },
        });
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: t("studentCourseDetails.page.undoError"),
        });
      } finally {
        dispatch({ type: ACTIONS.SET_UNDO_LOADING, payload: false });
      }
    },
    [state.lessons, state.progress, userData, calculateProgress, t]
  );

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_ERROR });
  }, []);

  // Clear undo success
  const clearUndoSuccess = useCallback(() => {
    dispatch({ type: ACTIONS.SET_UNDO_SUCCESS, payload: false });
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    courseId,
    userData,
    handleProgressUpdate,
    handleLessonUndo,
    clearError,
    clearUndoSuccess,
    fetchReviews,
  };
};
