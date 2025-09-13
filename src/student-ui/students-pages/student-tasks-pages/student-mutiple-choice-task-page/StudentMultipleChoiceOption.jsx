import React, { useCallback, useRef, useEffect } from "react";
import { 
  FormControlLabel, 
  Radio, 
  Box, 
  Typography, 
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { 
  useMobileAccessibility, 
  useTouchAccessibility 
} from "../utils/mobileAccessibilityUtils";

// Haptic feedback utility
const triggerHapticFeedback = (type = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'selection':
        navigator.vibrate([15, 5, 10]);
        break;
      default:
        navigator.vibrate(10);
    }
  }
};

const StudentMultipleChoiceOption = ({
  value,
  label,
  selected,
  onChange,
  disabled,
  isMobile,
  isSmallScreen,
  optionIndex,
  enhancedMobile = false,
  showHapticFeedback = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const optionRef = useRef(null);
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));
  
  // Mobile accessibility enhancements
  const { 
    accessibilityConfig, 
    announce, 
    getHighContrastStyles,
    getScaledTextStyles,
  } = useMobileAccessibility();
  
  const { getTouchProps, enhanceFocusVisibility } = useTouchAccessibility();

  // Enhanced click handler with accessibility features
  const handleClick = useCallback(() => {
    if (disabled) return;
    
    // Trigger haptic feedback on mobile
    if (enhancedMobile && showHapticFeedback && isMobile) {
      triggerHapticFeedback('selection');
    }
    
    // Announce selection to screen readers
    if (accessibilityConfig.screenReader) {
      const optionLabel = `Option ${optionIndex + 1}: ${label}`;
      const announcement = selected 
        ? `Deselected ${optionLabel}` 
        : `Selected ${optionLabel}`;
      announce(announcement, 'assertive', 100);
    }
    
    onChange({ target: { value } });
  }, [disabled, enhancedMobile, showHapticFeedback, isMobile, accessibilityConfig.screenReader, optionIndex, label, selected, announce, onChange, value]);
  
  // Enhanced keyboard handler
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    
    // Handle keyboard activation
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
    
    // Handle keyboard shortcuts (1-4 for options A-D)
    const shortcutKey = (optionIndex + 1).toString();
    if (e.key === shortcutKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      handleClick();
    }
  }, [disabled, handleClick, optionIndex]);
  
  // Enhance focus visibility for touch devices
  useEffect(() => {
    if (enhancedMobile && optionRef.current && isMobile) {
      return enhanceFocusVisibility(optionRef.current);
    }
  }, [enhancedMobile, isMobile, enhanceFocusVisibility]);
  
  // Generate option letter (A, B, C, D)
  const optionLetter = String.fromCharCode(65 + optionIndex);
  
  // Get touch-optimized props
  const touchProps = enhancedMobile && isMobile 
    ? getTouchProps(isExtraSmall ? 44 : 56) 
    : {};
  
  // Get accessibility-optimized styles
  const accessibleTextStyles = getScaledTextStyles(isMobile ? 14 : 16);
  const contrastStyles = getHighContrastStyles();

  return (
    <Box
      ref={optionRef}
      sx={{
        mb: isMobile ? 1.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: accessibilityConfig.reducedMotion 
          ? 'none' 
          : "all 0.2s ease-in-out",
        
        // Enhanced hover effects
        "&:hover": {
          transform: disabled || accessibilityConfig.reducedMotion
            ? "none" 
            : "translateY(-1px)",
          boxShadow: !disabled && enhancedMobile 
            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}` 
            : 'none',
        },
        
        // Touch-friendly sizing
        ...(enhancedMobile && {
          minHeight: touchProps.style?.minHeight || '56px',
        }),
        
        // High contrast enhancements
        ...contrastStyles,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={selected}
      aria-label={`${t("tasks.option", "Option")} ${optionLetter}: ${label}`}
      aria-describedby={accessibilityConfig.screenReader 
        ? `option-${optionIndex}-description` 
        : undefined}
      tabIndex={disabled ? -1 : 0}
      {...(enhancedMobile && isMobile && touchProps)}
    >
      {/* Screen reader description */}
      {accessibilityConfig.screenReader && (
        <Box
          id={`option-${optionIndex}-description`}
          sx={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {`Press ${optionIndex + 1} or space to select this option. 
           ${selected ? 'Currently selected.' : 'Not selected.'}`}
        </Box>
      )}
      
      <FormControlLabel
        value={value}
        control={
          <Radio
            checked={selected}
            onChange={onChange}
            disabled={disabled}
            inputProps={{
              'aria-label': `${t("tasks.option", "Option")} ${optionLetter}`,
              'aria-describedby': accessibilityConfig.shouldUseVerboseLabels 
                ? `option-${optionIndex}-verbose` 
                : undefined,
            }}
            sx={{
              // Enhanced radio button styling
              "&.Mui-checked": {
                color: theme.palette.primary.main,
              },
              "&.Mui-disabled": {
                color: theme.palette.action.disabled,
              },
              // Larger touch target on mobile
              ...(enhancedMobile && isMobile && {
                '& .MuiSvgIcon-root': {
                  fontSize: isExtraSmall ? '1.5rem' : '1.75rem',
                },
              }),
              // High contrast mode
              ...(accessibilityConfig.highContrast && {
                '&.Mui-checked': {
                  color: 'currentColor',
                  backgroundColor: 'transparent',
                  outline: '2px solid currentColor',
                },
              }),
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
            {/* Option letter indicator */}
            {enhancedMobile && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color: selected 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.primary.main,
                  backgroundColor: selected 
                    ? theme.palette.primary.main 
                    : 'transparent',
                  border: `1px solid ${theme.palette.primary.main}`,
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {optionLetter}
              </Typography>
            )}
            
            <Typography
              variant="body1"
              sx={{
                ...accessibleTextStyles,
                fontWeight: selected ? 600 : 400,
                color: selected
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                textAlign: "left",
                wordBreak: "break-word",
                flex: 1,
                
                // Enhanced mobile typography
                ...(enhancedMobile && isMobile && {
                  fontSize: isExtraSmall ? '0.9rem' : '1rem',
                  lineHeight: accessibilityConfig.textScale > 1 ? 1.6 : 1.5,
                }),
                
                // High contrast text
                ...(accessibilityConfig.highContrast && {
                  fontWeight: 'bold',
                  color: 'currentColor',
                }),
              }}
              dir="ltr"
            >
              {label}
            </Typography>
            
            {/* Keyboard shortcut hint */}
            {enhancedMobile && !isMobile && !accessibilityConfig.screenReader && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  opacity: 0.7,
                  marginTop: '2px',
                }}
              >
                {optionIndex + 1}
              </Typography>
            )}
          </Box>
        }
        sx={{
          background: selected
            ? alpha(theme.palette.primary.main, accessibilityConfig.highContrast ? 0.3 : 0.15)
            : theme.palette.background.paper,
          borderRadius: enhancedMobile ? 3 : 2,
          px: { xs: enhancedMobile ? 2 : 2, sm: 3 },
          py: { xs: enhancedMobile ? 2 : 1.5, sm: 2 },
          width: "100%",
          minWidth: 250,
          border: `${accessibilityConfig.highContrast ? '3px' : '2px'} solid ${
            selected ? theme.palette.primary.main : theme.palette.divider
          }`,
          transition: accessibilityConfig.reducedMotion 
            ? 'none' 
            : "all 0.2s ease-in-out",
          
          // Enhanced hover states
          "&:hover": {
            background: disabled
              ? theme.palette.background.paper
              : selected
              ? alpha(theme.palette.primary.main, accessibilityConfig.highContrast ? 0.4 : 0.25)
              : theme.palette.action.hover,
            borderColor: disabled
              ? theme.palette.divider
              : theme.palette.primary.main,
            
            // Enhanced mobile hover
            ...(enhancedMobile && !disabled && {
              transform: accessibilityConfig.reducedMotion ? 'none' : 'scale(1.02)',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
            }),
          },
          
          // Enhanced disabled state
          "&.Mui-disabled": {
            opacity: 0.6,
            background: theme.palette.action.disabledBackground,
          },
          
          // Focus styles for accessibility
          "&:focus-within": {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
          
          // High contrast mode enhancements
          ...(accessibilityConfig.highContrast && {
            backgroundColor: 'transparent',
            color: 'currentColor',
            fontWeight: 'bold',
          }),
        }}
      />
      
      {/* Verbose screen reader description */}
      {accessibilityConfig.shouldUseVerboseLabels && (
        <Box
          id={`option-${optionIndex}-verbose`}
          sx={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {`Option ${optionLetter} of ${t('tasks.multipleChoice', 'multiple choice question')}. 
           ${label}. 
           ${selected ? 'Currently selected' : 'Not selected'}. 
           Press space or enter to ${selected ? 'deselect' : 'select'}.`}
        </Box>
      )}
    </Box>
  );
};

export default StudentMultipleChoiceOption;
