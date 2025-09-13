import { DASHBOARD_CONFIG, THEME_CONFIG, ACCESSIBILITY_CONFIG } from '../constants/dashboardConstants';

// Main container styles
export const getMainContainerStyles = (theme) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: { 
    xs: DASHBOARD_CONFIG.MOBILE_PADDING, 
    sm: DASHBOARD_CONFIG.TABLET_PADDING, 
    md: DASHBOARD_CONFIG.DESKTOP_PADDING 
  },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  // Mobile-specific fixes
  "@media (max-width: 600px)": {
    padding: `${DASHBOARD_CONFIG.MOBILE_PADDING}rem`,
    minHeight: "100dvh", // Use dynamic viewport height for mobile
  },
  // Safari and iOS specific fixes
  "@supports (-webkit-touch-callout: none)": {
    minHeight: "-webkit-fill-available",
  },
});

// Content container styles
export const getContentContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: { 
    xs: DASHBOARD_CONFIG.SECTION_GAP_MOBILE, 
    sm: DASHBOARD_CONFIG.SECTION_GAP_TABLET 
  },
  width: "100%",
  maxWidth: { 
    xs: DASHBOARD_CONFIG.MOBILE_CONTAINER_WIDTH, 
    sm: DASHBOARD_CONFIG.TABLET_CONTAINER_WIDTH, 
    md: DASHBOARD_CONFIG.MAX_CONTAINER_WIDTH 
  },
  margin: "0 auto",
  padding: { 
    xs: 0, 
    sm: DASHBOARD_CONFIG.TABLET_PADDING, 
    md: DASHBOARD_CONFIG.DESKTOP_PADDING 
  },
  // Mobile-specific container fixes
  "@media (max-width: 600px)": {
    gap: `${DASHBOARD_CONFIG.SECTION_GAP_MOBILE}rem`,
    padding: "0",
    width: "100vw",
    maxWidth: "100vw",
    boxSizing: "border-box",
  },
  // Prevent horizontal scroll on mobile
  "@media (max-width: 480px)": {
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  },
});

// Main content area styles
export const getMainContentStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: { 
    xs: DASHBOARD_CONFIG.SECTION_GAP_MOBILE, 
    sm: DASHBOARD_CONFIG.SECTION_GAP_TABLET 
  },
  width: "100%",
  // Mobile-specific main content fixes
  "@media (max-width: 600px)": {
    gap: `${DASHBOARD_CONFIG.SECTION_GAP_MOBILE}rem`,
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  },
  // Extra small devices
  "@media (max-width: 480px)": {
    padding: "0",
    margin: "0",
  },
});

// FAB styles
export const getFabStyles = (theme) => ({
  position: "fixed",
  bottom: DASHBOARD_CONFIG.FAB_POSITION.BOTTOM,
  right: DASHBOARD_CONFIG.FAB_POSITION.RIGHT,
  zIndex: DASHBOARD_CONFIG.FAB_POSITION.Z_INDEX,
  background: THEME_CONFIG.GRADIENT_BACKGROUNDS.FAB,
  boxShadow: 4,
});

// Card styles
export const getCardStyles = (theme) => ({
  mb: 3,
  background: THEME_CONFIG.GRADIENT_BACKGROUNDS.CARD
    .replace('{bg.default}', theme.palette.background.default)
    .replace('{bg.paper}', theme.palette.background.paper),
  boxShadow: DASHBOARD_CONFIG.CARD_ELEVATION,
  borderRadius: DASHBOARD_CONFIG.CARD_BORDER_RADIUS,
  position: "relative",
});

// Header styles
export const getHeaderStyles = (theme) => ({
  position: "relative",
  pb: { xs: 10, sm: 12 },
  minHeight: { 
    xs: DASHBOARD_CONFIG.HEADER_HEIGHT.MOBILE, 
    sm: DASHBOARD_CONFIG.HEADER_HEIGHT.TABLET 
  },
});

// Header background styles
export const getHeaderBackgroundStyles = (theme) => ({
  bgcolor: theme.palette.background.paper,
  height: { xs: 140, sm: 180 },
  borderRadius: "0 0 16px 16px",
});

