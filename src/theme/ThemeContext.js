import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "./theme";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeMode") || "light";
    }
    return "light";
  });

  const theme = useMemo(() => {
    return mode === "light" ? lightTheme : darkTheme;
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  const value = useMemo(
    () => ({
      theme,
      mode,
      toggleTheme,
    }),
    [theme, mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
