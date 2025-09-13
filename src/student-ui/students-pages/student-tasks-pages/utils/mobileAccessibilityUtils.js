// Mobile Accessibility Enhancement Utilities
// Provides comprehensive accessibility features for mobile task interfaces

import { useCallback, useEffect, useRef, useState } from 'react';

// Screen reader detection and optimization
export const useScreenReaderOptimization = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [screenReaderType, setScreenReaderType] = useState(null);
  const announcementTimeoutRef = useRef(null);
  const lastAnnouncementRef = useRef('');

  // Detect screen reader usage
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = 
        // VoiceOver (iOS/macOS)
        window.speechSynthesis ||
        // TalkBack/Voice Assistant (Android)
        navigator.userAgent.includes('Chrome') && window.android ||
        // General accessibility features
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        // Check for reduced motion preference (often used with screen readers)
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setIsScreenReaderActive(hasScreenReader);

      // Detect specific screen reader types
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        setScreenReaderType('voiceover');
      } else if (navigator.userAgent.includes('Android')) {
        setScreenReaderType('talkback');
      } else {
        setScreenReaderType('desktop');
      }
    };

    detectScreenReader();

    // Listen for accessibility events
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear pending announcements when page is hidden
        if (announcementTimeoutRef.current) {
          clearTimeout(announcementTimeoutRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  // Optimized announcement function
  const announce = useCallback((message, priority = 'polite', delay = 0) => {
    if (!message || message === lastAnnouncementRef.current) {
      return; // Avoid duplicate announcements
    }

    // Clear previous timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    // Set delay based on screen reader type
    const optimizedDelay = delay || (screenReaderType === 'voiceover' ? 750 : 500);

    announcementTimeoutRef.current = setTimeout(() => {
      // Create or update announcement region
      let announcementRegion = document.getElementById('mobile-task-announcements');
      
      if (!announcementRegion) {
        announcementRegion = document.createElement('div');
        announcementRegion.id = 'mobile-task-announcements';
        announcementRegion.setAttribute('aria-live', priority);
        announcementRegion.setAttribute('aria-atomic', 'true');
        announcementRegion.style.position = 'absolute';
        announcementRegion.style.left = '-10000px';
        announcementRegion.style.width = '1px';
        announcementRegion.style.height = '1px';
        announcementRegion.style.overflow = 'hidden';
        document.body.appendChild(announcementRegion);
      } else {
        announcementRegion.setAttribute('aria-live', priority);
      }

      // Update announcement content
      announcementRegion.textContent = message;
      lastAnnouncementRef.current = message;

      // Clear announcement after reading
      setTimeout(() => {
        if (announcementRegion.textContent === message) {
          announcementRegion.textContent = '';
        }
      }, Math.max(3000, message.length * 50)); // Estimate reading time
    }, optimizedDelay);
  }, [screenReaderType]);

  // Announce task progress
  const announceProgress = useCallback((current, total, context = 'question') => {
    const message = `${context} ${current} of ${total}`;
    announce(message, 'polite', 200);
  }, [announce]);

  // Announce task completion
  const announceCompletion = useCallback((score, total) => {
    const percentage = Math.round((score / total) * 100);
    const message = `Task completed. Your score: ${score} out of ${total}. That's ${percentage} percent.`;
    announce(message, 'assertive', 500);
  }, [announce]);

  // Announce feedback
  const announceFeedback = useCallback((isCorrect, explanation = '') => {
    const correctnessMessage = isCorrect ? 'Correct answer' : 'Incorrect answer';
    const fullMessage = explanation ? `${correctnessMessage}. ${explanation}` : correctnessMessage;
    announce(fullMessage, 'assertive', 300);
  }, [announce]);

  return {
    isScreenReaderActive,
    screenReaderType,
    announce,
    announceProgress,
    announceCompletion,
    announceFeedback,
  };
};

// Touch accessibility enhancements
export const useTouchAccessibility = () => {
  const [touchCapabilities, setTouchCapabilities] = useState({
    hasTouch: false,
    maxTouchPoints: 0,
    hasFinePointer: false,
    hasCoarsePointer: false,
  });

  useEffect(() => {
    const capabilities = {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hasFinePointer: window.matchMedia('(pointer: fine)').matches,
      hasCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
    };

    setTouchCapabilities(capabilities);
  }, []);

  // Generate touch-optimized props
  const getTouchProps = useCallback((baseSize = 44) => {
    const minTouchTarget = Math.max(baseSize, 44); // WCAG AA requirement

    return {
      style: {
        minWidth: `${minTouchTarget}px`,
        minHeight: `${minTouchTarget}px`,
        padding: touchCapabilities.hasCoarsePointer ? '12px' : '8px',
        margin: touchCapabilities.hasCoarsePointer ? '4px' : '2px',
      },
      tabIndex: 0,
      role: 'button',
    };
  }, [touchCapabilities]);

  // Enhanced focus management for touch devices
  const enhanceFocusVisibility = useCallback((element) => {
    if (!element) return;

    const style = element.style;
    const originalOutline = style.outline;
    const originalBoxShadow = style.boxShadow;

    // Enhanced focus styles for touch devices
    const focusStyles = {
      outline: '3px solid #005FCC',
      outlineOffset: '2px',
      boxShadow: '0 0 0 2px rgba(0, 95, 204, 0.3)',
    };

    const applyFocusStyles = () => {
      Object.assign(style, focusStyles);
    };

    const removeFocusStyles = () => {
      style.outline = originalOutline;
      style.boxShadow = originalBoxShadow;
    };

    element.addEventListener('focus', applyFocusStyles);
    element.addEventListener('blur', removeFocusStyles);

    return () => {
      element.removeEventListener('focus', applyFocusStyles);
      element.removeEventListener('blur', removeFocusStyles);
    };
  }, []);

  return {
    touchCapabilities,
    getTouchProps,
    enhanceFocusVisibility,
  };
};

// Mobile keyboard navigation
export const useMobileKeyboardNavigation = (containerRef) => {
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const focusableElements = useRef([]);

  // Update focusable elements
  const updateFocusableElements = useCallback(() => {
    if (!containerRef?.current) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="checkbox"]:not([disabled])',
      '[role="radio"]:not([disabled])',
    ].join(', ');

    const elements = Array.from(containerRef.current.querySelectorAll(focusableSelectors))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && !el.hidden;
      });

    focusableElements.current = elements;
  }, [containerRef]);

  // Navigate to specific index
  const navigateToIndex = useCallback((index) => {
    const elements = focusableElements.current;
    if (index >= 0 && index < elements.length) {
      elements[index].focus();
      setCurrentFocusIndex(index);
    }
  }, []);

  // Navigate to next element
  const navigateNext = useCallback(() => {
    const nextIndex = currentFocusIndex + 1;
    if (nextIndex < focusableElements.current.length) {
      navigateToIndex(nextIndex);
    } else {
      // Wrap to first element
      navigateToIndex(0);
    }
  }, [currentFocusIndex, navigateToIndex]);

  // Navigate to previous element
  const navigatePrevious = useCallback(() => {
    const prevIndex = currentFocusIndex - 1;
    if (prevIndex >= 0) {
      navigateToIndex(prevIndex);
    } else {
      // Wrap to last element
      navigateToIndex(focusableElements.current.length - 1);
    }
  }, [currentFocusIndex, navigateToIndex]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        navigateNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        navigatePrevious();
        break;
      case 'Home':
        event.preventDefault();
        navigateToIndex(0);
        break;
      case 'End':
        event.preventDefault();
        navigateToIndex(focusableElements.current.length - 1);
        break;
      default:
        break;
    }
  }, [navigateNext, navigatePrevious, navigateToIndex]);

  // Set up keyboard navigation
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    updateFocusableElements();

    container.addEventListener('keydown', handleKeyDown);

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      updateFocusableElements();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'hidden'],
    });

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [containerRef, handleKeyDown, updateFocusableElements]);

  return {
    currentFocusIndex,
    focusableElements: focusableElements.current,
    navigateNext,
    navigatePrevious,
    navigateToIndex,
    updateFocusableElements,
  };
};

