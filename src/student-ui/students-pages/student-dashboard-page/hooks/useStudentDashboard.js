import { useState, useEffect, useCallback } from "react";
import { useUser } from "../../../../contexts/UserContext";
import studentAchievementService from "../../../../services/student-services/studentAchievementService";
import studentGoalsService from "../../../../services/student-services/studentGoalsService";
import studentTodayStatsService from "../../../../services/student-services/studentTodayStatsService";
import studentAnalyticsService from "../../../../services/student-services/studentAnalyticsService";
import studentCourseService from "../../../../services/student-services/studentCourseService";
import studentRecentActivityService from "../../../../services/student-services/studentRecentActivityService";
import studentProgressService from "../../../../services/student-services/studentProgressService";

const useStudentDashboard = (userId) => {
  const [dashboardData, setDashboardData] = useState({
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
    loading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    setDashboardData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all dashboard data in parallel with enhanced services
      const [
        userAchievements,
        userGoals,
        todayStats,
        courseProgress,
        recentActivities,
        analytics,
        overallProgress, // NEW: Add overall progress
      ] = await Promise.all([
        studentAchievementService.getUserAchievements(userId),
        studentGoalsService.getUserGoals(userId),
        studentTodayStatsService.getTodayStats(userId),
        studentCourseService.getUserEnrolledCourses(userId),
        studentRecentActivityService.getUserRecentActivities(userId, 10),
        studentAnalyticsService.getEnhancedDashboardAnalytics(userId), // Use enhanced analytics
        studentProgressService.getOverallProgress(userId), // NEW: Fetch overall progress
      ]);

      // Use real data from services
      const goals = userGoals || [];
      const { studyTrends, vocabularyAnalytics, pronunciationAnalytics } =
        analytics;

      setDashboardData({
        user: null, // Will be provided by useUser hook
        todayStats: todayStats || {
          studyTime: 0,
          lessonsCompleted: 0,
          vocabularyWords: 0,
          pronunciationPractice: 0,
        },
        progressData: overallProgress, // NEW: Use comprehensive progress data
        courseProgress: courseProgress || [],
        enrolledCoursesCount: courseProgress?.length || 0, // Add enrolled courses count
        achievements: userAchievements,
        goals: goals,
        recentActivities: recentActivities || [],
        trendData: studyTrends,
        vocabularyStats: vocabularyAnalytics,
        pronunciationStats: pronunciationAnalytics,
        overallProgress: overallProgress, // NEW: Add overall progress to state
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load dashboard data",
      }));
    }
  }, [userId]);

  const fetchSectionData = useCallback(
    async (section) => {
      if (!userId) return;

      setDashboardData((prev) => ({ ...prev, loading: true }));

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
            // TODO: Implement activities service
            break;
          case "progress":
            // TODO: Implement progress service
            break;
          default:
            throw new Error(`Unknown section: ${section}`);
        }

        if (sectionData) {
          setDashboardData((prev) => ({
            ...prev,
            [section]: sectionData,
            loading: false,
          }));
        }
      } catch (error) {
        console.error(`Error fetching ${section} data:`, error);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: error.message || `Failed to load ${section} data`,
        }));
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

  return {
    ...dashboardData,
    refetch: fetchDashboardData,
    refetchSection: fetchSectionData,
  };
};

export default useStudentDashboard;