// Profile card styles
export const getProfileCardStyles = (theme) => ({
  position: "absolute",
  left: 0,
  right: 0,
  mx: "auto",
  top: { 
    xs: DASHBOARD_CONFIG.PROFILE_CARD.TOP_POSITION.MOBILE, 
    sm: DASHBOARD_CONFIG.PROFILE_CARD.TOP_POSITION.TABLET 
  },
  padding: { xs: 1, sm: 1 },
  width: { 
    xs: DASHBOARD_CONFIG.PROFILE_CARD.WIDTH.MOBILE, 
    sm: DASHBOARD_CONFIG.PROFILE_CARD.WIDTH.TABLET 
  },
  borderRadius: 4,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  zIndex: 2,
});

// Avatar styles
export const getAvatarStyles = (theme) => ({
  width: DASHBOARD_CONFIG.PROFILE_CARD.AVATAR_SIZE,
  height: DASHBOARD_CONFIG.PROFILE_CARD.AVATAR_SIZE,
  mb: 2,
  bgcolor: theme.palette.primary.main,
});

// ARIA live region styles
export const getAriaLiveStyles = () => ({
  position: ACCESSIBILITY_CONFIG.ARIA_LIVE.POSITION,
  left: ACCESSIBILITY_CONFIG.ARIA_LIVE.LEFT,
  top: ACCESSIBILITY_CONFIG.ARIA_LIVE.TOP,
  width: ACCESSIBILITY_CONFIG.ARIA_LIVE.WIDTH,
  height: ACCESSIBILITY_CONFIG.ARIA_LIVE.HEIGHT,
  overflow: ACCESSIBILITY_CONFIG.ARIA_LIVE.OVERFLOW,
});

// Quick Actions button styles with enhanced mobile touch targets and RTL support
export const getQuickActionButtonStyles = (theme, action, isRTL = false) => ({
  justifyContent: "flex-start",
  py: { xs: 2, sm: 1.7 }, // Increased padding for better touch targets on mobile
  px: { xs: 2.5, sm: 2 },
  borderRadius: 2,
  fontWeight: 500,
  fontSize: { xs: "1.1rem", sm: "1rem" }, // Slightly larger text on mobile
  backgroundColor: action.color === "error"
    ? theme.palette.error.main
    : theme.palette.background.paper,
  color: action.color === "error"
    ? theme.palette.getContrastText(theme.palette.error.main)
    : theme.palette.text.primary,
  boxShadow: action.color === "error" ? 2 : 0,
  transition: "background 0.2s, box-shadow 0.2s, transform 0.15s",
  direction: isRTL ? 'rtl' : 'ltr',
  textAlign: isRTL ? 'right' : 'left',
  "&:hover": {
    backgroundColor: action.color === "error"
      ? theme.palette.error.dark
      : theme.palette.action.hover,
    color: action.color === "error"
      ? theme.palette.getContrastText(theme.palette.error.dark)
      : theme.palette.primary.main,
    boxShadow: 4,
    transform: "scale(1.03)",
  },
  "&:focus": {
    outline: `${ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.WIDTH} solid ${theme.palette.primary.main}`,
    outlineOffset: ACCESSIBILITY_CONFIG.FOCUS_OUTLINE.OFFSET,
  },
  // Enhanced mobile touch targets
  minHeight: { xs: 64, sm: 56 }, // Larger touch targets on mobile (64px meets accessibility guidelines)
  flex: 1,
  // RTL-specific styles
  '& .MuiButton-startIcon': {
    marginLeft: isRTL ? '8px' : '-4px',
    marginRight: isRTL ? '-4px' : '8px',
  },
  '& .MuiButton-endIcon': {
    marginLeft: isRTL ? '-4px' : '8px',
    marginRight: isRTL ? '8px' : '-4px',
  },
  // Mobile-specific improvements
  "@media (max-width: 600px)": {
    fontSize: "1rem",
    fontWeight: 600,
    py: 2.5,
    px: 3,
    minHeight: 64,
    "&:active": {
      transform: "scale(0.98)", // Subtle feedback on touch
    },
  },
});

