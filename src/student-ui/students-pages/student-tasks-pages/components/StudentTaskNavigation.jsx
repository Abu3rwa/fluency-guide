import React, { useEffect, useCallback } from "react";
import { 
  Box, 
  Button, 
  useMediaQuery, 
  Tooltip, 
  Chip, 
  LinearProgress,
  alpha,
  Fab,
  Grow
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTranslation } from "react-i18next";

// Styled components for enhanced UI
const NavigationContainer = styled(Box)(({ theme, isMobile }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(isMobile ? 1.5 : 2),
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  borderTop: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(12px)',
  minHeight: isMobile ? 64 : 72,
  gap: theme.spacing(isMobile ? 2 : 1),
  
  // Enhanced mobile styling
  ...(isMobile && {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar + 1,
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
    paddingBottom: 'env(safe-area-inset-bottom, 8px)',
  }),
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 120,
}));

const EnhancedButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})(({ theme, isMobile, variant }) => ({
  minHeight: isMobile ? 48 : 36,
  fontSize: isMobile ? '0.9rem' : '0.875rem',
  fontWeight: 600,
  borderRadius: 12,
  textTransform: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
    },
  }),
  
  ...(variant === 'outlined' && {
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
      transform: 'translateY(-1px)',
    },
  }),
}));

const MobileFab = styled(Fab)(({ theme, disabled }) => ({
  position: 'fixed',
  bottom: 80,
  right: 16,
  zIndex: theme.zIndex.speedDial,
  background: disabled 
    ? theme.palette.action.disabled 
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const StudentTaskNavigation = ({
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  onNext,
  onPrevious,
  onSubmit,
  isLastQuestion,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Calculate progress percentage
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) return; // Don't interfere with browser shortcuts
      
      switch (event.key) {
        case 'ArrowLeft':
          if (currentQuestionIndex > 0) {
            event.preventDefault();
            onPrevious();
          }
          break;
        case 'ArrowRight':
          if (isAnswered && !isLastQuestion) {
            event.preventDefault();
            onNext();
          } else if (isAnswered && isLastQuestion) {
            event.preventDefault();
            onSubmit();
          }
          break;
        case 'Enter':
          if (isAnswered) {
            event.preventDefault();
            if (isLastQuestion) {
              onSubmit();
            } else {
              onNext();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, isAnswered, isLastQuestion, onNext, onPrevious, onSubmit]);

  // Mobile FAB for next/submit action
  const renderMobileFab = () => {
    if (!isMobile) return null;

    const handleFabClick = () => {
      if (isLastQuestion) {
        onSubmit();
      } else {
        onNext();
      }
    };

    return (
      <Grow in={isAnswered} timeout={300}>
        <MobileFab
          color="primary"
          onClick={handleFabClick}
          disabled={!isAnswered}
          aria-label={isLastQuestion ? t("tasks.finish") : t("tasks.next")}
        >
          {isLastQuestion ? <CheckIcon /> : <ArrowForwardIcon />}
        </MobileFab>
      </Grow>
    );
  };

  return (
    <>
      <NavigationContainer isMobile={isMobile}>
        {/* Progress Indicator */}
        <ProgressIndicator>
          <Chip
            label={`${currentQuestionIndex + 1} / ${totalQuestions}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Box sx={{ flex: 1, minWidth: 60 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                },
              }}
            />
          </Box>
        </ProgressIndicator>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={`${t("tasks.previous")} (←)`} arrow>
            <span>
              <EnhancedButton
                variant="outlined"
                startIcon={isMobile ? <KeyboardArrowLeftIcon /> : <ArrowBackIcon />}
                onClick={onPrevious}
                disabled={currentQuestionIndex === 0}
                isMobile={isMobile}
                size={isMobile ? "large" : "medium"}
              >
                {!isMobile && t("tasks.previous")}
              </EnhancedButton>
            </span>
          </Tooltip>

          {!isMobile && (
            <Tooltip 
              title={isLastQuestion ? `${t("tasks.finish")} (Enter)` : `${t("tasks.next")} (→)`} 
              arrow
            >
              <span>
                <EnhancedButton
                  variant="contained"
                  endIcon={isLastQuestion ? <CheckIcon /> : <ArrowForwardIcon />}
                  onClick={isLastQuestion ? onSubmit : onNext}
                  disabled={!isAnswered}
                  isMobile={isMobile}
                  size="medium"
                >
                  {isLastQuestion ? t("tasks.finish") : t("tasks.next")}
                </EnhancedButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </NavigationContainer>

      {/* Mobile FAB */}
      {renderMobileFab()}
    </>
  );
};

export default StudentTaskNavigation;
