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
      '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Inter", "Poppins"',
      fontWeight: 700,
      fontSize: "32px",
    },
    h2: {
      fontFamily: '"Inter", "Poppins"',
      fontWeight: 600,
      fontSize: "28px",
    },
    h3: {
      fontFamily: '"Inter", "Poppins"',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Inter", "Poppins"',
      fontWeight: 500,
      color: "#009688", // Teal 500 - primary color
    },
    h5: {
      fontFamily: '"Inter", "Poppins"',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Inter", "Poppins"',
      fontWeight: 500,
      color: "#009688", // Teal 500 - primary color
    },
    body1: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
      fontSize: "16px",
    },
    body2: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
      fontSize: "14px",
    },
    button: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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

export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#26A69A", // More vibrant teal
      light: "#64D8CB", // Brighter light variant
      dark: "#00695C", // Deeper dark variant
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#80CBC4", // Softer teal complement
      light: "#B2DFDB", // Lighter secondary
      dark: "#4DB6AC", // Darker secondary
      contrastText: "#000000",
    },
    // primary: {
    //   main: "#388E3C", // Green 600
    //   light: "#66BB6A", // Green 400
    //   dark: "#1B5E20", // Green 900
    //   contrastText: "#FFFFFF",
    // },
    // secondary: {
    //   main: "#26A69A", // Teal 400
    //   light: "#4DB6AC", // Teal 300
    //   dark: "#00695C", // Teal 700
    //   contrastText: "#000000",
    // },
    background: {
      default: "#0A0F0D", // Richer dark green-black
      paper: "#1A1F1D", // Subtle green tint for papers
    },
    surface: {
      main: "#141918", // Consistent with theme
      light: "#1E2421", // Lighter surface variant
      dark: "#0F1412", // Darker surface variant
    },
    text: {
      primary: "#E8F5E8", // Softer white with green tint
      secondary: "#B0BDB0", // Muted green-gray
      disabled: "#6B776B", // Darker disabled text
    },
    divider: "#2D3D2D", // Subtle green-tinted divider
    action: {
      active: "#26A69A",
      hover: "rgba(38, 166, 154, 0.08)",
      selected: "rgba(38, 166, 154, 0.12)",
      disabled: "rgba(232, 245, 232, 0.26)",
      disabledBackground: "rgba(232, 245, 232, 0.12)",
    },
    error: {
      main: "#FF5252",
      light: "#FF8A80",
      dark: "#D32F2F",
    },
    warning: {
      main: "#FFC107",
      light: "#FFECB3",
      dark: "#F57C00",
    },
    info: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
    },
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.4)",
    "0px 1px 5px rgba(0, 0, 0, 0.4)",
    "0px 1px 8px rgba(0, 0, 0, 0.4)",
    "0px 2px 4px rgba(0, 0, 0, 0.5)",
    "0px 3px 5px rgba(0, 0, 0, 0.5)",
    "0px 3px 5px rgba(0, 0, 0, 0.5)",
    "0px 4px 5px rgba(0, 0, 0, 0.5)",
    "0px 5px 8px rgba(0, 0, 0, 0.5)",
    "0px 5px 14px rgba(0, 0, 0, 0.5)",
    "0px 6px 10px rgba(0, 0, 0, 0.5)",
    "0px 6px 30px rgba(0, 0, 0, 0.5)",
    "0px 7px 10px rgba(0, 0, 0, 0.5)",
    "0px 7px 30px rgba(0, 0, 0, 0.5)",
    "0px 8px 10px rgba(0, 0, 0, 0.5)",
    "0px 8px 30px rgba(0, 0, 0, 0.5)",
    "0px 9px 12px rgba(0, 0, 0, 0.5)",
    "0px 9px 46px rgba(0, 0, 0, 0.5)",
    "0px 10px 13px rgba(0, 0, 0, 0.5)",
    "0px 10px 49px rgba(0, 0, 0, 0.5)",
    "0px 11px 15px rgba(0, 0, 0, 0.5)",
    "0px 11px 52px rgba(0, 0, 0, 0.5)",
    "0px 12px 17px rgba(0, 0, 0, 0.5)",
    "0px 12px 56px rgba(0, 0, 0, 0.5)",
    "0px 13px 19px rgba(0, 0, 0, 0.5)",
  ],
  components: {
    ...lightTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...lightTheme.components?.MuiCard?.styleOverrides?.root,
          backgroundColor: "#1A1F1D",
          backgroundImage:
            "linear-gradient(rgba(38, 166, 154, 0.02), rgba(38, 166, 154, 0.02))",
          border: "1px solid rgba(38, 166, 154, 0.08)",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.4)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#1E2421",
          borderRadius: 8,
          border: "1px solid rgba(38, 166, 154, 0.2)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "#242A26",
            borderColor: "rgba(38, 166, 154, 0.3)",
          },
          "&.Mui-focused": {
            backgroundColor: "#1A1F1D",
            borderColor: "#26A69A",
            boxShadow: "0 0 0 2px rgba(38, 166, 154, 0.2)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
        },
        contained: {
          boxShadow: "0px 2px 8px rgba(38, 166, 154, 0.3)",
          "&:hover": {
            boxShadow: "0px 4px 16px rgba(38, 166, 154, 0.4)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderColor: "rgba(38, 166, 154, 0.3)",
          "&:hover": {
            borderColor: "#26A69A",
            backgroundColor: "rgba(38, 166, 154, 0.08)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#141918",
          backgroundImage:
            "linear-gradient(rgba(38, 166, 154, 0.05), rgba(38, 166, 154, 0.05))",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(38, 166, 154, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1F1D",
          backgroundImage:
            "linear-gradient(rgba(38, 166, 154, 0.02), rgba(38, 166, 154, 0.02))",
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
        },
        elevation2: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.25)",
        },
        elevation3: {
          boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(38, 166, 154, 0.1)",
          color: "#80CBC4",
          "&:hover": {
            backgroundColor: "rgba(38, 166, 154, 0.2)",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2D3D2D",
          color: "#E8F5E8",
          fontSize: "0.875rem",
          borderRadius: 6,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.4)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 0",
          "&:hover": {
            backgroundColor: "rgba(38, 166, 154, 0.08)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(38, 166, 154, 0.12)",
            "&:hover": {
              backgroundColor: "rgba(38, 166, 154, 0.16)",
            },
          },
        },
      },
    },
  },
  typography: {
    ...lightTheme.typography,
    h1: {
      ...lightTheme.typography?.h1,
      color: "#E8F5E8",
      fontWeight: 600,
    },
    h2: {
      ...lightTheme.typography?.h2,
      color: "#E8F5E8",
      fontWeight: 600,
    },
    h3: {
      ...lightTheme.typography?.h3,
      color: "#E8F5E8",
      fontWeight: 500,
    },
    body1: {
      ...lightTheme.typography?.body1,
      color: "#E8F5E8",
    },
    body2: {
      ...lightTheme.typography?.body2,
      color: "#B0BDB0",
    },
  },
});
