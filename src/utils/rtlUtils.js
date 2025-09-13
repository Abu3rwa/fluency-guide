
/**
 * RTL Utility Functions
 * Provides consistent RTL support across the application
 */

import { useTranslation } from 'react-i18next';
import React, { useRef } from 'react';

/**
 * Hook to get RTL status
 * @returns {boolean} true if current language is RTL
 */
export const useRTL = () => {
  const { i18n } = useTranslation();
  const loggedRef = useRef(null);
  
  // Only log when language changes, not on every render
  const currentLangInfo = `${i18n.language} ${i18n.dir()}`;
  if (loggedRef.current !== currentLangInfo) {
     loggedRef.current = currentLangInfo;
  }
  
  return i18n.language === 'ar' || i18n.dir?.() === 'rtl';
};
/**
 * Get direction-aware margin/padding values
 * @param {string|number} value - The spacing value
 * @param {boolean} isRTL - RTL state
 * @returns {object} Direction-aware spacing object
 */
export const getDirectionalSpacing = (value, isRTL) => ({
  marginLeft: isRTL ? 0 : value,
  marginRight: isRTL ? value : 0,
});

/**
 * Get direction-aware transform for icons
 * @param {boolean} isRTL - RTL state
 * @param {boolean} shouldFlip - Whether the icon should flip in RTL
 * @returns {string} Transform CSS value
 */
export const getDirectionalTransform = (isRTL, shouldFlip = true) => {
  if (!shouldFlip || !isRTL) return 'none';
  return 'scaleX(-1)';
};

/**
 * Get direction-aware anchor for Material UI components
 * @param {boolean} isRTL - RTL state
 * @param {string} defaultAnchor - Default anchor ('left' or 'right')
 * @returns {string} Direction-aware anchor
 */
export const getDirectionalAnchor = (isRTL, defaultAnchor = 'left') => {
  if (defaultAnchor === 'left') {
    return isRTL ? 'right' : 'left';
  }
  if (defaultAnchor === 'right') {
    return isRTL ? 'left' : 'right';
  }
  return defaultAnchor;
};

/**
 * Get direction-aware text alignment
 * @param {boolean} isRTL - RTL state
 * @param {string} defaultAlign - Default alignment ('left', 'right', 'center')
 * @returns {string} Direction-aware alignment
 */
export const getDirectionalTextAlign = (isRTL, defaultAlign = 'left') => {
  if (defaultAlign === 'left') {
    return isRTL ? 'right' : 'left';
  }
  if (defaultAlign === 'right') {
    return isRTL ? 'left' : 'right';
  }
  return defaultAlign;
};

/**
 * Get direction-aware flex direction
 * @param {boolean} isRTL - RTL state
 * @param {string} defaultDirection - Default flex direction
 * @returns {string} Direction-aware flex direction
 */
export const getDirectionalFlexDirection = (isRTL, defaultDirection = 'row') => {
  if (defaultDirection === 'row') {
    return isRTL ? 'row-reverse' : 'row';
  }
  if (defaultDirection === 'row-reverse') {
    return isRTL ? 'row' : 'row-reverse';
  }
  return defaultDirection;
};

/**
 * Material UI RTL theme overrides
 * @param {boolean} isRTL - RTL state
 * @returns {object} Theme overrides for RTL support
 */
export const getRTLThemeOverrides = (isRTL) => ({
  MuiDrawer: {
    styleOverrides: {
      paper: {
        // Ensure proper z-index and positioning
        zIndex: 1300,
      },
      paperAnchorLeft: {
        borderRight: isRTL ? 'none' : undefined,
        borderLeft: isRTL ? undefined : 'none',
      },
      paperAnchorRight: {
        borderLeft: isRTL ? 'none' : undefined,
        borderRight: isRTL ? undefined : 'none',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        '& .rtl-flip': {
          transform: getDirectionalTransform(isRTL),
        },
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: isRTL ? '40px' : '56px',
        ...getDirectionalSpacing('16px', !isRTL), // Reverse for proper spacing
        '& .rtl-flip': {
          transform: getDirectionalTransform(isRTL),
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        '& .MuiButton-startIcon': {
          marginLeft: isRTL ? '8px' : '0',
          marginRight: isRTL ? '0' : '8px',
        },
        '& .MuiButton-endIcon': {
          marginLeft: isRTL ? '0' : '8px',
          marginRight: isRTL ? '8px' : '0',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        '& .MuiChip-icon': {
          marginLeft: isRTL ? '5px' : '-6px',
          marginRight: isRTL ? '-6px' : '5px',
        },
        '& .MuiChip-deleteIcon': {
          marginLeft: isRTL ? '-6px' : '5px',
          marginRight: isRTL ? '5px' : '-6px',
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        '& .MuiTabs-scrollButtons': {
          '&.Mui-disabled': {
            opacity: 0.3,
          },
        },
      },
      scrollButtons: {
        '&.MuiTabs-scrollButtonsHideMobile': {
          display: 'flex',
        },
      },
    },
  },
});

/**
 * Common RTL-aware styles for components
 */
export const rtlStyles = {
  // Drawer positioning
  drawerPaper: (isRTL) => ({
    borderRadius: isRTL ? '16px 0 0 16px' : '0 16px 16px 0',
    borderRight: isRTL ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
    borderLeft: isRTL ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
  }),
  
  // Icon button with directional arrow
  directionalIconButton: (isRTL) => ({
    transform: getDirectionalTransform(isRTL),
    transition: 'transform 0.2s ease',
  }),
  
  // Text alignment
  directionalText: (isRTL) => ({
    textAlign: getDirectionalTextAlign(isRTL),
    direction: isRTL ? 'rtl' : 'ltr',
  }),
  
  // Flex container
  directionalFlex: (isRTL) => ({
    flexDirection: getDirectionalFlexDirection(isRTL),
  }),
};

/**
 * Get icon class for RTL flipping
 * @param {boolean} shouldFlip - Whether the icon should flip in RTL
 * @returns {string} CSS class name
 */
export const getRTLIconClass = (shouldFlip = true) => {
  return shouldFlip ? 'rtl-flip' : '';
};

/**
 * Directional icons mapping for common UI elements
 */
export const directionalIcons = {
  chevronLeft: (isRTL) => isRTL ? 'ChevronRight' : 'ChevronLeft',
  chevronRight: (isRTL) => isRTL ? 'ChevronLeft' : 'ChevronRight',
  arrowLeft: (isRTL) => isRTL ? 'ArrowForward' : 'ArrowBack',
  arrowRight: (isRTL) => isRTL ? 'ArrowBack' : 'ArrowForward',
  menuLeft: (isRTL) => isRTL ? 'MenuOpen' : 'Menu',
  menuRight: (isRTL) => isRTL ? 'Menu' : 'MenuOpen',
};

export default {
  useRTL,
  getDirectionalSpacing,
  getDirectionalTransform,
  getDirectionalAnchor,
  getDirectionalTextAlign,
  getDirectionalFlexDirection,
  getRTLThemeOverrides,
  rtlStyles,
  getRTLIconClass,
  directionalIcons,
};