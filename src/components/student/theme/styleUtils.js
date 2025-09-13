import { alpha } from '@mui/material/styles';
import { DESIGN_TOKENS, TRANSITIONS } from '../constants';

/**
 * Theme utilities for student course components
 * Provides consistent styling patterns and design tokens
 */

// Card styling utilities
export const getCardStyles = (theme, mode, isHovered = false, variant = 'default') => {
  const baseStyles = {
    borderRadius: DESIGN_TOKENS.BORDER_RADIUS.LARGE,
    transition: TRANSITIONS.CARD_HOVER,
    bgcolor: mode === 'dark' ? 'grey.900' : 'background.paper',
    border: `2px solid transparent`,
    overflow: 'hidden',
    position: 'relative',
  };

  const hoverStyles = isHovered ? {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[DESIGN_TOKENS.SHADOWS.CARD_HOVER],
    borderColor: theme.palette.primary.main,
  } : {
    transform: 'translateY(0)',
    boxShadow: theme.shadows[DESIGN_TOKENS.SHADOWS.CARD_REST],
  };

  const variantStyles = {
    compact: { height: 350 },
    default: { height: 420 },
    detailed: { height: 500 },
    list: { height: 'auto' }
  };

  return {
    ...baseStyles,
    ...hoverStyles,
    ...variantStyles[variant]
  };
};

// Button styling utilities
export const getButtonStyles = (theme, variant = 'primary', size = 'medium') => {
  const sizeMap = {
    small: { px: 2, py: 1, fontSize: '0.8rem' },
    medium: { px: 3, py: 1.5, fontSize: '0.9rem' },
    large: { px: 4, py: 2, fontSize: '1rem' }
  };

  return {
    ...sizeMap[size],
    borderRadius: DESIGN_TOKENS.BORDER_RADIUS.MEDIUM,
    textTransform: 'none',
    fontWeight: 700,
    boxShadow: theme.shadows[DESIGN_TOKENS.SHADOWS.CARD_REST],
    transition: TRANSITIONS.QUICK,
    '&:hover': {
      boxShadow: theme.shadows[DESIGN_TOKENS.SHADOWS.ELEVATED],
      transform: 'translateY(-1px)',
    }
  };
};

// Input field styling
export const getInputStyles = (theme, mode) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: DESIGN_TOKENS.BORDER_RADIUS.MEDIUM,
    bgcolor: mode === 'dark' ? alpha(theme.palette.background.paper, 0.05) : 'transparent',
    transition: TRANSITIONS.QUICK,
    '&:hover': {
      bgcolor: mode === 'dark' ? alpha(theme.palette.background.paper, 0.1) : alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-focused': {
      bgcolor: mode === 'dark' ? alpha(theme.palette.background.paper, 0.1) : alpha(theme.palette.primary.main, 0.08),
    }
  }
});

// Chip styling utilities
export const getChipStyles = (theme, variant = 'outlined', size = 'small') => {
  const sizeStyles = {
    small: { fontSize: '0.75rem', height: 26 },
    medium: { fontSize: '0.85rem', height: 32 }
  };

  return {
    ...sizeStyles[size],
    fontWeight: 600,
    borderRadius: DESIGN_TOKENS.BORDER_RADIUS.SMALL,
    transition: TRANSITIONS.QUICK,
    '&:hover': {
      transform: 'translateY(-1px)',
    }
  };
};

// Paper/Container styling
export const getPaperStyles = (theme, mode, elevation = 2) => ({
  borderRadius: DESIGN_TOKENS.BORDER_RADIUS.MEDIUM,
  bgcolor: mode === 'dark' ? 'grey.900' : 'background.paper',
  border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200]}`,
  boxShadow: theme.shadows[elevation],
});

// Typography utilities
export const getTypographyStyles = (variant = 'default', mode = 'light') => {
  const variants = {
    pageTitle: {
      fontWeight: 800,
      background: `linear-gradient(135deg, 
        ${mode === 'dark' ? '#ffffff' : '#1976d2'} 0%, 
        ${mode === 'dark' ? '#90caf9' : '#42a5f5'} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontSize: { xs: '2rem', md: '3rem' }
    },
    cardTitle: {
      fontWeight: 700,
      fontSize: { xs: '1.1rem', md: '1.2rem' },
      lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    cardDescription: {
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: 1.5,
      fontSize: '0.9rem'
    }
  };

  return variants[variant] || {};
};

// Image overlay utilities
export const getImageOverlayStyles = (theme) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  bgcolor: alpha(theme.palette.common.black, 0.4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: TRANSITIONS.SMOOTH,
  '.student-course-card:hover &': {
    opacity: 1,
  }
});

// Shimmer effect for loading states
export const getShimmerStyles = (theme, mode) => ({
  background: `linear-gradient(90deg, 
    ${mode === 'dark' ? alpha(theme.palette.grey[700], 0.1) : alpha(theme.palette.grey[300], 0.1)} 25%, 
    ${mode === 'dark' ? alpha(theme.palette.grey[600], 0.2) : alpha(theme.palette.grey[200], 0.2)} 50%, 
    ${mode === 'dark' ? alpha(theme.palette.grey[700], 0.1) : alpha(theme.palette.grey[300], 0.1)} 75%
  )`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' }
  }
});

// Responsive grid utilities
export const getResponsiveSpacing = (isMobile, isTablet) => {
  if (isMobile) return DESIGN_TOKENS.SPACING.MD;
  if (isTablet) return DESIGN_TOKENS.SPACING.LG;
  return DESIGN_TOKENS.SPACING.XL;
};

// Focus ring utilities for accessibility
export const getFocusRingStyles = (theme) => ({
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  }
});

// Hover effects
export const getHoverEffects = (theme, intensity = 'medium') => {
  const effects = {
    subtle: {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[4],
      }
    },
    medium: {
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
      }
    },
    strong: {
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[12],
      }
    }
  };

  return effects[intensity] || effects.medium;
};

// Gradient utilities
export const getGradientStyles = (direction = '135deg', colors = ['primary.main', 'secondary.main']) => ({
  background: `linear-gradient(${direction}, var(--mui-palette-${colors[0].replace('.', '-')}) 0%, var(--mui-palette-${colors[1].replace('.', '-')}) 100%)`
});

// Status indicator styles
export const getStatusStyles = (status, theme) => {
  const statusMap = {
    success: { 
      color: theme.palette.success.main, 
      bgcolor: alpha(theme.palette.success.main, 0.1) 
    },
    warning: { 
      color: theme.palette.warning.main, 
      bgcolor: alpha(theme.palette.warning.main, 0.1) 
    },
    error: { 
      color: theme.palette.error.main, 
      bgcolor: alpha(theme.palette.error.main, 0.1) 
    },
    info: { 
      color: theme.palette.info.main, 
      bgcolor: alpha(theme.palette.info.main, 0.1) 
    }
  };

  return statusMap[status] || statusMap.info;
};