// Learning path card styles with enhanced mobile support
export const getLearningPathCardStyles = (theme, path) => ({
  cursor: "pointer",
  borderRadius: 3,
  p: { xs: 2.5, sm: 2 }, // Increased padding on mobile
  height: { xs: 120, sm: 120 }, // Consistent height with better mobile touch area
  aspectRatio: "1.2",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 2px 8px rgba(60,60,60,0.06)",
  border: "1px solid #f0f0f0",
  transition: "box-shadow 0.2s, border 0.2s, transform 0.15s",
  "&:hover, &:focus": {
    boxShadow: "0 4px 16px rgba(60,60,60,0.10)",
    border: `1.5px solid ${path.color}`,
    transform: "translateY(-2px)", // Subtle lift effect
  },
  "&:focus": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },
  background: theme.palette.background.paper,
  // Mobile-specific improvements
  "@media (max-width: 600px)": {
    minHeight: 120,
    p: 3,
    "&:active": {
      transform: "scale(0.98)", // Touch feedback
    },
  },
  // Improved accessibility for keyboard navigation
  "&:focus-visible": {
    outline: `3px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },
});

// Responsive utilities with enhanced mobile support
export const getResponsiveSpacing = (xs, sm, md) => ({
  xs: xs || DASHBOARD_CONFIG.SECTION_GAP_MOBILE,
  sm: sm || DASHBOARD_CONFIG.SECTION_GAP_TABLET,
  md: md || DASHBOARD_CONFIG.SECTION_GAP_DESKTOP,
});

export const getResponsivePadding = (xs, sm, md) => ({
  xs: xs || DASHBOARD_CONFIG.MOBILE_PADDING,
  sm: sm || DASHBOARD_CONFIG.TABLET_PADDING,
  md: md || DASHBOARD_CONFIG.DESKTOP_PADDING,
});

// Mobile-first grid styles
export const getMobileFirstGridStyles = () => ({
  container: true,
  spacing: { xs: 1.5, sm: 2, md: 2.5 },
  sx: {
    "@media (max-width: 600px)": {
      "& .MuiGrid-item": {
        paddingLeft: "8px !important",
        paddingTop: "8px !important",
      },
    },
  },
});

// Enhanced card container for mobile
export const getMobileCardContainerStyles = (theme) => ({
  display: "flex",
  flexDirection: "column",
  gap: DASHBOARD_CONFIG.SECTION_GAP_MOBILE,
  p: { xs: 1, sm: 2 },
  "@media (max-width: 600px)": {
    gap: DASHBOARD_CONFIG.SECTION_GAP_MOBILE,
    p: 1,
    // Ensure cards don't overflow on mobile
    "& .MuiCard-root": {
      marginLeft: 0,
      marginRight: 0,
      maxWidth: "100%",
    },
  },
});

// Mobile-optimized chip styles
export const getMobileChipStyles = (theme) => ({
  fontSize: { xs: "0.875rem", sm: "0.8125rem" },
  height: { xs: 36, sm: 32 },
  "& .MuiChip-label": {
    px: { xs: 1.5, sm: 1 },
    py: { xs: 0.5, sm: 0.25 },
  },
  "& .MuiChip-icon": {
    fontSize: { xs: "1.25rem", sm: "1.125rem" },
  },
});

// Mobile-friendly section header styles
export const getMobileSectionHeaderStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: { xs: 1.5, sm: 2 },
  flexWrap: { xs: "wrap", sm: "nowrap" },
  gap: { xs: 1, sm: 0 },
  "& .MuiTypography-h6": {
    fontSize: { xs: "1.1rem", sm: "1.25rem" },
    fontWeight: 700,
  },
  "& .MuiButton-root": {
    minHeight: { xs: 44, sm: 36 }, // Better touch targets on mobile
    fontSize: { xs: "0.9rem", sm: "0.875rem" },
  },
});

// Animation utilities
export const getFadeProps = (timeout) => ({
  in: true,
  timeout: timeout,
});

// Utility functions for theme-dependent styles
export const getThemeGradient = (theme, startColor, endColor) => 
  `linear-gradient(135deg, ${theme.palette[startColor]} 0%, ${theme.palette[endColor]} 100%)`;

export const getContrastText = (theme, backgroundColor) => 
  theme.palette.getContrastText(backgroundColor);