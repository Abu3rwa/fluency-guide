import { useState, useEffect, useCallback, useRef } from 'react';
import { TIMER_CONFIG, NOTIFICATION_TYPES } from '../constants/taskConstants';

/**
 * Custom hook for managing task timers with advanced features
 * Provides unified timer logic across all task types
 * 
 * @param {Object} config - Timer configuration
 * @param {number} config.initialTime - Initial time in seconds
 * @param {boolean} config.autoStart - Whether to start timer automatically
 * @param {Function} config.onTimeout - Callback when timer reaches 0
 * @param {Function} config.onWarning - Callback when warning threshold reached
 * @param {Function} config.onTick - Callback on each timer tick
 * @returns {Object} Timer state and control methods
 */
export const useTaskTimer = (config = {}) => {
  const {
    initialTime = 0,
    autoStart = false,
    onTimeout = () => {},
    onWarning = () => {},
    onTick = () => {},
  } = config;

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [totalElapsed, setTotalElapsed] = useState(0);

  // Refs for stable callbacks and cleanup
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);
  const criticalWarningShownRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);
  const onWarningRef = useRef(onWarning);
  const onTickRef = useRef(onTick);

  // Update refs when callbacks change
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Timer logic
  const tick = useCallback(() => {
    setTimeRemaining((prevTime) => {
      const newTime = Math.max(0, prevTime - 1);
      
      // Call onTick callback
      onTickRef.current(newTime);
      
      // Handle warning thresholds
      if (newTime === TIMER_CONFIG.WARNING_THRESHOLD && !warningShownRef.current) {
        onWarningRef.current(newTime, NOTIFICATION_TYPES.WARNING);
        warningShownRef.current = true;
      }
      
      if (newTime === TIMER_CONFIG.CRITICAL_THRESHOLD && !criticalWarningShownRef.current) {
        onWarningRef.current(newTime, NOTIFICATION_TYPES.ERROR);
        criticalWarningShownRef.current = true;
      }
      
      // Handle timeout
      if (newTime === 0) {
        setIsRunning(false);
        setEndTime(Date.now());
        onTimeoutRef.current();
      }
      
      return newTime;
    });
  }, []);

  // Start timer
  const start = useCallback(() => {
    if (timeRemaining > 0 && !isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      if (!startTime) {
        setStartTime(Date.now());
      }
    }
  }, [timeRemaining, isRunning, startTime]);

  // Pause timer
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
    }
  }, [isRunning]);

  // Resume timer
  const resume = useCallback(() => {
    if (isPaused && timeRemaining > 0) {
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [isPaused, timeRemaining]);

  // Stop timer
  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setEndTime(Date.now());
  }, []);

  // Reset timer
  const reset = useCallback((newTime = initialTime) => {
    setTimeRemaining(newTime);
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
    setEndTime(null);
    setTotalElapsed(0);
    warningShownRef.current = false;
    criticalWarningShownRef.current = false;
  }, [initialTime]);

  // Add time to timer
  const addTime = useCallback((seconds) => {
    setTimeRemaining((prevTime) => prevTime + seconds);
  }, []);

  // Set specific time
  const setTime = useCallback((seconds) => {
    setTimeRemaining(Math.max(0, seconds));
    warningShownRef.current = false;
    criticalWarningShownRef.current = false;
  }, []);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (isRunning) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
    }
  }, [isRunning, isPaused, pause, resume, start]);

  // Effect to handle timer ticking
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(tick, TIMER_CONFIG.TICK_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeRemaining, tick]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && initialTime > 0 && !isRunning && !isPaused) {
      start();
    }
  }, [autoStart, initialTime, isRunning, isPaused, start]);

  // Calculate elapsed time
  useEffect(() => {
    if (startTime && (isRunning || endTime)) {
      const currentTime = endTime || Date.now();
      setTotalElapsed(Math.round((currentTime - startTime) / 1000));
    }
  }, [startTime, endTime, isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time for display
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage (if initial time is set)
  const getProgress = useCallback(() => {
    if (initialTime <= 0) return 0;
    return ((initialTime - timeRemaining) / initialTime) * 100;
  }, [initialTime, timeRemaining]);

  // Check if timer is in warning state
  const isWarning = timeRemaining <= TIMER_CONFIG.WARNING_THRESHOLD && timeRemaining > TIMER_CONFIG.CRITICAL_THRESHOLD;
  const isCritical = timeRemaining <= TIMER_CONFIG.CRITICAL_THRESHOLD && timeRemaining > 0;
  const isExpired = timeRemaining === 0;

  // Get timer status
  const status = isExpired ? 'expired' : isCritical ? 'critical' : isWarning ? 'warning' : 'normal';

  return {
    // State
    timeRemaining,
    isRunning,
    isPaused,
    startTime,
    endTime,
    totalElapsed,
    isWarning,
    isCritical,
    isExpired,
    status,
    progress: getProgress(),
    
    // Formatted values
    formattedTime: formatTime(timeRemaining),
    formattedElapsed: formatTime(totalElapsed),
    
    // Actions
    start,
    pause,
    resume,
    stop,
    reset,
    togglePause,
    addTime,
    setTime,
    formatTime,
  };
};

export default useTaskTimer;