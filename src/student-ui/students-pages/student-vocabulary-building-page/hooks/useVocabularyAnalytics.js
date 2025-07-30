import { useCallback, useRef } from "react";

const useVocabularyAnalytics = () => {
  const sessionStartTime = useRef(Date.now());
  const interactionCount = useRef(0);

  // Track page view
  const trackPageView = useCallback(() => {
    try {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", "page_view", {
          page_title: "Vocabulary Building",
          page_location: window.location.href,
        });
      }

      // Custom analytics
      const analyticsData = {
        event: "page_view",
        page: "vocabulary_building",
        timestamp: Date.now(),
        sessionId: sessionStartTime.current,
      };

      console.log("Analytics - Page View:", analyticsData);
      // Send to your analytics service
      // sendToAnalytics(analyticsData);
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  }, []);

  // Track word interaction
  const trackWordInteraction = useCallback((action, wordId, wordData = {}) => {
    try {
      interactionCount.current++;

      const analyticsData = {
        event: "word_interaction",
        action,
        wordId,
        word: wordData.word,
        level: wordData.level,
        category: wordData.category,
        timestamp: Date.now(),
        sessionId: sessionStartTime.current,
        interactionCount: interactionCount.current,
      };

      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", "word_interaction", {
          action,
          word_id: wordId,
          word_level: wordData.level,
          word_category: wordData.category,
        });
      }

      console.log("Analytics - Word Interaction:", analyticsData);
      // Send to your analytics service
      // sendToAnalytics(analyticsData);
    } catch (error) {
      console.error("Error tracking word interaction:", error);
    }
  }, []);

  // Track navigation
  const trackNavigation = useCallback(
    (action, fromIndex, toIndex, totalWords) => {
      try {
        const analyticsData = {
          event: "navigation",
          action,
          fromIndex,
          toIndex,
          totalWords,
          timestamp: Date.now(),
          sessionId: sessionStartTime.current,
        };

        // Google Analytics 4
        if (window.gtag) {
          window.gtag("event", "vocabulary_navigation", {
            navigation_action: action,
            from_index: fromIndex,
            to_index: toIndex,
            total_words: totalWords,
          });
        }

        console.log("Analytics - Navigation:", analyticsData);
        // Send to your analytics service
        // sendToAnalytics(analyticsData);
      } catch (error) {
        console.error("Error tracking navigation:", error);
      }
    },
    []
  );

  // Track search
  const trackSearch = useCallback((searchTerm, resultsCount, filters = {}) => {
    try {
      const analyticsData = {
        event: "search",
        searchTerm,
        resultsCount,
        filters,
        timestamp: Date.now(),
        sessionId: sessionStartTime.current,
      };

      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", "vocabulary_search", {
          search_term: searchTerm,
          results_count: resultsCount,
          filters: JSON.stringify(filters),
        });
      }

      console.log("Analytics - Search:", analyticsData);
      // Send to your analytics service
      // sendToAnalytics(analyticsData);
    } catch (error) {
      console.error("Error tracking search:", error);
    }
  }, []);

  // Track goal completion
  const trackGoalCompletion = useCallback((goalData) => {
    try {
      const analyticsData = {
        event: "goal_completion",
        goalId: goalData.id,
        dailyTarget: goalData.dailyTarget,
        currentProgress: goalData.currentProgress,
        completionTime: Date.now(),
        sessionId: sessionStartTime.current,
      };

      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", "goal_completion", {
          goal_id: goalData.id,
          daily_target: goalData.dailyTarget,
          current_progress: goalData.currentProgress,
        });
      }

      console.log("Analytics - Goal Completion:", analyticsData);
      // Send to your analytics service
      // sendToAnalytics(analyticsData);
    } catch (error) {
      console.error("Error tracking goal completion:", error);
    }
  }, []);

  // Track session end
  const trackSessionEnd = useCallback(() => {
    try {
      const sessionDuration = Date.now() - sessionStartTime.current;
      const analyticsData = {
        event: "session_end",
        sessionDuration,
        interactionCount: interactionCount.current,
        timestamp: Date.now(),
        sessionId: sessionStartTime.current,
      };

      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", "session_end", {
          session_duration: sessionDuration,
          interaction_count: interactionCount.current,
        });
      }

      console.log("Analytics - Session End:", analyticsData);
      // Send to your analytics service
      // sendToAnalytics(analyticsData);
    } catch (error) {
      console.error("Error tracking session end:", error);
    }
  }, []);

  // Track error
  const trackError = useCallback((error, context) => {
    try {
      const analyticsData = {
        event: "error",
        error: error.message,
        errorStack: error.stack,
        context,
        timestamp: Date.now(),
        sessionId: sessionStartTime.current,
      };

      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", "exception", {
          description: error.message,
          fatal: false,
        });
      }

      console.error("Analytics - Error:", analyticsData);
      // Send to your analytics service
      // sendToAnalytics(analyticsData);
    } catch (analyticsError) {
      console.error("Error tracking error:", analyticsError);
    }
  }, []);

  // Track performance
  const trackPerformance = useCallback((metric, value) => {
    try {
      const analyticsData = {
        event: "performance",
        metric,
        value,
        timestamp: Date.now(),
        sessionId: sessionStartTime.current,
      };

      // Google Analytics 4
      if (window.gtag) {
        window.gtag("event", "timing_complete", {
          name: metric,
          value: value,
        });
      }

      console.log("Analytics - Performance:", analyticsData);
      // Send to your analytics service
      // sendToAnalytics(analyticsData);
    } catch (error) {
      console.error("Error tracking performance:", error);
    }
  }, []);

  return {
    trackPageView,
    trackWordInteraction,
    trackNavigation,
    trackSearch,
    trackGoalCompletion,
    trackSessionEnd,
    trackError,
    trackPerformance,
  };
};

export default useVocabularyAnalytics;