// High contrast mode detection and management
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [contrastRatio, setContrastRatio] = useState(1);

  useEffect(() => {
    // Detect high contrast preferences
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    
    const updateContrastState = () => {
      const highContrast = mediaQuery.matches || forcedColorsQuery.matches;
      setIsHighContrast(highContrast);
      setContrastRatio(highContrast ? 2 : 1);
    };

    updateContrastState();

    mediaQuery.addEventListener('change', updateContrastState);
    forcedColorsQuery.addEventListener('change', updateContrastState);

    return () => {
      mediaQuery.removeEventListener('change', updateContrastState);
      forcedColorsQuery.removeEventListener('change', updateContrastState);
    };
  }, []);

  // Get high contrast styles
  const getHighContrastStyles = useCallback((baseStyles = {}) => {
    if (!isHighContrast) return baseStyles;

    return {
      ...baseStyles,
      border: '2px solid currentColor',
      outline: '1px solid transparent',
      outlineOffset: '2px',
      backgroundColor: 'transparent',
      color: 'currentColor',
      fontWeight: 'bold',
    };
  }, [isHighContrast]);

  return {
    isHighContrast,
    contrastRatio,
    getHighContrastStyles,
  };
};

// Reduced motion preferences
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  // Get animation config based on motion preference
  const getAnimationConfig = useCallback((defaultConfig = {}) => {
    if (prefersReducedMotion) {
      return {
        ...defaultConfig,
        duration: 0,
        transition: 'none',
        animation: 'none',
      };
    }
    return defaultConfig;
  }, [prefersReducedMotion]);

  return {
    prefersReducedMotion,
    getAnimationConfig,
  };
};

