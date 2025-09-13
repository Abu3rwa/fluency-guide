import { useState, useEffect, useCallback, useReducer } from "react";
import studentAchievementService from "../../../../services/student-services/studentAchievementService";
import studentGoalsService from "../../../../services/student-services/studentGoalsService";
import { getTodayStats } from "../../../../services/student-services/studentTodayStatsService";
import studentCourseService from "../../../../services/student-services/studentCourseService";
import studentRecentActivityService from "../../../../services/student-services/studentRecentActivityService";
import studentVocabularyService from "../../../../services/student-services/studentVocabularyService";
import { DEFAULT_VALUES } from "../constants/dashboardConstants";

// Simplified dashboard state reducer
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_DATA":
      return { ...state, ...action.payload, loading: false, error: null };
    case "UPDATE_SECTION":
      return { ...state, [action.section]: action.data };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const useStudentDashboard = (userId) => {
  const [state, dispatch] = useReducer(dashboardReducer, {
    todayStats: DEFAULT_VALUES.TODAY_STATS,
    courseProgress: [],
    achievements: [],
    goals: [],
    recentActivities: [],
    vocabularyStats: DEFAULT_VALUES.VOCABULARY_STATS,
    loading: true,
    error: null,
  });

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      dispatch({ type: "SET_ERROR", payload: "No user ID provided" });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Fetch core data in parallel
      const [
        todayStatsData,
        courseProgressData,
        achievementsData,
        goalsData,
        recentActivitiesData,
        vocabularyStatsData,
      ] = await Promise.allSettled([
        getTodayStats(userId),
        studentCourseService.getUserEnrolledCourses(userId),
        studentAchievementService.getUserAchievements(userId),
        studentGoalsService.getUserGoals(userId),
        studentRecentActivityService.getUserRecentActivities(userId, 10),
        studentVocabularyService.getVocabularyStats(userId),
      ]);

      // Process results and handle failures gracefully
      const dashboardData = {
        todayStats: todayStatsData.status === 'fulfilled' 
          ? todayStatsData.value || DEFAULT_VALUES.TODAY_STATS
          : DEFAULT_VALUES.TODAY_STATS,
        
        courseProgress: courseProgressData.status === 'fulfilled' 
          ? courseProgressData.value || []
          : [],
        
        achievements: achievementsData.status === 'fulfilled' 
          ? achievementsData.value || []
          : [],
        
        goals: goalsData.status === 'fulfilled' 
          ? (goalsData.value || []).filter(goal => goal && goal.status === 'active')
          : [],
        
        recentActivities: recentActivitiesData.status === 'fulfilled' 
          ? Array.isArray(recentActivitiesData.value) ? recentActivitiesData.value : []
          : [],
        
        vocabularyStats: vocabularyStatsData.status === 'fulfilled' 
          ? vocabularyStatsData.value || DEFAULT_VALUES.VOCABULARY_STATS
          : DEFAULT_VALUES.VOCABULARY_STATS,
      };

      dispatch({ type: "SET_DATA", payload: dashboardData });

      // Log any failed requests for debugging
      const failedRequests = [
        { name: 'todayStats', result: todayStatsData },
        { name: 'courseProgress', result: courseProgressData },
        { name: 'achievements', result: achievementsData },
        { name: 'goals', result: goalsData },
        { name: 'recentActivities', result: recentActivitiesData },
        { name: 'vocabularyStats', result: vocabularyStatsData },
      ].filter(req => req.result.status === 'rejected');

      if (failedRequests.length > 0) {
        console.warn('Some dashboard requests failed:', failedRequests.map(req => ({
          name: req.name,
          error: req.result.reason?.message || req.result.reason
        })));
      }

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      
      let errorMessage = "Failed to load dashboard data";
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to access this data";
      } else if (error.code === "unavailable") {
        errorMessage = "Service temporarily unavailable. Please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  }, [userId]);

  // Refetch specific section
  const refetchSection = useCallback(async (section) => {
    if (!userId) return;

    try {
      let sectionData = null;

      switch (section) {
        case "todayStats":
          sectionData = await getTodayStats(userId);
          break;
        case "courseProgress":
          sectionData = await studentCourseService.getUserEnrolledCourses(userId);
          break;
        case "achievements":
          sectionData = await studentAchievementService.getUserAchievements(userId);
          break;
        case "goals":
          sectionData = await studentGoalsService.getUserGoals(userId);
          break;
        case "recentActivities":
          sectionData = await studentRecentActivityService.getUserRecentActivities(userId, 10);
          break;
        case "vocabularyStats":
          sectionData = await studentVocabularyService.getVocabularyStats(userId);
          break;
        default:
          console.warn(`Unknown section: ${section}`);
          return;
      }

      if (sectionData !== null) {
        dispatch({
          type: "UPDATE_SECTION",
          section,
          data: sectionData,
        });
      }
    } catch (error) {
      console.error(`Error refetching ${section}:`, error);
    }
  }, [userId]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Refetch all data
  const refetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Effect to fetch data on mount and user change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...state,
    refetch,
    refetchSection,
    clearError,
  };
};

export default useStudentDashboard;