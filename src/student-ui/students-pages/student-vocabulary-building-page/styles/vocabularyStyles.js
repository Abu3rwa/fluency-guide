import { styled } from "@mui/material/styles";
import {
  Card,
  Button,
  Paper,
  Box,
  Typography,
  LinearProgress,
  Chip,
} from "@mui/material";

// Styled Components
export const VocabularyCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-2px)",
  },
}));

export const WordCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: theme.shadows[3],
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[6],
    transform: "translateY(-4px)",
  },
}));

export const ProgressCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  boxShadow: theme.shadows[4],
}));

export const GoalCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  boxShadow: theme.shadows[3],
}));

export const ActionButton = styled(Button)(
  ({ theme, variant = "contained" }) => ({
    borderRadius: theme.spacing(2),
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[4],
    },
    ...(variant === "contained" && {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "&:hover": {
        background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
      },
    }),
  })
);

export const NavigationButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  minWidth: 40,
  height: 40,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

export const StatusChip = styled(Chip)(({ theme, status }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  ...(status === "learned" && {
    backgroundColor: theme.palette.success.main,
    color: "white",
  }),
  ...(status === "difficult" && {
    backgroundColor: theme.palette.warning.main,
    color: "white",
  }),
  ...(status === "new" && {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[700],
  }),
}));

export const DifficultyChip = styled(Chip)(({ theme, level }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 700,
  color: "white",
  ...(level === "A1" && {
    backgroundColor: "#4CAF50",
  }),
  ...(level === "A2" && {
    backgroundColor: "#8BC34A",
  }),
  ...(level === "B1" && {
    backgroundColor: "#FF9800",
  }),
  ...(level === "B2" && {
    backgroundColor: "#FF5722",
  }),
  ...(level === "C1" && {
    backgroundColor: "#F44336",
  }),
  ...(level === "C2" && {
    backgroundColor: "#9C27B0",
  }),
}));

export const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: theme.spacing(1),
  },
}));

export const VocabularyContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  padding: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
  },
}));

export const WordDisplay = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4),
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: theme.spacing(3),
  backdropFilter: "blur(10px)",
  boxShadow: theme.shadows[4],
}));

export const ExampleList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  "& .MuiListItem-root": {
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(1),
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
}));

export const ActionBar = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "center",
  marginTop: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const StatsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: theme.spacing(2),
  },
}));

export const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  borderRadius: theme.spacing(2),
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

export const MotivationalText = styled(Typography)(({ theme }) => ({
  fontStyle: "italic",
  color: theme.palette.primary.main,
  textAlign: "center",
  marginTop: theme.spacing(2),
  fontSize: "1.1rem",
  fontWeight: 500,
}));

// Theme Extensions
export const vocabularyTheme = {
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
};

// Animation Keyframes
export const fadeInUp = {
  "@keyframes fadeInUp": {
    "0%": {
      opacity: 0,
      transform: "translateY(30px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
};

export const pulse = {
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.05)",
    },
    "100%": {
      transform: "scale(1)",
    },
  },
};

export const slideIn = {
  "@keyframes slideIn": {
    "0%": {
      opacity: 0,
      transform: "translateX(-30px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
};

// Utility Styles
export const centerContent = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "60vh",
};

export const responsiveGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 3,
  "@media (max-width: 600px)": {
    gridTemplateColumns: "1fr",
    gap: 2,
  },
};

export const glassEffect = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
};

export const gradientBackground = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
};
