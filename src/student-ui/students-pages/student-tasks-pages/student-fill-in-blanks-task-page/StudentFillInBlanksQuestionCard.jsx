import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import TouchAppIcon from "@mui/icons-material/TouchApp";

const Blank = ({
  currentAnswer,
  onBlankClick,
  isCorrect,
  isSelected,
  blankIndex,
  isMobile,
  isSmallScreen,
}) => {
  const theme = useTheme();

  let borderColor = theme.palette.divider;
  let backgroundColor = theme.palette.background.default;

  if (isSelected) {
    borderColor = theme.palette.primary.main;
    backgroundColor = theme.palette.primary.light + "20";
  } else if (isCorrect === true) {
    borderColor = theme.palette.success.main;
    backgroundColor = theme.palette.success.light + "20";
  } else if (isCorrect === false) {
    borderColor = theme.palette.error.main;
    backgroundColor = theme.palette.error.light + "20";
  }

  const minWidth = isMobile ? 80 : isSmallScreen ? 70 : 100;
  const height = isMobile ? 44 : 36; // Larger touch targets on mobile
  const fontSize = isSmallScreen ? "0.875rem" : "1rem";

  return (
    <Box
      onClick={() => onBlankClick(blankIndex)}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth,
        height,
        border: `2px ${isSelected ? "solid" : "dashed"} ${borderColor}`,
        borderRadius: 2,
        backgroundColor,
        textAlign: "center",
        mx: 0.5,
        my: 0.25,
        verticalAlign: "middle",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        position: "relative",
        fontSize,
        fontWeight: currentAnswer ? 600 : 400,
        color: currentAnswer
          ? theme.palette.text.primary
          : theme.palette.text.secondary,
        "&:hover": {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + "30",
          transform: "scale(1.02)",
        },
        "&:focus": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        // Accessibility improvements
        '&[aria-selected="true"]': {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.light + "40",
        },
      }}
      role="button"
      tabIndex={0}
      aria-label={
        currentAnswer
          ? `Blank ${
              blankIndex + 1
            } filled with ${currentAnswer}. Click to remove.`
          : isSelected
          ? `Blank ${blankIndex + 1} selected. Click an option to fill it.`
          : `Blank ${blankIndex + 1}. Click to select, then choose an option.`
      }
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onBlankClick(blankIndex);
        }
      }}
    >
      {currentAnswer ? (
        <Box display="flex" alignItems="center" gap={0.5}>
          <span>{currentAnswer}</span>
          {currentAnswer && (
            <CloseIcon
              sx={{
                fontSize: "0.75rem",
                opacity: 0.7,
                ml: 0.5,
              }}
            />
          )}
        </Box>
      ) : (
        <Box display="flex" alignItems="center" gap={0.5} sx={{ opacity: 0.6 }}>
          {isSelected && <TouchAppIcon sx={{ fontSize: "0.875rem" }} />}
          <span
            style={{
              letterSpacing: "2px",
              minWidth: "60px",
              minHeight: "20px",
            }}
          >
            {isSelected ? "Click option" : "_____"}
          </span>
        </Box>
      )}
    </Box>
  );
};

const StudentFillInBlanksQuestionCard = ({
  question,
  userAnswers,
  blanksCorrectness,
  onBlankClick,
  selectedBlankIndex,
  isMobile,
  isSmallScreen,
}) => {
  const theme = useTheme();

  const renderQuestionWithBlanks = () => {
    // Handle square brackets [] as blanks
    const parts = question.text.split(/(\[[^\]]*\])/g);
    let blankIndex = -1;
    return parts.map((part, i) => {
      if (/^\[[^\]]*\]$/.test(part)) {
        blankIndex++;
        const currentBlankIndex = blankIndex;
        return (
          <Blank
            key={`blank-${currentBlankIndex}`}
            currentAnswer={userAnswers[currentBlankIndex] || ""}
            onBlankClick={onBlankClick}
            blankIndex={currentBlankIndex}
            isCorrect={
              blanksCorrectness ? blanksCorrectness[currentBlankIndex] : null
            }
            isSelected={selectedBlankIndex === currentBlankIndex}
            isMobile={isMobile}
            isSmallScreen={isSmallScreen}
          />
        );
      }
      return (
        <span key={`text-${i}`} dir="auto">
          {part}
        </span>
      );
    });
  };

  return (
    <Card
      elevation={3}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: "visible",
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent
        sx={{
          p: isMobile ? 2 : 3,
          "&:last-child": { pb: isMobile ? 2 : 3 },
        }}
      >
        <Typography
          variant={isMobile ? "body1" : "h6"}
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 500,
            lineHeight: isMobile ? 2 : 2.5,
            fontSize: isSmallScreen ? "1rem" : isMobile ? "1.1rem" : "1.25rem",
          }}
          dir="auto"
        >
          {renderQuestionWithBlanks()}
        </Typography>

        {/* Progress indicator for mobile */}
        {isMobile && (
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {userAnswers.map((answer, index) => (
              <Chip
                key={index}
                label={answer || `Blank ${index + 1}`}
                size="small"
                variant={answer ? "filled" : "outlined"}
                color={
                  blanksCorrectness?.[index] === true
                    ? "success"
                    : blanksCorrectness?.[index] === false
                    ? "error"
                    : "default"
                }
                sx={{ fontSize: "0.75rem" }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(StudentFillInBlanksQuestionCard);