// Text scaling and readability
export const useTextScaling = () => {
  const [textScale, setTextScale] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.5);

  useEffect(() => {
    // Detect browser zoom level (approximation)
    const detectZoom = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const screenWidth = screen.width;
      const windowWidth = window.innerWidth;
      
      // Estimate zoom level
      const zoomLevel = (screenWidth / windowWidth) / devicePixelRatio;
      
      // Adjust text scale based on zoom
      if (zoomLevel > 1.5) {
        setTextScale(1.2);
        setLineHeight(1.6);
      } else if (zoomLevel > 1.2) {
        setTextScale(1.1);
        setLineHeight(1.55);
      } else {
        setTextScale(1);
        setLineHeight(1.5);
      }
    };

    detectZoom();
    window.addEventListener('resize', detectZoom);

    return () => {
      window.removeEventListener('resize', detectZoom);
    };
  }, []);

  // Get scaled text styles
  const getScaledTextStyles = useCallback((baseFontSize = 16) => {
    return {
      fontSize: `${baseFontSize * textScale}px`,
      lineHeight: lineHeight,
      letterSpacing: textScale > 1 ? '0.025em' : 'normal',
    };
  }, [textScale, lineHeight]);

  return {
    textScale,
    lineHeight,
    getScaledTextStyles,
  };
};

// Main mobile accessibility hook
export const useMobileAccessibility = () => {
  const screenReader = useScreenReaderOptimization();
  const touch = useTouchAccessibility();
  const highContrast = useHighContrastMode();
  const reducedMotion = useReducedMotion();
  const textScaling = useTextScaling();

  // Comprehensive accessibility config
  const accessibilityConfig = {
    screenReader: screenReader.isScreenReaderActive,
    screenReaderType: screenReader.screenReaderType,
    hasTouch: touch.touchCapabilities.hasTouch,
    highContrast: highContrast.isHighContrast,
    reducedMotion: reducedMotion.prefersReducedMotion,
    textScale: textScaling.textScale,
    
    // Recommended settings based on capabilities
    shouldUseVerboseLabels: screenReader.isScreenReaderActive,
    shouldUseLargerTouchTargets: touch.touchCapabilities.hasCoarsePointer,
    shouldReduceAnimations: reducedMotion.prefersReducedMotion,
    shouldEnhanceContrast: highContrast.isHighContrast,
    shouldScaleText: textScaling.textScale > 1,
  };

  return {
    ...screenReader,
    ...touch,
    ...highContrast,
    ...reducedMotion,
    ...textScaling,
    accessibilityConfig,
  };
};

export default {
  useScreenReaderOptimization,
  useTouchAccessibility,
  useMobileKeyboardNavigation,
  useHighContrastMode,
  useReducedMotion,
  useTextScaling,
  useMobileAccessibility,
};