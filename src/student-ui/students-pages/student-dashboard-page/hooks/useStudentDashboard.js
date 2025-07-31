import { useState, useEffect, useCallback, useReducer } from "react";
import { useUser } from "../../../../contexts/UserContext";
import studentAchievementService from "../../../../services/student-services/studentAchievementService";
import studentGoalsService from "../../../../services/student-services/studentGoalsService";
import { getTodayStats } from "../../../../services/student-services/studentTodayStatsService";
import studentAnalyticsService from "../../../../services/student-services/studentAnalyticsService";
import studentCourseService from "../../../../services/student-services/studentCourseService";
import studentRecentActivityService from "../../../../services/student-services/studentRecentActivityService";
import studentProgressService from "../../../../services/student-services/studentProgressService";
import studentLearningPathService from "../../../../services/student-services/studentLearningPathService";
import errorLoggingService from "../../../../services/errorLoggingService";

// Dashboard state reducer for better state management
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_DASHBOARD_DATA":
      return { ...state, ...action.payload, loading: false, error: null };
    case "UPDATE_SECTION":
      return { ...state, [action.payload.section]: action.payload.data };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const useStudentDashboard = (userId) => {
  const [dashboardData, dispatch] = useReducer(dashboardReducer, {
    user: null,
    todayStats: null,
    progressData: null,
    courseProgress: null,
    achievements: null,
    goals: null,
    recentActivities: null,
    trendData: null,
    vocabularyStats: null,
    pronunciationStats: null,
    learningPaths: null,
    loading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Fetch all dashboard data in parallel with enhanced services
      const [
        userAchievements,
        userGoals,
        todayStats,
        courseProgress,
        recentActivities,
        analytics,
        overallProgress,
        learningPaths,
      ] = await Promise.all([
        studentAchievementService.getUserAchievements(userId),
        studentGoalsService.getUserGoals(userId),
        getTodayStats(userId),
        studentCourseService.getUserEnrolledCourses(userId),
        studentRecentActivityService.getUserRecentActivities(userId, 10),
        studentAnalyticsService.getEnhancedDashboardAnalytics(userId),
        studentProgressService.getOverallProgress(userId),
        studentLearningPathService.getLearningPathsWithProgress(userId),
      ]);

      // Use real data from services
      const goals = userGoals || [];
      const { studyTrends, vocabularyAnalytics, pronunciationAnalytics } =
        analytics || {};

      // Debug logging for recent activities
      console.log("Dashboard - recentActivities raw:", recentActivities);
      console.log(
        "Dashboard - recentActivities type:",
        typeof recentActivities
      );
      console.log(
        "Dashboard - recentActivities isArray:",
        Array.isArray(recentActivities)
      );

      // Ensure recentActivities is always an array
      const safeRecentActivities = Array.isArray(recentActivities)
        ? recentActivities
        : [];

      console.log("Dashboard - safeRecentActivities:", safeRecentActivities);

      dispatch({
        type: "SET_DASHBOARD_DATA",
        payload: {
          user: null, // Will be provided by useUser hook
          todayStats: todayStats || {
            studyTime: 0,
            lessonsCompleted: 0,
            vocabularyWords: 0,
            pronunciationPractice: 0,
          },
          progressData: overallProgress,
          courseProgress: courseProgress || [],
          enrolledCoursesCount: courseProgress?.length || 0,
          achievements: userAchievements || [],
          goals: goals,
          recentActivities: safeRecentActivities,
          trendData: studyTrends || [],
          vocabularyStats: vocabularyAnalytics || {},
          pronunciationStats: pronunciationAnalytics || {},
          overallProgress: overallProgress,
          learningPaths: learningPaths || [],
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Log error with context
      errorLoggingService.logDashboardError(
        error,
        "fetchDashboardData",
        userId
      );

      // Enhanced error handling with specific error messages
      let errorMessage = "Failed to load dashboard data";
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to access this data";
      } else if (error.code === "unavailable") {
        errorMessage =
          "Service temporarily unavailable. Please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  }, [userId]);

  const fetchSectionData = useCallback(
    async (section) => {
      if (!userId) return;

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        let sectionData = null;

        switch (section) {
          case "achievements":
            sectionData = await studentAchievementService.getUserAchievements(
              userId
            );
            break;
          case "goals":
            sectionData = await studentGoalsService.getUserGoals(userId);
            break;
          case "recentActivities":
            sectionData =
              await studentRecentActivityService.getUserRecentActivities(
                userId,
                10
              );
            break;
          case "progress":
            sectionData = await studentProgressService.getOverallProgress(
              userId
            );
            break;
          case "learningPaths":
            sectionData =
              await studentLearningPathService.getLearningPathsWithProgress(
                userId
              );
            break;
          case "todayStats":
            sectionData = await getTodayStats(userId);
            break;
          case "courseProgress":
            sectionData = await studentCourseService.getUserEnrolledCourses(
              userId
            );
            break;
          default:
            throw new Error(`Unknown section: ${section}`);
        }

        if (sectionData) {
          dispatch({
            type: "UPDATE_SECTION",
            payload: { section, data: sectionData },
          });
        }
      } catch (error) {
        console.error(`Error fetching ${section} data:`, error);

        // Log error with context
        errorLoggingService.logDashboardError(
          error,
          `fetchSectionData_${section}`,
          userId
        );

        let errorMessage = `Failed to load ${section} data`;
        if (error.code === "permission-denied") {
          errorMessage = `You don't have permission to access ${section} data`;
        } else if (error.code === "unavailable") {
          errorMessage = `${section} service temporarily unavailable`;
        } else if (error.message) {
          errorMessage = error.message;
        }

        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    },
    [userId]
  );

  // Fetch data on mount and when userId changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Calculate overall progress data from courses and achievements
   * @param {Array} courses - User's enrolled courses
   * @param {Array} achievements - User's achievements
   * @returns {Object} Progress data
   */
  const calculateProgressData = (courses, achievements) => {
    const totalLessons = courses.reduce(
      (sum, course) => sum + (course.totalLessons || 0),
      0
    );
    const completedLessons = courses.reduce(
      (sum, course) => sum + (course.completedLessons || 0),
      0
    );
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => course.progress === 100
    ).length;
    const averageScore =
      courses.reduce((sum, course) => sum + (course.averageScore || 0), 0) /
      Math.max(courses.length, 1);
    const studyStreak = achievements.filter((ach) =>
      ach.title?.includes("streak")
    ).length;

    return {
      totalLessons,
      completedLessons,
      totalCourses,
      completedCourses,
      averageScore: Math.round(averageScore),
      studyStreak,
    };
  };

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return {
    ...dashboardData,
    refetch: fetchDashboardData,
    refetchSection: fetchSectionData,
    clearError,
  };
};

export default useStudentDashboard;
