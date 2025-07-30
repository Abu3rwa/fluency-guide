import React from "react";
import { IconButton } from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { useCustomTheme } from "../../contexts/ThemeContext";

const ThemeToggle = ({ ariaLabel }) => {
  const { mode, toggleTheme } = useCustomTheme();
  const ThemeIcon = mode === "dark" ? LightModeIcon : DarkModeIcon;
  const themeIconColor = mode === "dark" ? "white" : "#222";
  return (
    <IconButton
      size="small"
      onClick={toggleTheme}
      aria-label={ariaLabel || "Toggle theme"}
      sx={{
        color: themeIconColor,
        p: { xs: 0.25, sm: 1 },
        outline: "none",
        boxShadow: "none",
        transition: "box-shadow 0.2s",
        "&:focus-visible": {
          boxShadow: "0 0 0 2px #1976d2",
        },
        "&:hover": {
          backgroundColor:
            mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      <ThemeIcon sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }} />
    </IconButton>
  );
};

export default ThemeToggle;
