import React, { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControl,
  FormLabel,
  Box,
  Chip,
  useMediaQuery,
  Zoom,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import StudentMultipleChoiceOption from "./StudentMultipleChoiceOption";
import { triggerHapticFeedback } from "../utils/mobileUIUtils";

const StudentMultipleChoiceQuestionCard = ({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
  isMobile,
  isSmallScreen,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef(null);

  // Answer handler with haptic feedback
  const handleChange = useCallback((event) => {
    const value = event.target.value;
    triggerHapticFeedback('selection');
    onAnswer(question.id, value);
  }, [onAnswer, question.id]);
  
  // Handle card press states for visual feedback
  const handleTouchStart = useCallback(() => {
    if (isMobile) setIsPressed(true);
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    if (isMobile) setIsPressed(false);
  }, [isMobile]);

  if (!question || !question.text || !question.options) {
    return (
      <Card 
        elevation={3}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" color="error">
            {t("tasks.invalidQuestionFormat")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Zoom in timeout={300}>
      <Card
        ref={cardRef}
        elevation={isPressed ? 1 : 3}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        data-selected={!!selectedAnswer}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: isMobile ? 1 : 2,
          borderRadius: isMobile ? 4 : 2,
          transition: 'all 0.15s ease-in-out',
          textAlign: 'center',
          transform: isPressed ? (isMobile ? 'scale(0.98)' : 'scale(0.99)') : 'scale(1)',
          boxShadow: isPressed ? 1 : 3,
          border: selectedAnswer ? 2 : 0,
          borderColor: selectedAnswer ? 'primary.main' : 'transparent',
          '&:hover': {
            transform: 'scale(1.01)'
          }
        }}
      >
      <CardContent sx={{
        p: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        '&:last-child': { pb: 0 }
      }}>
       

        {/* Question Content Section */}
        <Box sx={{
          p: { xs: '2rem 1.5rem 1.5rem', sm: '2.5rem 1.5rem 1.5rem', md: '2.5rem 2rem 1.5rem' },
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          {/* Question Text */}
          <Box sx={{
            textAlign: 'center',
            mb: { xs: 4, sm: 5 },
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.5rem' },
                lineHeight: { xs: 1.5, sm: 1.4 },
                color: 'text.primary',
                mb: 1.5,
                position: 'relative',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                width: '100%',
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                textAlign: 'center',
                px: isMobile ? 1 : 0
              }}
              dir="ltr"
            >
              {question.text}
            </Typography>
            
            {/* Question number indicator line */}
            <Box sx={{
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, var(--mui-palette-primary-main, #1976d2), var(--mui-palette-secondary-main, #9c27b0))',
              borderRadius: 1,
              margin: '0 auto',
              opacity: 0.7
            }} />
          </Box>

          {/* Options Section */}
          <FormControl component="fieldset" sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <FormLabel component="legend" sx={{
              mb: { xs: 3, sm: 3.5, md: 4 },
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
              fontWeight: 600,
              textAlign: 'center',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '2px',
                background: 'divider',
                borderRadius: '1px'
              }
            }}>
              {t("tasks.selectCorrectAnswer", "Select the correct answer")}
            </FormLabel>
          
              <RadioGroup
                aria-label={`multiple-choice-question-${question.id}`}
                name={`question-${question.id}`}
                value={selectedAnswer || ""}
                onChange={handleChange}
                sx={{
                  gap: { xs: 2, sm: 2.5 },
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 3,
                  p: { xs: 2, sm: 2.5 },
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxSizing: 'border-box',
                  minWidth: 250,
                  '& .MuiFormControlLabel-root': {
                    margin: 0,
                    borderRadius: 1,
                    transition: 'all 0.2s ease-in-out',
                    minWidth: 250,
                    width: '100%',
                    '&:hover': {
                      background: 'rgba(25, 118, 210, 0.04)'
                    }
                  }
                }}
              >
                {question.options.map((option, index) => {
                  const optionText = option.text || option;
                  return (
                    <StudentMultipleChoiceOption
                      key={index}
                      value={optionText}
                      label={optionText}
                      selected={selectedAnswer === optionText}
                      onChange={handleChange}
                      disabled={disabled}
                      isMobile={isMobile}
                      isSmallScreen={isSmallScreen}
                      optionIndex={index}
                    />
                  );
                })}
              </RadioGroup>
          
          </FormControl>
        </Box>

        {/* Footer Section */}
        {(question.category || question.tags) && (
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(245, 245, 245, 0.5) 100%)',
            borderRadius: '0 0 1rem 1rem',
            p: { xs: 2, sm: 2.5 },
            mt: { xs: 3, sm: 4 },
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            width: '100%',
            boxSizing: 'border-box',
            maxWidth: '100%',
            minWidth: 0
          }}>
            <Box 
              display="flex" 
              gap={1.5} 
              flexWrap="wrap" 
              justifyContent="center" 
              alignItems="center"
              sx={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0
              }}
            >
              {question.category && (
                <Chip 
                  label={question.category} 
                  size={isMobile ? "small" : "medium"} 
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    fontWeight: 500,
                    borderColor: 'rgba(25, 118, 210, 0.3)',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                />
              )}
              {question.tags && question.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    fontSize: '0.7rem',
                    height: '26px',
                    borderColor: 'rgba(156, 39, 176, 0.3)',
                    color: 'secondary.main'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      </Card>
    </Zoom>
  );
};

export default StudentMultipleChoiceQuestionCard;
