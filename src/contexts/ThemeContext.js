// import React, { createContext, useContext, useState, useMemo } from "react";
// import {
//   createTheme,
//   ThemeProvider as MuiThemeProvider,
// } from "@mui/material/styles";

// // Enhanced palette
// const lightPalette = {
//   mode: "light",
//   primary: {
//     main: "#009688",
//     light: "#80CBC4",
//     dark: "#00796B",
//     contrastText: "#fff",
//   },
//   secondary: {
//     main: "#80CBC4",
//     light: "#B2DFDB",
//     dark: "#4DB6AC",
//     contrastText: "#000",
//   },
//   error: {
//     main: "#F44336",
//     light: "#ff7961",
//     dark: "#ba000d",
//     contrastText: "#fff",
//   },
//   warning: {
//     main: "#FF9800",
//     light: "#ffc947",
//     dark: "#c66900",
//     contrastText: "#fff",
//   },
//   info: {
//     main: "#2196F3",
//     light: "#64B6F7",
//     dark: "#1769AA",
//     contrastText: "#fff",
//   },
//   success: {
//     main: "#4CAF50",
//     light: "#80e27e",
//     dark: "#087f23",
//     contrastText: "#fff",
//   },
//   background: {
//     default: "#FAFAFA",
//     paper: "#fff",
//   },
//   text: {
//     primary: "#222",
//     secondary: "#757575",
//     disabled: "#B0BDB0",
//   },
//   divider: "#E0E0E0",
//   action: {
//     hover: "#F5F5F5",
//     selected: "#E0E0E0",
//     disabled: "#B0BDB0",
//     disabledBackground: "#F5F5F5",
//     focus: "#80CBC4",
//     active: "#009688",
//     selectedOpacity: 0.12,
//   },
// };

// const darkPalette = {
//   mode: "dark",
//   primary: {
//     main: "#26A69A",
//     light: "#64D8CB",
//     dark: "#00695C",
//     contrastText: "#fff",
//   },
//   secondary: {
//     main: "#80CBC4",
//     light: "#B2DFDB",
//     dark: "#4DB6AC",
//     contrastText: "#000",
//   },
//   error: {
//     main: "#FF5252",
//     light: "#ff867f",
//     dark: "#c50e29",
//     contrastText: "#fff",
//   },
//   warning: {
//     main: "#FFC107",
//     light: "#fff350",
//     dark: "#c79100",
//     contrastText: "#000",
//   },
//   info: {
//     main: "#2196F3",
//     light: "#64B6F7",
//     dark: "#1769AA",
//     contrastText: "#fff",
//   },
//   success: {
//     main: "#4CAF50",
//     light: "#80e27e",
//     dark: "#087f23",
//     contrastText: "#fff",
//   },
//   background: {
//     default: "#0A0F0D",
//     paper: "#1A1F1D",
//   },
//   text: {
//     primary: "#E8F5E8",
//     secondary: "#B0BDB0",
//     disabled: "#6B776B",
//   },
//   divider: "#2D3D2D",
//   action: {
//     hover: "#232323",
//     selected: "#2D3D2D",
//     disabled: "#6B776B",
//     disabledBackground: "#232323",
//     focus: "#80CBC4",
//     active: "#26A69A",
//     selectedOpacity: 0.12,
//   },
// };

// // Enhanced typography
// const baseTheme = {
//   typography: {
//     fontFamily:
//       '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
//     h1: {
//       fontWeight: 700,
//       fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
//       letterSpacing: "-0.02em",
//       lineHeight: 1.2,
//     },
//     h2: {
//       fontWeight: 600,
//       fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
//       letterSpacing: "-0.01em",
//       lineHeight: 1.2,
//     },
//     h3: { fontWeight: 600, fontSize: "2rem", lineHeight: 1.2 },
//     h4: { fontWeight: 500, fontSize: "1.5rem", lineHeight: 1.3 },
//     h5: { fontWeight: 500, fontSize: "1.2rem", lineHeight: 1.3 },
//     h6: { fontWeight: 500, fontSize: "1rem", lineHeight: 1.3 },
//     body1: { fontWeight: 400, fontSize: "1rem", lineHeight: 1.6 },
//     body2: { fontWeight: 400, fontSize: "0.9rem", lineHeight: 1.7 },
//     button: { fontWeight: 500, textTransform: "none", letterSpacing: "0.01em" },
//   },
//   shape: { borderRadius: 12 },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           borderRadius: 8,
//           padding: "12px 24px",
//           boxShadow: "none",
//           fontWeight: 600,
//         },
//         contained: {
//           "&:hover": { boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" },
//         },
//       },
//     },
//     MuiCard: {
//       styleOverrides: {
//         root: {
//           borderRadius: 16,
//           boxShadow: "0px 4px 8px rgba(0,0,0,0.05)",
//         },
//       },
//     },
//     MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
//     MuiAppBar: {
//       styleOverrides: {
//         root: { backgroundColor: "transparent", boxShadow: "none" },
//       },
//     },
//     MuiInputBase: {
//       styleOverrides: {
//         root: {
//           backgroundColor: "#F5F5F5",
//           borderRadius: 8,
//           "&.Mui-focused": { backgroundColor: "#fff" },
//         },
//       },
//     },
//     MuiChip: {
//       styleOverrides: {
//         root: {
//           backgroundColor: "#E0E0E0",
//           color: "#222",
//           fontWeight: 500,
//         },
//       },
//     },
//     MuiDivider: {
//       styleOverrides: {
//         root: {
//           backgroundColor: "#E0E0E0",
//         },
//       },
//     },
//     MuiTooltip: {
//       styleOverrides: {
//         tooltip: {
//           backgroundColor: "#232323",
//           color: "#fff",
//           fontSize: "0.95rem",
//         },
//       },
//     },
//     MuiLink: {
//       styleOverrides: {
//         root: {
//           color: "inherit",
//           textDecoration: "none",
//           "&:hover": {
//             color: "#009688",
//             textDecoration: "underline",
//           },
//         },
//       },
//     },
//     MuiTabs: {
//       styleOverrides: {
//         root: {
//           minHeight: 40,
//         },
//         indicator: {
//           height: 3,
//           borderRadius: 3,
//         },
//       },
//     },
//   },
// };

