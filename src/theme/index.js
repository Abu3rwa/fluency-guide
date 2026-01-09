import { createTheme } from '@mui/material/styles';

// Unified Color System - Primary source of truth for all colors
export const colors = {
    primary: {
        main: '#00897B',
        light: '#4DB6AC',
        dark: '#00695C',
        darker: '#004D40',
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#D4A574',
        light: '#E5C9A8',
        dark: '#B8956A',
        contrastText: '#FFFFFF',
    },
    accent: {
        teal: '#0D9488',
        blue: '#2563EB',
        navy: '#3B82F6',
    },
    success: {
        main: '#4CAF50',
        light: '#81C784',
        dark: '#388E3C',
    },
    warning: {
        main: '#FF9800',
        light: '#FFB74D',
        dark: '#F57C00',
    },
    error: {
        main: '#f44336',
        light: '#E57373',
        dark: '#d32f2f',
    },
    info: {
        main: '#2196F3',
        light: '#64B5F6',
        dark: '#1976D2',
    },
    background: {
        default: '#f5f7fa',
        paper: '#FFFFFF',
        gradient: '#F5F7FA',
    },
    text: {
        primary: '#374151',
        secondary: '#6B7280',
        disabled: '#9CA3AF',
    },
    whatsapp: '#25D366',
};

// Gradient presets
export const gradients = {
    primary: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
    primaryExtended: 'linear-gradient(135deg, #00897B 0%, #00695C 50%, #D4A574 100%)',
    success: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
    warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    error: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
    info: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    card: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
    whatsapp: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)',
};

// Typography settings
export const typography = {
    fontFamily: "'Inter', 'Roboto', 'Tajawal', 'Helvetica', 'Arial', sans-serif",
    h1: {
        fontWeight: 800,
        fontSize: '2.5rem',
        lineHeight: 1.2,
    },
    h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
    },
    h3: {
        fontWeight: 700,
        fontSize: '1.75rem',
        lineHeight: 1.4,
    },
    h4: {
        fontWeight: 700,
        fontSize: '1.5rem',
        lineHeight: 1.4,
    },
    h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.5,
    },
    h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
    },
    button: {
        textTransform: 'none',
        fontWeight: 600,
    },
};

// Spacing system
export const spacing = 8;

// Border radius
export const borderRadius = {
    small: 6,
    medium: 8,
    large: 12,
    xl: 16,
};

// Shadow presets
export const shadows = {
    none: 'none',
    small: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    card: '0 4px 20px rgba(0, 0, 0, 0.08)',
    cardHover: '0 8px 30px rgba(0, 0, 0, 0.12)',
    button: '0 4px 20px rgba(0, 137, 123, 0.3)',
    buttonHover: '0 6px 25px rgba(0, 137, 123, 0.4)',
};

// Common component styles
export const componentStyles = {
    // Stats card styles
    statsCard: {
        p: 2,
        borderRadius: 2,
        color: '#FFFFFF',
    },

    // Action button styles
    actionButton: {
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        py: 1.5,
    },

    // Paper card styles
    paperCard: {
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        background: gradients.card,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' },
    },

    // Icon box styles
    iconBox: {
        p: 1.5,
        borderRadius: 2,
        width: 56,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },

    // Table header styles
    tableHeader: {
        backgroundColor: 'primary.light',
        '& .MuiTableCell-head': {
            fontWeight: 600,
        },
    },

    // Dialog styles
    dialog: {
        borderRadius: 3,
        maxHeight: '80vh',
        overflowY: 'auto',
    },
};

// Create the theme
const theme = createTheme({
    palette: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        background: colors.background,
        text: colors.text,
    },
    typography: typography,
    shape: {
        borderRadius: borderRadius.medium,
    },
    spacing: spacing,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: borderRadius.medium,
                },
                contained: {
                    boxShadow: shadows.button,
                    '&:hover': {
                        boxShadow: shadows.buttonHover,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: borderRadius.large,
                },
                elevation3: {
                    boxShadow: shadows.card,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: borderRadius.large,
                    boxShadow: shadows.card,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: borderRadius.small,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme;
