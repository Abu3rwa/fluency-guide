import React, { useCallback, useMemo } from "react";
import { IconButton, Tooltip } from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { useCustomTheme } from "../../contexts/ThemeContext";

const ThemeToggle = ({ 
  ariaLabel,
  disabled = false,
}) => {
  const { mode, toggleTheme } = useCustomTheme();

  // Simple theme toggle
  const handleToggleTheme = useCallback(() => {
    if (disabled) return;
    toggleTheme();
  }, [disabled, toggleTheme]);

  // Simple icon selection
  const getThemeIcon = useMemo(() => {
    return mode === "dark" ? LightModeIcon : DarkModeIcon;
  }, [mode]);

  // Simple tooltip text
  const getTooltipText = useMemo(() => {
    if (disabled) return "Theme switching is disabled";
    const action = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
    return ariaLabel || action;
  }, [disabled, mode, ariaLabel]);
  return (
    <Tooltip title={getTooltipText} arrow placement="bottom">
      {disabled ? (
        <span>
          <IconButton
            onClick={handleToggleTheme}
            disabled={disabled}
            aria-label={getTooltipText}
            sx={{
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)"
              }
            }}
          >
            {React.createElement(getThemeIcon)}
          </IconButton>
        </span>
      ) : (
        <IconButton
          onClick={handleToggleTheme}
          disabled={disabled}
          aria-label={getTooltipText}
          sx={{
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.1)"
            }
          }}
        >
          {React.createElement(getThemeIcon)}
        </IconButton>
      )}
    </Tooltip>
  );
};

// Simple Theme Toggle - shows only icons
// Features: basic theme switching with simple hover effect

export default ThemeToggle;
