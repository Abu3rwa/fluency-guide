import { useEffect, useContext, useRef } from "react";
import { useStudyTime } from "../contexts/StudyTimeContext";

// Configurable inactivity timeout (default: 5 minutes for reading-heavy activities)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useStudyTimer = (customTimeout = null) => {
  const { startSession, pauseSession, endSession, isSessionActive } =
    useStudyTime();
  const inactivityTimer = useRef(null);
  const timeout = customTimeout || INACTIVITY_TIMEOUT;

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      if (isSessionActive) {
        console.log("Session paused due to inactivity");
        pauseSession();
      }
    }, timeout);
  };

  const handleActivity = () => {
    if (!isSessionActive) {
      startSession();
    }
    resetInactivityTimer();
  };

  // Enhanced activity detection for reading-heavy activities
  const handleScroll = () => {
    handleActivity();
  };

  // Handle text selection (common in reading activities)
  const handleSelection = () => {
    handleActivity();
  };

  // Handle form interactions (typing, focusing)
  const handleFormActivity = () => {
    handleActivity();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isSessionActive) {
          console.log("Session paused due to tab visibility change");
          pauseSession();
        }
      } else {
        // When tab becomes visible again, wait for user activity
        handleActivity();
      }
    };

    // Add comprehensive event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("selectionchange", handleSelection);

    // Form-related events
    document.addEventListener("input", handleFormActivity);
    document.addEventListener("focus", handleFormActivity);
    document.addEventListener("blur", handleFormActivity);

    // Start session on mount and set inactivity timer
    handleActivity();

    // Cleanup on unmount
    return () => {
      endSession();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("selectionchange", handleSelection);
      document.removeEventListener("input", handleFormActivity);
      document.removeEventListener("focus", handleFormActivity);
      document.removeEventListener("blur", handleFormActivity);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [isSessionActive, startSession, pauseSession, endSession, timeout]);

  // Return session status for components that need it
  return {
    isSessionActive,
    timeout,
  };
};
