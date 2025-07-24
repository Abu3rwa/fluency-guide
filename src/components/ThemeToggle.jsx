import React from "react";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useCustomTheme } from "../contexts/ThemeContext";

const ThemeToggle = (props) => {
  const { mode, toggleTheme } = useCustomTheme();
  return (
    <IconButton onClick={toggleTheme} color="primary" {...props}>
      {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggle;
