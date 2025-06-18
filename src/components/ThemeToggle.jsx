import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { useTheme } from "../theme/ThemeContext";

const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          ml: 1,
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "rotate(180deg)",
          },
        }}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
