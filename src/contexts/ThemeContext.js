import React, { createContext, useContext, useState, useMemo } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";

// Modern, attractive color palettes
const lightPalette = {
  mode: "light",
  primary: {
    main: "#7C3AED",
    light: "#A78BFA",
    dark: "#4C1D95",
    contrastText: "#fff",
  },
  secondary: {
    main: "#F59E42",
    light: "#FFB26B",
    dark: "#B26B1A",
    contrastText: "#fff",
  },
  background: { default: "#F4F6FB", paper: "#FFFFFF" },
  text: { primary: "#181A20", secondary: "#4B5563", disabled: "#A0AEC0" },
  divider: "#E5E7EB",
};

const darkPalette = {
  mode: "dark",
  primary: {
    main: "#A78BFA",
    light: "#C4B5FD",
    dark: "#7C3AED",
    contrastText: "#181A20",
  },
  secondary: {
    main: "#F59E42",
    light: "#FFB26B",
    dark: "#B26B1A",
    contrastText: "#181A20",
  },
  background: { default: "#181A20", paper: "#23263A" },
  text: { primary: "#F4F6FB", secondary: "#A0AEC0", disabled: "#4B5563" },
  divider: "#23263A",
};

// Modern typography and component overrides
const baseTheme = {
  icon: {
    background: "#7c3aed7a",
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
  const [mode, setMode] = useState("light");
  const theme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: mode === "light" ? lightPalette : darkPalette,
      }),
    [mode]
  );
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };
  const value = {
    theme,
    mode,
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
