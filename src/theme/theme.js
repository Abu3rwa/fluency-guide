import { createTheme } from '@mui/material/styles';

// Warm Desert & Educational Blue Color Palette
const colors = {
  primary_colors: {
    warm_sand: "#D4A574",
    golden_yellow: "#F4C430",
    desert_gold: "#B8860B"
  },
  accent_colors: {
    deep_blue: "#2563EB",
    teal_green: "#0D9488",
    navy_blue: "#3B82F6"
  },
  neutral_colors: {
    cream_white: "#FDF6E3",
    soft_beige: "#F5F1E8",
    charcoal_text: "#374151"
  },
  // Status colors
  success: "#0D9488",
  error: "#EF4444",
  info: "#2563EB",
  warning: "#F59E0B",
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary_colors.warm_sand,
      light: colors.primary_colors.golden_yellow,
      dark: colors.primary_colors.desert_gold,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: colors.accent_colors.deep_blue,
      light: colors.accent_colors.navy_blue,
      dark: "#1E293B",
      contrastText: "#FFFFFF",
    },
    accent: {
      main: colors.accent_colors.teal_green,
      light: "#14B8A6",
      dark: "#0F766E",
      contrastText: "#FFFFFF",
    },
    background: {
      default: colors.neutral_colors.cream_white,
      paper: colors.neutral_colors.soft_beige,
    },
    text: {
      primary: colors.neutral_colors.charcoal_text,
      secondary: colors.primary_colors.desert_gold,
      disabled: "#9CA3AF",
    },
    success: {
      main: colors.success,
      light: "#14B8A6",
      dark: "#0F766E",
      contrastText: "#FFFFFF",
    },
    error: {
      main: colors.error,
      light: "#F87171",
      dark: "#DC2626",
      contrastText: "#FFFFFF",
    },
    info: {
      main: colors.info,
      light: "#3B82F6",
      dark: "#1E40AF",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: colors.warning,
      light: "#FBBF24",
      dark: "#D97706",
      contrastText: "#FFFFFF",
    },
    divider: "#E5E7EB",
    grey: {
      50: colors.neutral_colors.cream_white,
      100: colors.neutral_colors.soft_beige,
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: colors.neutral_colors.charcoal_text,
      800: "#1F2937",
      900: "#111827",
    },
  },
  typography: {
    fontFamily: "'Montserrat', 'Tajawal', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: colors.neutral_colors.charcoal_text,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: colors.neutral_colors.charcoal_text,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      color: colors.neutral_colors.charcoal_text,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: colors.neutral_colors.charcoal_text,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: colors.neutral_colors.charcoal_text,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: colors.neutral_colors.charcoal_text,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary_colors.warm_sand,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;


