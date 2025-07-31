import React, { createContext, useState, useContext, useEffect } from "react";
import { useUser } from "./UserContext";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { syncTotalStudyTime } from "../services/student-services/studentTodayStatsService";

const StudyTimeContext = createContext();

export const useStudyTime = () => useContext(StudyTimeContext);

export const StudyTimeProvider = ({ children }) => {
  const { userData } = useUser();
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [activeSessionDuration, setActiveSessionDuration] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Session persistence key
  const SESSION_STORAGE_KEY = "study_session_data";

  // Get user's timezone-adjusted date
  const getUserDate = () => {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  };

  // Load session from localStorage on mount
  useEffect(() => {
    if (userData) {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          const {
            sessionStartTime: savedStart,
            activeSessionDuration: savedDuration,
          } = sessionData;

          // Check if session is from today and not too old (within 24 hours)
          const sessionDate = new Date(savedStart).toISOString().slice(0, 10);
          const today = getUserDate();
          const sessionAge = Date.now() - savedStart;
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

          if (sessionDate === today && sessionAge < maxSessionAge) {
            setSessionStartTime(savedStart);
            setActiveSessionDuration(savedDuration);
            setIsSessionActive(true);
          } else {
            // Clear old session data
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } catch (error) {
          console.error("Error loading session data:", error);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    }
  }, [userData]);

  // Save session to localStorage
  const saveSessionToStorage = (startTime, duration) => {
    try {
      const sessionData = {
        sessionStartTime: startTime,
        activeSessionDuration: duration,
        userId: userData?.uid,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error("Error saving session to storage:", error);
    }
  };

  // Fetch initial study time from Firestore
  useEffect(() => {
    if (userData) {
      const fetchStudyTime = async () => {
        const userRef = doc(db, "users", userData.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setTotalStudyTime(data.totalStudyTime || 0);
        }
      };
      fetchStudyTime();
    }
  }, [userData]);

  // Function to save study time to Firestore (single source of truth)
  const saveStudyTime = async (durationInSeconds) => {
    if (!userData) return;

    const today = getUserDate();
    const userRef = doc(db, "users", userData.uid);

    // Update user document with totalStudyTime (in minutes for backward compatibility)
    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    const newTotalStudyTime = totalStudyTime + durationInMinutes;

    await setDoc(
      userRef,
      {
        totalStudyTime: newTotalStudyTime,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    // Update todayStats subcollection (single source of truth for daily study time)
    try {
      const todayStatsRef = doc(db, "users", userData.uid, "todayStats", today);
      const todayStatsDoc = await getDoc(todayStatsRef);

      const currentStats = todayStatsDoc.exists()
        ? todayStatsDoc.data()
        : {
            studyTime: 0,
            lessonsCompleted: 0,
            vocabularyWords: 0,
            pronunciationPractice: 0,
            quizzesTaken: 0,
            date: today,
          };

      // Update study time in todayStats (in seconds)
      currentStats.studyTime += durationInSeconds;
      currentStats.lastUpdated = Timestamp.now();

      await setDoc(todayStatsRef, currentStats);

      console.log(
        `Study time saved: ${durationInSeconds} seconds added to todayStats (${durationInMinutes} minutes)`
      );
    } catch (error) {
      console.error("Error updating todayStats:", error);
      // Don't throw error here as it shouldn't break the main study time tracking
    }

    setTotalStudyTime(newTotalStudyTime);
  };

  // Function to sync total study time with all todayStats
  const syncTotalStudyTimeWithStats = async () => {
    if (!userData) return;

    try {
      const newTotalStudyTime = await syncTotalStudyTime(userData.uid);
      setTotalStudyTime(newTotalStudyTime);
      console.log("Total study time synced successfully");
    } catch (error) {
      console.error("Error syncing total study time:", error);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => {
        setActiveSessionDuration((prev) => {
          const newDuration = prev + 1;
          // Save session to localStorage every 30 seconds
          if (newDuration % 30 === 0) {
            saveSessionToStorage(sessionStartTime, newDuration);
          }
          return newDuration;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  const startSession = () => {
    if (!isSessionActive) {
      const startTime = Date.now();
      setSessionStartTime(startTime);
      setIsSessionActive(true);
      saveSessionToStorage(startTime, 0);
    }
  };

  const pauseSession = () => {
    if (isSessionActive) {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      // Save the current session duration (not the difference)
      if (elapsed > 0) {
        saveStudyTime(elapsed);
      }
      setActiveSessionDuration(elapsed);
      setIsSessionActive(false);
      saveSessionToStorage(sessionStartTime, elapsed);
    }
  };

  const endSession = () => {
    if (isSessionActive) {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      // Save the current session duration (not the difference)
      if (elapsed > 0) {
        saveStudyTime(elapsed);
      }
      setActiveSessionDuration(0);
      setSessionStartTime(null);
      setIsSessionActive(false);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  const value = {
    startSession,
    pauseSession,
    endSession,
    activeSessionDuration,
    totalStudyTime,
    isSessionActive,
    syncTotalStudyTimeWithStats,
  };

  return (
    <StudyTimeContext.Provider value={value}>
      {children}
    </StudyTimeContext.Provider>
  );
};
