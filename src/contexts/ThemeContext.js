import React, { createContext, useContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#1976d2",
            light: "#42a5f5",
            dark: "#1565c0",
          },
          secondary: {
            main: "#9c27b0",
            light: "#ba68c8",
            dark: "#7b1fa2",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
        },
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
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useCustomTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useCustomTheme must be used within a ThemeProvider");
  }
  return context;
}
