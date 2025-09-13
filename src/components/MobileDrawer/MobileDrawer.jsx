import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Drawer,
  GlobalStyles,
  useMediaQuery,
  useTheme as useMuiTheme,
  alpha,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useRTL, getDirectionalAnchor } from "../../utils/rtlUtils";

// Import new modular components
import MobileDrawerHeader from "./MobileDrawerHeader";
import MobileDrawerContent from "./MobileDrawerContent";

// Enhanced constants for better UX
const DRAWER_WIDTH = 300; // Increased width for better content display
const ANIMATION_DURATION = 350; // Smooth animation timing
const BACKDROP_BLUR = 8; // Enhanced backdrop blur
const TOUCH_THRESHOLD = 50; // Touch swipe threshold for closing

const MobileDrawer = ({ open, onClose, menuItems = [], theme }) => {
  const { i18n, t } = useTranslation();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  // Memoized handlers for better performance
  const handleNavigation = useCallback((path) => {
    if (!path) return;
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  const isActiveRoute = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutError(t('auth.logoutError', 'Failed to logout. Please try again.'));
    } finally {
      setIsLoggingOut(false);
    }
  }, [onClose, t]);

  const handleSignIn = useCallback(() => {
    navigate("/auth");
    onClose();
  }, [navigate, onClose]);

  // RTL support
  const isRTL = useRTL();
  
  // Memoized values
  const anchor = useMemo(() => {
    return getDirectionalAnchor(isRTL, "left");
  }, [isRTL]);

  const displayName = useMemo(() => {
    return userData?.displayName || userData?.name || t('common.user', 'User');
  }, [userData, t]);

  const dashboardTitle = useMemo(() => {
    if (userData?.isAdmin) return t('dashboard.adminTitle', 'Admin Dashboard');
    if (user) return t('dashboard.studentTitle', 'Student Dashboard');
    return t('app.title', 'Online Teaching');
  }, [userData, user, t]);

  // Enhanced touch event handlers for better mobile UX
  const handleTouchStart = useCallback((e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, [setTouchStart]);

  const handleTouchMove = useCallback((e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  }, [setTouchEnd]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = Math.abs(touchStart.y - touchEnd.y);
    
    // Determine swipe direction based on RTL/LTR and threshold
    const shouldClose = isRTL 
      ? deltaX < -TOUCH_THRESHOLD && deltaY < 100
      : deltaX > TOUCH_THRESHOLD && deltaY < 100;
    
    if (shouldClose) {
      onClose();
    }
    
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  }, [touchStart, touchEnd, isRTL, onClose, setTouchStart, setTouchEnd]);

  const drawerStyles = useMemo(() => {
    const drawerSide = anchor;
    
    return {
      display: { xs: "block", md: "none" },
      "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        width: DRAWER_WIDTH,
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: `blur(${BACKDROP_BLUR}px)`,
        WebkitBackdropFilter: `blur(${BACKDROP_BLUR}px)`,
        borderRight: drawerSide === "left" ? `1px solid ${alpha(theme.palette.divider, 0.12)}` : "none",
        borderLeft: drawerSide === "right" ? `1px solid ${alpha(theme.palette.divider, 0.12)}` : "none",
        borderRadius: drawerSide === "left" ? "0 16px 16px 0" : "16px 0 0 16px",
        // Fixed positioning for proper overlay behavior
        position: "fixed",
        top: 0,
        left: drawerSide === "left" ? 0 : "auto",
        right: drawerSide === "right" ? 0 : "auto",
        height: "100vh",
        zIndex: 1400, // Higher than header (typically 1100)
        transition: `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transform: open ? "translateX(0)" : `translateX(${drawerSide === "left" ? "-100%" : "100%"})`,
        boxShadow: open 
          ? `${drawerSide === "left" ? "8px" : "-8px"} 0 32px ${alpha(theme.palette.common.black, 0.24)}`
          : "none",
        // Enhanced mobile touch optimization
        touchAction: "pan-y",
        overscrollBehavior: "contain",
        // Smooth scroll on iOS
        WebkitOverflowScrolling: "touch",
        // Ensure proper overlay behavior
        willChange: "transform",
      },
      "& .MuiBackdrop-root": {
        backgroundColor: alpha(theme.palette.common.black, 0.6),
        backdropFilter: `blur(${BACKDROP_BLUR / 2}px)`,
        WebkitBackdropFilter: `blur(${BACKDROP_BLUR / 2}px)`,
        transition: `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        zIndex: 1350, // Below drawer but above content
      },
    };
  }, [theme.palette, anchor, open]);

  // Enhanced global styles with smooth animations
  const globalStyles = useMemo(() => ({
    "*::-webkit-scrollbar": { 
      width: "8px",
      backgroundColor: "transparent"
    },
    "*::-webkit-scrollbar-track": {
      backgroundColor: alpha(theme.palette.background.paper, 0.1),
      borderRadius: "4px",
      margin: "4px"
    },
    "*::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(theme.palette.primary.main, 0.6),
      borderRadius: "4px",
      border: `2px solid ${alpha(theme.palette.background.paper, 0.1)}`,
      "&:hover": { 
        backgroundColor: alpha(theme.palette.primary.main, 0.8)
      },
      "&:active": {
        backgroundColor: theme.palette.primary.main
      }
    },
    // Enhanced focus indicators
    "*:focus-visible": {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: "2px",
      borderRadius: "4px"
    },
    // Smooth animations for drawer content
    ".drawer-content": {
      animation: open ? `slideInFromLeft ${ANIMATION_DURATION}ms ease-out` : "none"
    },
    "@keyframes slideInFromLeft": {
      "0%": {
        transform: "translateX(-20px)",
        opacity: 0
      },
      "100%": {
        transform: "translateX(0)",
        opacity: 1
      }
    },
    "@keyframes fadeInUp": {
      "0%": {
        transform: "translateY(20px)",
        opacity: 0
      },
      "100%": {
        transform: "translateY(0)",
        opacity: 1
      }
    }
  }), [theme.palette, open]);

  return (
    <Drawer
      variant="temporary"
      anchor={anchor}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
        "aria-labelledby": "mobile-drawer-title",
        "aria-describedby": "mobile-drawer-description",
        disableRestoreFocus: true, // Prevent focus issues on mobile
        disableEnforceFocus: isMobile, // Allow natural mobile interaction
      }}
      PaperProps={{
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        className: "drawer-content",
        sx: {
          // Additional responsive enhancements
          maxWidth: isMobile ? "85vw" : DRAWER_WIDTH,
          ...(isTablet && {
            width: Math.min(DRAWER_WIDTH, window.innerWidth * 0.8)
          })
        }
      }}
      sx={drawerStyles}
      SlideProps={{
        direction: anchor === "right" ? "left" : "right",
        timeout: {
          enter: ANIMATION_DURATION,
          exit: ANIMATION_DURATION * 0.7
        }
      }}
    >
      <GlobalStyles styles={globalStyles} />
      
      {/* Enhanced Header */}
      <MobileDrawerHeader 
        onClose={onClose} 
        theme={theme} 
        isAnimating={isAnimating}
        animate={true}
      />

      {/* Enhanced Content */}
      <MobileDrawerContent
        open={open}
        menuItems={menuItems}
        theme={theme}
        handleNavigation={handleNavigation}
        isActiveRoute={isActiveRoute}
        handleLogout={handleLogout}
        handleSignIn={handleSignIn}
        isLoggingOut={isLoggingOut}
        logoutError={logoutError}
        setLogoutError={setLogoutError}
        displayName={displayName}
        dashboardTitle={dashboardTitle}
        animate={true}
        isAnimating={isAnimating}
      />
    </Drawer>
  );
};

export default MobileDrawer;