import { createTheme } from "@mui/material/styles";

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#009688", // Teal 500
      light: "#80CBC4", // Teal 200
      dark: "#00796B", // Teal 700
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#80CBC4", // Teal 200
      light: "#B2DFDB", // Teal 100
      dark: "#4DB6AC", // Teal 300
      contrastText: "#000000",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FAFAFA",
    },
    surface: {
      main: "#FAFAFA",
    },
    text: {
      primary: "#000000",
      secondary: "#757575",
    },
    error: {
      main: "#F44336",
    },
    warning: {
      main: "#FF9800",
    },
    info: {
      main: "#2196F3",
    },
    success: {
      main: "#4CAF50",
    },
  },
  typography: {
    fontFamily:
      '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: "Poppins",
      fontWeight: 700,
      fontSize: "32px",
    },
    h2: {
      fontFamily: "Poppins",
      fontWeight: 600,
      fontSize: "28px",
    },
    h3: {
      fontFamily: "Poppins",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "Poppins",
      fontWeight: 500,
      color: "#009688", // Teal 500 - primary color
    },
    h5: {
      fontFamily: "Poppins",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "Poppins",
      fontWeight: 500,
      color: "#009688", // Teal 500 - primary color
    },
    body1: {
      fontFamily: "Inter",
      fontWeight: 400,
      fontSize: "16px",
    },
    body2: {
      fontFamily: "Inter",
      fontWeight: 400,
      fontSize: "14px",
    },
    button: {
      fontFamily: "Inter",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 8px rgba(0, 0, 0, 0.05)",
    "0px 8px 16px rgba(0, 0, 0, 0.05)",
    "0px 16px 24px rgba(0, 0, 0, 0.05)",
    "0px 24px 32px rgba(0, 0, 0, 0.05)",
    ...Array(19).fill("none"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "12px 24px",
          boxShadow: "none",
        },
        contained: {
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#F5F5F5",
          borderRadius: 8,
          "&.Mui-focused": {
            backgroundColor: "#FFFFFF",
          },
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#00796B", // Teal 700
      light: "#4DB6AC", // Teal 300
      dark: "#004D40", // Teal 900
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#4DB6AC", // Teal 300
      light: "#80CBC4", // Teal 200
      dark: "#009688", // Teal 500
      contrastText: "#000000",
    },
    background: {
      default: "#000501", // Your dark background color
      paper: "#1E1E1E",
    },
    surface: {
      main: "#121212",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0B0B0",
    },
    error: {
      main: "#EF5350",
    },
    warning: {
      main: "#FFA726",
    },
    info: {
      main: "#29B6F6",
    },
    success: {
      main: "#66BB6A",
    },
  },
  components: {
    ...lightTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...lightTheme.components.MuiCard.styleOverrides.root,
          backgroundColor: "#1E1E1E",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#2C2C2C",
          borderRadius: 8,
          "&.Mui-focused": {
            backgroundColor: "#1E1E1E",
          },
        },
      },
    },
  },
});
