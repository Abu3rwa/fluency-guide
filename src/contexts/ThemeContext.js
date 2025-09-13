import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Modern, attractive color palettes
const lightPalette = {
  mode: "light",
  primary: {
    main: "#7C3AED", // Vibrant Purple - Primary brand color
    light: "#A78BFA", // Lavender Purple - Lighter variant for hover states
    dark: "#4C1D95", // Deep Purple - Darker variant for emphasis
    contrastText: "#fff", // Pure White - High contrast text on primary colors
  },
  secondary: {
    main: "#F59E42", // Warm Orange - Secondary accent color
    light: "#FFB26B", // Light Peach Orange - Softer variant
    dark: "#B26B1A", // Dark Amber - Deeper orange for contrast
    contrastText: "#fff", // Pure White - High contrast text on secondary colors
  },
  background: { 
    default: "#F4F6FB", // Light Grayish Blue - Main background color
    paper: "#FFFFFF" // Pure White - Card and paper backgrounds
  },
  text: { 
    primary: "#181A20", // Dark Charcoal - Primary text color
    secondary: "#4B5563", // Medium Gray - Secondary text color
    disabled: "#A0AEC0" // Light Gray - Disabled text color
  },
  divider: "#E5E7EB", // Light Gray - Divider and border color
};

const darkPalette = {
  mode: "dark",
  primary: {
    main: "#A78BFA", // Bright Lavender - Primary brand color for dark mode
    light: "#C4B5FD", // Pale Lavender - Lighter variant for subtle elements
    dark: "#7C3AED", // Deep Purple - Darker variant for strong emphasis
    contrastText: "#181A20", // Dark Charcoal - High contrast text on primary colors
  },
  secondary: {
    main: "#F59E42", // Warm Orange - Secondary accent color (same as light mode)
    light: "#FFB26B", // Light Peach Orange - Softer variant
    dark: "#B26B1A", // Dark Amber - Deeper orange for contrast
    contrastText: "#181A20", // Dark Charcoal - High contrast text on secondary colors
  },
  background: { 
    default: "#181A20", // Dark Charcoal - Main dark background
    paper: "#23263A" // Dark Blue Gray - Card and paper backgrounds in dark mode
  },
  text: { 
    primary: "#F4F6FB", // Light Grayish Blue - Primary text color in dark mode
    secondary: "#A0AEC0", // Medium Gray - Secondary text color
    disabled: "#4B5563" // Dark Gray - Disabled text color in dark mode
  },
  divider: "#23263A", // Dark Blue Gray - Divider and border color in dark mode
};

// RTL-aware component overrides and utilities
const getRTLOverrides = (isRTL) => ({
  MuiDrawer: {
    styleOverrides: {
      paper: {
        // Ensure proper z-index for drawer overlay
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
        // RTL icon rotation for directional icons
        '& .rtl-flip': {
          transform: isRTL ? 'scaleX(-1)' : 'none',
        },
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: isRTL ? '40px' : '56px',
        marginLeft: isRTL ? '16px' : '0',
        marginRight: isRTL ? '0' : '16px',
        '& .rtl-flip': {
          transform: isRTL ? 'scaleX(-1)' : 'none',
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
});

// Modern typography and component overrides
const baseTheme = {
  icon: {
    background: "#7c3aed7a", // Semi-transparent Purple (48% opacity) - Icon background
    padding: "4px",
    borderRadius: "14px",
  },
  typography: {
    fontFamily: '"Inter", Arial, sans-serif',
    h1: {
      fontFamily: '"Poppins", "Inter", Arial, sans-serif',
      fontWeight: 800,
      fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
      letterSpacing: "-0.03em",
    },
    h2: {
      fontFamily: '"Poppins", "Inter", Arial, sans-serif',
      fontWeight: 700,
      fontSize: "clamp(2rem, 5vw, 2.75rem)",
    },
    h3: {
      fontFamily: '"Poppins", "Inter", Arial, sans-serif',
      fontWeight: 700,
      fontSize: "2rem",
    },
    h4: {
      fontFamily: '"Poppins", "Inter", Arial, sans-serif',
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontFamily: '"Poppins", "Inter", Arial, sans-serif',
      fontWeight: 600,
      fontSize: "1.2rem",
    },
    h6: {
      fontFamily: '"Poppins", "Inter", Arial, sans-serif',
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: 1.7,
      fontFamily: '"Inter", Arial, sans-serif',
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.95rem",
      lineHeight: 1.6,
      fontFamily: "Roboto",
    },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: "0.01em" },
  },
  shape: { borderRadius: 3 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          transition: "all 0.2s",
          boxShadow: "0 2px 8px rgba(124,58,237,0.08)",
          // RTL support for icon positioning
          '& .MuiButton-startIcon': {
            marginLeft: '0',
            marginRight: '8px',
            '[dir="rtl"] &': {
              marginLeft: '8px',
              marginRight: '0',
            },
          },
          '& .MuiButton-endIcon': {
            marginLeft: '8px',
            marginRight: '0',
            '[dir="rtl"] &': {
              marginLeft: '0',
              marginRight: '8px',
            },
          },
        },
        contained: {
          "&:hover": {
            background: "linear-gradient(90deg, #7C3AED 0%, #F59E42 100%)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(124,58,237,0.12)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: "0 4px 24px rgba(124,58,237,0.08)",
          transition: "box-shadow 0.3s",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          boxShadow: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          borderRadius: theme.shape.borderRadius,
          "&.Mui-focused": {
            backgroundColor: theme.palette.background.paper,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": {
            border: "none",
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
          textDecoration: "none",
          fontWeight: 500,
          "&:hover": {
            textDecoration: "underline",
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          height: 3,
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor:
            theme.palette.grey[theme.palette.mode === "light" ? 700 : 800],
          color: "#fff",
          fontSize: "0.875rem",
        }),
        arrow: ({ theme }) => ({
          color: theme.palette.grey[theme.palette.mode === "light" ? 700 : 800],
        }),
      },
    },
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });
  
  const { i18n } = useTranslation();
  
  // Track RTL state based on language
  const [isRTL, setIsRTL] = useState(() => {
    return i18n.language === 'ar' || i18n.dir?.() === 'rtl';
  });
  
  // Update RTL state when language changes
  useEffect(() => {
    const updateRTL = () => {
      const newIsRTL = i18n.language === 'ar' || i18n.dir?.() === 'rtl';
      setIsRTL(newIsRTL);
      
      // Update document direction
      document.documentElement.dir = newIsRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = i18n.language;
    };
    
    updateRTL();
    
    // Listen for language changes
    const handleLanguageChange = () => {
      updateRTL();
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  const theme = useMemo(
    () => {
      const rtlOverrides = getRTLOverrides(isRTL);
      return createTheme({
        ...baseTheme,
        direction: isRTL ? 'rtl' : 'ltr',
        palette: mode === "light" ? lightPalette : darkPalette,
        components: {
          ...baseTheme.components,
          ...rtlOverrides,
        },
      });
    },
    [mode, isRTL]
  );
  
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };
  
  const value = {
    theme,
    mode,
    isRTL,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useCustomTheme must be used within a ThemeProvider");
  }
  return context;
}
