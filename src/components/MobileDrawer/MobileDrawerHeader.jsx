import React, { useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import {
  Close as CloseIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useRTL, getRTLIconClass, directionalIcons } from "../../utils/rtlUtils";

/**
 * Enhanced MobileDrawerHeader - Header section with improved animations and visual hierarchy
 * Features: smooth animations, better accessibility, responsive design, RTL support
 */
const MobileDrawerHeader = ({ 
  onClose, 
  theme, 
  isAnimating = false, 
  animate = true,
  variant = "default", // "default", "minimal", "branded"
  showMenuIcon = true,
  customTitle = null,
}) => {
  const { t, i18n } = useTranslation();
  const muiTheme = useTheme();
  const isRTL = useRTL();

  // Enhanced styling with animations and glassmorphism
  const headerStyles = useMemo(() => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    p: 2.5,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.08)}, 
      ${alpha(theme.palette.secondary.main, 0.05)}
    )`,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    borderRadius: "16px 16px 0 0",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    minHeight: 64,
    // Animated background pattern
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
      opacity: animate && isAnimating ? 0.8 : 0.4,
      transition: "opacity 0.3s ease",
      zIndex: -1
    }
  }), [theme.palette, animate, isAnimating]);

  // Enhanced close button styles
  const closeButtonStyles = useMemo(() => ({
    color: theme.palette.text.secondary,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    width: 40,
    height: 40,
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      transform: "scale(1.05)",
      boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
    },
    "&:active": {
      transform: "scale(0.95)"
    },
    "&:focus-visible": {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`
    }
  }), [theme.palette]);

  // Enhanced title styles
  const titleStyles = useMemo(() => ({
    color: theme.palette.text.primary,
    fontWeight: 700,
    fontSize: "1.25rem",
    letterSpacing: "-0.025em",
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    flex: 1,
    transition: "all 0.3s ease",
    transform: animate && isAnimating ? "translateX(10px)" : "translateX(0px)",
    opacity: animate && isAnimating ? 0.8 : 1,
  }), [theme.palette, animate, isAnimating]);

  // Get appropriate close icon based on RTL direction and variant
  const getCloseIcon = () => {
    if (variant === "minimal") {
      // Use directional chevron for minimal variant
      return isRTL ? ChevronLeftIcon : ChevronRightIcon;
    }
    if (variant === "arrow") {
      // Use directional arrow for arrow variant  
      return isRTL ? ArrowForwardIcon : ArrowBackIcon;
    }
    return CloseIcon;
  };

  const CloseIconComponent = getCloseIcon();
  const shouldFlipIcon = variant === "arrow" || variant === "minimal";

  return (
    <Box sx={headerStyles}>
      {/* Enhanced title section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
        {showMenuIcon && (
          <Fade in={true} timeout={300}>
            <Box
              sx={{
                color: alpha(theme.palette.primary.main, 0.8),
                display: "flex",
                alignItems: "center",
                transform: animate && isAnimating ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <MenuIcon 
                sx={{ 
                  fontSize: "1.5rem",
                  transform: isRTL ? 'scaleX(-1)' : 'none'
                }} 
                className={getRTLIconClass(true)}
              />
            </Box>
          </Fade>
        )}
        
        <Typography
          id="mobile-drawer-title"
          variant="h6"
          component="h2"
          sx={titleStyles}
        >
          {customTitle || t("navigation.menu", "Menu")}
        </Typography>
        
        {/* Optional badge or status indicator */}
        {variant === "branded" && (
          <Box
            sx={{
              ml: "auto",
              mr: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            {t("navigation.mobileMenu", "Mobile")}
          </Box>
        )}
      </Box>

      {/* Enhanced close button */}
      <Tooltip 
        title={t("common.close", "Close")} 
        arrow 
        placement={isRTL ? "bottom-end" : "bottom-start"}
      >
        <IconButton
          onClick={onClose}
          aria-label={t("common.close", "Close")}
          size="medium"
          sx={closeButtonStyles}
        >
          <CloseIconComponent 
            sx={{ 
              fontSize: "1.25rem",
              transition: "transform 0.2s ease",
              transform: `
                ${animate && isAnimating ? "rotate(90deg)" : "rotate(0deg)"}
                ${shouldFlipIcon && isRTL ? "scaleX(-1)" : ""}
              `.trim()
            }}
            className={getRTLIconClass(shouldFlipIcon)}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MobileDrawerHeader;