// const ThemeContext = createContext();

// export function ThemeProvider({ children }) {
//   const [mode, setMode] = useState("light");
//   const theme = useMemo(
//     () =>
//       createTheme({
//         ...baseTheme,
//         palette: mode === "light" ? lightPalette : darkPalette,
//       }),
//     [mode]
//   );
//   const toggleTheme = () => {
//     setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
//   };
//   const value = {
//     theme,
//     mode,
//     toggleTheme,
//   };
//   return (
//     <ThemeContext.Provider value={value}>
//       <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
//     </ThemeContext.Provider>
//   );
// }

// export function useCustomTheme() {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error("useCustomTheme must be used within a ThemeProvider");
//   }
//   return context;
// }
import React, { createContext, useContext, useState, useMemo } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";

// "Aura" Theme: A professional theme built on trust (blue) and hope (amber).

// Light Palette: Clean, calm, and optimistic. ☀️
const lightPalette = {
  mode: "light",
  primary: {
    main: "#1976D2", // A strong, trustworthy blue
    light: "#63A4FF",
    dark: "#004BA0",
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#FFA000", // A warm, hopeful amber
    light: "#FFD149",
    dark: "#C67100",
    contrastText: "#000000",
  },
  error: {
    main: "#D32F2F",
    light: "#FF6659",
    dark: "#9A0007",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#F57C00",
    light: "#FFAD42",
    dark: "#BB4D00",
    contrastText: "#FFFFFF",
  },
  info: {
    main: "#0288D1",
    light: "#5EB8FF",
    dark: "#005B9F",
    contrastText: "#FFFFFF",
  },
  success: {
    main: "#388E3C",
    light: "#6ABF69",
    dark: "#00600F",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#F7F9FC", // A clean, slightly cool off-white
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1A2027", // Near-black for readability
    secondary: "#4A5568",
    disabled: "#A0AEC0",
  },
  divider: "#E2E8F0",
  action: {
    active: "rgba(25, 118, 210, 0.54)", // primary.main with opacity
    hover: "rgba(25, 118, 210, 0.04)",
    selected: "rgba(25, 118, 210, 0.08)",
    disabled: "rgba(0, 0, 0, 0.26)",
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    focus: "rgba(25, 118, 210, 0.12)",
  },
};

// Dark Palette: Focused, stable, and modern. 🌙
const darkPalette = {
  mode: "dark",
  primary: {
    main: "#64B5F6", // A brighter blue for dark backgrounds
    light: "#9BE7FF",
    dark: "#2286C3",
    contrastText: "#000000",
  },
  secondary: {
    main: "#FFCA28", // A vibrant gold
    light: "#FFFD61",
    dark: "#C79A00",
    contrastText: "#000000",
  },
  error: {
    main: "#EF5350",
    light: "#FF867C",
    dark: "#B61827",
    contrastText: "#000000",
  },
  warning: {
    main: "#FFA726",
    light: "#FFD95B",
    dark: "#C77800",
    contrastText: "#000000",
  },
  info: {
    main: "#29B6F6",
    light: "#73E8FF",
    dark: "#0086C3",
    contrastText: "#000000",
  },
  success: {
    main: "#66BB6A",
    light: "#98EE99",
    dark: "#338A3E",
    contrastText: "#000000",
  },
  background: {
    default: "#121212", // Material Design standard dark background
    paper: "#1E1E1E",
  },
  text: {
    primary: "#EAECEF", // A crisp, light gray
    secondary: "#A0AEC0",
    disabled: "#4A5568",
  },
  divider: "#2D3748",
  action: {
    active: "#64B5F6", // primary.main
    hover: "rgba(100, 181, 246, 0.08)",
    selected: "rgba(100, 181, 246, 0.16)",
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
    focus: "rgba(100, 181, 246, 0.12)",
  },
};

// Refined base theme for a professional feel.
const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: "clamp(2rem, 4vw, 2.75rem)",
      letterSpacing: "-0.01em",
      lineHeight: 1.2,
    },
    h3: { fontWeight: 600, fontSize: "1.75rem", lineHeight: 1.25 },
    h4: { fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.3 },
    h5: { fontWeight: 500, fontSize: "1.1rem", lineHeight: 1.4 },
    h6: { fontWeight: 500, fontSize: "1rem", lineHeight: 1.4 },
    body1: { fontWeight: 400, fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.01em" },
    caption: { fontWeight: 400, fontSize: "0.75rem", color: "text.secondary" },
  },
  shape: { borderRadius: 8 }, // A more subtle, professional radius.
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          padding: "10px 22px",
          transition: "all 0.3s ease-in-out",
        }),
        contained: ({ theme }) => ({
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[2],
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius * 1.5,
          boxShadow: "0px 5px 15px rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow: "0px 8px 25px rgba(0,0,0,0.08)",
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
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
