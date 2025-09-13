import { useState, useCallback, useEffect, useRef } from 'react';
import { KEYBOARD_SHORTCUTS } from '../constants/taskConstants';

/**
 * Custom hook for managing task navigation with keyboard support
 * Provides consistent navigation patterns across all task types
 * 
 * @param {Object} config - Navigation configuration
 * @param {number} config.totalQuestions - Total number of questions
 * @param {number} config.initialIndex - Initial question index
 * @param {boolean} config.allowPrevious - Whether to allow navigating to previous questions
 * @param {boolean} config.enableKeyboard - Whether to enable keyboard shortcuts
 * @param {Function} config.onNavigate - Callback when navigation occurs
 * @param {Function} config.onSubmit - Callback when task is submitted
 * @param {Function} config.canNavigate - Function to check if navigation is allowed
 * @returns {Object} Navigation state and control methods
 */
export const useTaskNavigation = (config = {}) => {
  const {
    totalQuestions = 0,
    initialIndex = 0,
    allowPrevious = true,
    enableKeyboard = true,
    onNavigate = () => {},
    onSubmit = () => {},
    canNavigate = () => true,
  } = config;

  // Navigation state
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [navigationHistory, setNavigationHistory] = useState([initialIndex]);
  const [visited, setVisited] = useState(new Set([initialIndex]));

  // Refs for stable callbacks
  const onNavigateRef = useRef(onNavigate);
  const onSubmitRef = useRef(onSubmit);
  const canNavigateRef = useRef(canNavigate);

  // Update refs when callbacks change
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    canNavigateRef.current = canNavigate;
  }, [canNavigate]);

  // Navigation functions
  const goToQuestion = useCallback((index, options = {}) => {
    const { force = false, addToHistory = true } = options;
    
    // Validate index
    if (index < 0 || index >= totalQuestions) {
      return false;
    }

    // Check if navigation is allowed
    if (!force && !canNavigateRef.current(index, currentIndex)) {
      return false;
    }

    // Update state
    setCurrentIndex(index);
    setVisited(prev => new Set([...prev, index]));
    
    if (addToHistory) {
      setNavigationHistory(prev => [...prev, index]);
    }

    // Call navigation callback
    onNavigateRef.current(index, currentIndex);
    
    return true;
  }, [totalQuestions, currentIndex]);

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    return goToQuestion(nextIndex);
  }, [currentIndex, goToQuestion]);

  const goToPrevious = useCallback(() => {
    if (!allowPrevious) return false;
    
    const prevIndex = currentIndex - 1;
    return goToQuestion(prevIndex);
  }, [currentIndex, allowPrevious, goToQuestion]);

  const goToFirst = useCallback(() => {
    return goToQuestion(0);
  }, [goToQuestion]);

  const goToLast = useCallback(() => {
    return goToQuestion(totalQuestions - 1);
  }, [totalQuestions, goToQuestion]);

  const submitTask = useCallback(() => {
    onSubmitRef.current(currentIndex);
  }, [currentIndex]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event) => {
    if (!enableKeyboard) return;

    const { key, ctrlKey, metaKey, shiftKey } = event;
    
    // Prevent keyboard shortcuts when typing in inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
      return;
    }

    // Navigation shortcuts
    if (KEYBOARD_SHORTCUTS.NEXT_QUESTION.includes(key)) {
      event.preventDefault();
      if (shiftKey) {
        goToLast();
      } else {
        goToNext();
      }
      return;
    }

    if (KEYBOARD_SHORTCUTS.PREVIOUS_QUESTION.includes(key)) {
      event.preventDefault();
      if (shiftKey) {
        goToFirst();
      } else {
        goToPrevious();
      }
      return;
    }

    // Submit shortcuts
    if (KEYBOARD_SHORTCUTS.SUBMIT_ANSWER.includes(key) && (ctrlKey || metaKey)) {
      event.preventDefault();
      submitTask();
      return;
    }

    // Number keys for direct navigation (1-9)
    const numKey = parseInt(key);
    if (numKey >= 1 && numKey <= 9 && numKey <= totalQuestions) {
      event.preventDefault();
      goToQuestion(numKey - 1);
      return;
    }
  }, [enableKeyboard, goToNext, goToPrevious, goToFirst, goToLast, submitTask, totalQuestions, goToQuestion]);

  // Register keyboard event listener
  useEffect(() => {
    if (enableKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enableKeyboard, handleKeyDown]);

  // Navigation utilities
  const getProgress = useCallback(() => {
    if (totalQuestions === 0) return 0;
    return ((currentIndex + 1) / totalQuestions) * 100;
  }, [currentIndex, totalQuestions]);

  const getVisitedProgress = useCallback(() => {
    if (totalQuestions === 0) return 0;
    return (visited.size / totalQuestions) * 100;
  }, [visited.size, totalQuestions]);

  const canGoNext = currentIndex < totalQuestions - 1;
  const canGoPrevious = allowPrevious && currentIndex > 0;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasVisitedQuestion = (index) => visited.has(index);
  const hasVisitedAll = visited.size === totalQuestions;

  // Question status helpers
  const getQuestionStatus = useCallback((index) => {
    if (index === currentIndex) return 'current';
    if (visited.has(index)) return 'visited';
    return 'unvisited';
  }, [currentIndex, visited]);

  // Navigation breadcrumbs
  const getBreadcrumbs = useCallback(() => {
    return navigationHistory.map((index, historyIndex) => ({
      index,
      label: `Question ${index + 1}`,
      isCurrent: historyIndex === navigationHistory.length - 1,
      timestamp: Date.now(), // In real implementation, you'd want actual timestamps
    }));
  }, [navigationHistory]);

  // Reset navigation state
  const reset = useCallback((newIndex = 0) => {
    setCurrentIndex(newIndex);
    setNavigationHistory([newIndex]);
    setVisited(new Set([newIndex]));
  }, []);

  // Jump to specific question by ID or condition
  const findAndGoTo = useCallback((predicate) => {
    if (typeof predicate === 'function') {
      for (let i = 0; i < totalQuestions; i++) {
        if (predicate(i)) {
          return goToQuestion(i);
        }
      }
    }
    return false;
  }, [totalQuestions, goToQuestion]);

  return {
    // Current state
    currentIndex,
    totalQuestions,
    navigationHistory,
    visited: Array.from(visited),
    visitedSet: visited,

    // Navigation capabilities
    canGoNext,
    canGoPrevious,
    isFirstQuestion,
    isLastQuestion,
    hasVisitedAll,

    // Progress indicators
    progress: getProgress(),
    visitedProgress: getVisitedProgress(),

    // Navigation methods
    goToQuestion,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    submitTask,
    reset,
    findAndGoTo,

    // Utility methods
    getQuestionStatus,
    hasVisitedQuestion,
    getBreadcrumbs,

    // Keyboard support
    handleKeyDown,
  };
};

export default useTaskNavigation;