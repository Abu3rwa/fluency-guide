import { ACCESSIBILITY_CONFIG } from '../constants/dashboardConstants';

/**
 * Accessibility utilities for the student dashboard
 */

// ARIA live region announcements
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Screen reader only
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element) => {
    if (!element) return;
    
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
  
  // Focus first element in container
  focusFirst: (container) => {
    const firstFocusable = container?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  },
  
  // Save and restore focus
  saveFocus: () => {
    const activeElement = document.activeElement;
    return () => {
      if (activeElement && typeof activeElement.focus === 'function') {
        activeElement.focus();
      }
    };
  },
};

// Keyboard event handlers
export const keyboardHandlers = {
  // Handle Enter and Space for custom interactive elements
  handleActivation: (callback) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback(event);
    }
  },
  
  // Handle Escape key
  handleEscape: (callback) => (event) => {
    if (event.key === 'Escape') {
      callback(event);
    }
  },
  
  // Arrow key navigation for lists/grids
  handleArrowNavigation: (currentIndex, itemCount, callback) => (event) => {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % itemCount;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = itemCount - 1;
        break;
      default:
        return;
    }
    
    event.preventDefault();
    callback(newIndex);
  },
};

// ARIA attribute generators
export const ariaAttributes = {
  // Loading state attributes
  loading: (isLoading, label = 'Loading') => ({
    'aria-busy': isLoading,
    'aria-label': isLoading ? label : undefined,
  }),
  
  // Expanded/collapsed state
  expandable: (isExpanded, controls) => ({
    'aria-expanded': isExpanded,
    'aria-controls': controls,
  }),
  
  // Selected state
  selectable: (isSelected, setSize, posInSet) => ({
    'aria-selected': isSelected,
    'aria-setsize': setSize,
    'aria-posinset': posInSet,
  }),
  
  // Error state
  error: (hasError, errorId) => ({
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
  }),
  
  // Live region
  liveRegion: (priority = 'polite', atomic = true) => ({
    'aria-live': priority,
    'aria-atomic': atomic,
  }),
  
  // Hidden from screen readers
  hidden: () => ({
    'aria-hidden': true,
  }),
  
  // Label relationships
  labelledBy: (labelId) => ({
    'aria-labelledby': labelId,
  }),
  
  describedBy: (descriptionId) => ({
    'aria-describedby': descriptionId,
  }),
};

// Screen reader text utilities
export const screenReaderText = {
  // Create screen reader only text
  srOnly: (text) => ({
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
    children: text,
  }),
  
  // Progress announcement
  progressAnnouncement: (current, total, activity) => 
    `${activity}: ${current} of ${total} complete`,
  
  // Status announcements
  statusAnnouncement: {
    success: (action) => `${action} completed successfully`,
    error: (action) => `${action} failed. Please try again`,
    loading: (action) => `${action} in progress`,
  },
};

// Accessibility validation helpers
export const a11yValidation = {
  // Check if element has accessible name
  hasAccessibleName: (element) => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('title')
    );
  },
  
  // Check color contrast (basic check)
  hasGoodContrast: (backgroundColor, textColor) => {
    // This is a simplified check - in production, use a proper color contrast library
    const bg = backgroundColor.replace('#', '');
    const text = textColor.replace('#', '');
    
    const bgLuminance = getLuminance(bg);
    const textLuminance = getLuminance(text);
    
    const contrast = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                    (Math.min(bgLuminance, textLuminance) + 0.05);
    
    return contrast >= 4.5; // WCAG AA standard
  },
  
  // Check if interactive element has appropriate size
  hasGoodTouchTarget: (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44; // WCAG 2.1 AA standard
  },
};

// Helper function for luminance calculation
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Focus visible styles
export const focusStyles = {
  default: {
    '&:focus-visible': {
      outline: `${ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.WIDTH} solid`,
      outlineColor: 'primary.main',
      outlineOffset: ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.OFFSET,
    },
  },
  
  button: {
    '&:focus-visible': {
      outline: `${ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.WIDTH} solid`,
      outlineColor: 'primary.main',
      outlineOffset: ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.OFFSET,
      backgroundColor: 'action.hover',
    },
  },
  
  card: {
    '&:focus-visible': {
      outline: `${ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.WIDTH} solid`,
      outlineColor: 'primary.main',
      outlineOffset: ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.OFFSET,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    },
  },
};

// Component-specific accessibility helpers
export const componentA11y = {
  // Card accessibility
  card: ({
    title,
    description,
    onClick,
    index,
    totalCount,
    isSelected = false,
    isLoading = false,
  }) => ({
    role: onClick ? 'button' : 'article',
    tabIndex: onClick ? 0 : -1,
    'aria-label': `${title}${description ? `. ${description}` : ''}`,
    'aria-posinset': index + 1,
    'aria-setsize': totalCount,
    ...ariaAttributes.selectable(isSelected),
    ...ariaAttributes.loading(isLoading),
    onKeyDown: onClick ? keyboardHandlers.handleActivation(onClick) : undefined,
  }),
  
  // Button accessibility
  button: ({
    label,
    description,
    isLoading = false,
    loadingText = 'Loading...',
  }) => ({
    'aria-label': isLoading ? loadingText : label,
    'aria-description': description,
    ...ariaAttributes.loading(isLoading, loadingText),
  }),
  
  // Navigation accessibility
  navigation: ({
    label,
    currentPage,
    totalPages,
  }) => ({
    role: 'navigation',
    'aria-label': label,
    'aria-current': 'page',
    'aria-setsize': totalPages,
    'aria-posinset': currentPage,
  }),
};

export default {
  announceToScreenReader,
  focusManagement,
  keyboardHandlers,
  ariaAttributes,
  screenReaderText,
  a11yValidation,
  focusStyles,
  componentA11y,
};