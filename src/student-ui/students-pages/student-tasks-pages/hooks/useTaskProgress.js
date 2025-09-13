import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  STORAGE_KEYS, 
  PROGRESS_STATES, 
  TIMER_CONFIG, 
  NOTIFICATION_TYPES 
} from '../constants/taskConstants';

/**
 * Custom hook for managing task progress with auto-save and persistence
 * Provides unified progress tracking across all task types
 * 
 * @param {Object} config - Progress configuration
 * @param {string} config.taskId - Unique task identifier
 * @param {Object} config.task - Task data object
 * @param {boolean} config.autoSave - Enable automatic progress saving
 * @param {number} config.saveInterval - Auto-save interval in seconds
 * @param {Function} config.onSave - Callback when progress is saved
 * @param {Function} config.onRestore - Callback when progress is restored
 * @param {Function} config.onStateChange - Callback when progress state changes
 * @returns {Object} Progress state and management methods
 */
export const useTaskProgress = (config = {}) => {
  const {
    taskId,
    task,
    autoSave = true,
    saveInterval = TIMER_CONFIG.AUTO_SAVE_INTERVAL,
    onSave = () => {},
    onRestore = () => {},
    onStateChange = () => {},
  } = config;

  // Progress state
  const [answers, setAnswers] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progressState, setProgressState] = useState(PROGRESS_STATES.NOT_STARTED);
  const [startTime, setStartTime] = useState(null);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for stable callbacks and intervals
  const autoSaveIntervalRef = useRef(null);
  const onSaveRef = useRef(onSave);
  const onRestoreRef = useRef(onRestore);
  const onStateChangeRef = useRef(onStateChange);

  // Update refs when callbacks change
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    onRestoreRef.current = onRestore;
  }, [onRestore]);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  // Get storage key for task
  const getStorageKey = useCallback((suffix = '') => {
    return `${STORAGE_KEYS.TASK_PROGRESS}${taskId}${suffix ? `_${suffix}` : ''}`;
  }, [taskId]);

  // Save progress to localStorage
  const saveProgress = useCallback(async () => {
    if (!taskId || !task) return false;

    try {
      const progressData = {
        taskId,
        answers,
        completedQuestions: Array.from(completedQuestions),
        currentQuestionIndex,
        progressState,
        startTime,
        totalTimeSpent,
        timestamp: Date.now(),
        version: '1.0', // For future migration compatibility
      };

      localStorage.setItem(getStorageKey(), JSON.stringify(progressData));
      setLastSaveTime(Date.now());
      setHasUnsavedChanges(false);
      
      onSaveRef.current(progressData);
      return true;
    } catch (error) {
      console.error('Failed to save progress:', error);
      return false;
    }
  }, [taskId, task, answers, completedQuestions, currentQuestionIndex, progressState, startTime, totalTimeSpent, getStorageKey]);

  // Load progress from localStorage
  const loadProgress = useCallback(() => {
    if (!taskId) return null;

    try {
      const savedData = localStorage.getItem(getStorageKey());
      if (!savedData) return null;

      const progressData = JSON.parse(savedData);
      
      // Validate saved data
      if (progressData.taskId !== taskId) return null;

      return progressData;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }, [taskId, getStorageKey]);

  // Restore progress from saved data
  const restoreProgress = useCallback((savedData) => {
    if (!savedData) return false;

    try {
      setAnswers(savedData.answers || {});
      setCompletedQuestions(new Set(savedData.completedQuestions || []));
      setCurrentQuestionIndex(savedData.currentQuestionIndex || 0);
      setProgressState(savedData.progressState || PROGRESS_STATES.NOT_STARTED);
      setStartTime(savedData.startTime);
      setTotalTimeSpent(savedData.totalTimeSpent || 0);
      setLastSaveTime(savedData.timestamp);
      setHasUnsavedChanges(false);

      onRestoreRef.current(savedData);
      return true;
    } catch (error) {
      console.error('Failed to restore progress:', error);
      return false;
    }
  }, []);

  // Clear saved progress
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
      return true;
    } catch (error) {
      console.error('Failed to clear progress:', error);
      return false;
    }
  }, [getStorageKey]);

  // Update answer for a specific question
  const updateAnswer = useCallback((questionId, answer, options = {}) => {
    const { markCompleted = true, autoSaveNow = false } = options;

    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    if (markCompleted && answer !== null && answer !== undefined && answer !== '') {
      setCompletedQuestions(prev => new Set([...prev, questionId]));
    }

    setHasUnsavedChanges(true);

    if (autoSaveNow) {
      saveProgress();
    }
  }, [saveProgress]);

  // Start task progress tracking
  const startTask = useCallback(() => {
    setProgressState(PROGRESS_STATES.IN_PROGRESS);
    setStartTime(Date.now());
    setHasUnsavedChanges(true);
    onStateChangeRef.current(PROGRESS_STATES.IN_PROGRESS);
  }, []);

  // Pause task
  const pauseTask = useCallback(() => {
    setProgressState(PROGRESS_STATES.PAUSED);
    saveProgress();
    onStateChangeRef.current(PROGRESS_STATES.PAUSED);
  }, [saveProgress]);

  // Resume task
  const resumeTask = useCallback(() => {
    setProgressState(PROGRESS_STATES.IN_PROGRESS);
    setHasUnsavedChanges(true);
    onStateChangeRef.current(PROGRESS_STATES.IN_PROGRESS);
  }, []);

  // Complete task
  const completeTask = useCallback(async () => {
    setProgressState(PROGRESS_STATES.COMPLETED);
    const success = await saveProgress();
    onStateChangeRef.current(PROGRESS_STATES.COMPLETED);
    return success;
  }, [saveProgress]);

  // Submit task (final submission)
  const submitTask = useCallback(async () => {
    setProgressState(PROGRESS_STATES.SUBMITTED);
    await saveProgress();
    clearProgress(); // Clear after successful submission
    onStateChangeRef.current(PROGRESS_STATES.SUBMITTED);
  }, [saveProgress, clearProgress]);

  // Reset progress
  const resetProgress = useCallback(() => {
    setAnswers({});
    setCompletedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setProgressState(PROGRESS_STATES.NOT_STARTED);
    setStartTime(null);
    setLastSaveTime(null);
    setTotalTimeSpent(0);
    setHasUnsavedChanges(false);
    clearProgress();
  }, [clearProgress]);

  // Get progress statistics
  const getProgressStats = useCallback(() => {
    const totalQuestions = task?.questions?.length || 0;
    const completedCount = completedQuestions.size;
    const completionPercentage = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;
    const currentTime = Date.now();
    const sessionTime = startTime ? Math.floor((currentTime - startTime) / 1000) : 0;
    const totalTime = totalTimeSpent + sessionTime;

    return {
      totalQuestions,
      completedCount,
      completionPercentage,
      sessionTime,
      totalTime,
      averageTimePerQuestion: completedCount > 0 ? totalTime / completedCount : 0,
      isCompleted: progressState === PROGRESS_STATES.COMPLETED || progressState === PROGRESS_STATES.SUBMITTED,
      hasStarted: progressState !== PROGRESS_STATES.NOT_STARTED,
    };
  }, [task, completedQuestions, progressState, startTime, totalTimeSpent]);

  // Check if question is answered
  const isQuestionAnswered = useCallback((questionId) => {
    const answer = answers[questionId];
    return answer !== null && answer !== undefined && answer !== '';
  }, [answers]);

  // Get answer for specific question
  const getAnswer = useCallback((questionId) => {
    return answers[questionId];
  }, [answers]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && progressState === PROGRESS_STATES.IN_PROGRESS && hasUnsavedChanges) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveProgress();
      }, saveInterval * 1000);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [autoSave, progressState, hasUnsavedChanges, saveProgress, saveInterval]);

  // Load progress on mount
  useEffect(() => {
    if (taskId) {
      const savedProgress = loadProgress();
      if (savedProgress) {
        restoreProgress(savedProgress);
      }
    }
  }, [taskId, loadProgress, restoreProgress]);

  // Save progress before page unload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        saveProgress();
        // Some browsers show a confirmation dialog
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [hasUnsavedChanges, saveProgress]);

  return {
    // Progress state
    answers,
    completedQuestions: Array.from(completedQuestions),
    currentQuestionIndex,
    progressState,
    startTime,
    lastSaveTime,
    totalTimeSpent,
    hasUnsavedChanges,

    // Progress statistics
    ...getProgressStats(),

    // Progress management methods
    updateAnswer,
    startTask,
    pauseTask,
    resumeTask,
    completeTask,
    submitTask,
    resetProgress,
    saveProgress,
    loadProgress,
    restoreProgress,
    clearProgress,

    // Utility methods
    isQuestionAnswered,
    getAnswer,
    getProgressStats,
    
    // Navigation integration
    setCurrentQuestionIndex,
  };
};

export default useTaskProgress;