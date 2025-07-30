import React from "react";
import { Box, Paper, Typography, Button, Chip, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Option = ({
  name,
  onClick,
  isMobile,
  isSmallScreen,
  isHighlighted,
  index,
}) => {
  const theme = useTheme();

  const buttonHeight = isMobile ? 48 : 40; // Larger touch targets on mobile
  const fontSize = isSmallScreen ? "0.875rem" : "1rem";

  return (
    <Button
      variant="outlined"
      onClick={() => onClick(name)}
      sx={{
        minHeight: buttonHeight,
        px: isMobile ? 2 : 1.5,
        py: 1,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: 3,
        background: theme.palette.background.paper,
        color: theme.palette.primary.main,
        fontSize,
        fontWeight: 600,
        textTransform: "none",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          transform: "scale(1.05)",
          boxShadow: theme.shadows[4],
        },
        "&:focus": {
          outline: `2px solid ${theme.palette.secondary.main}`,
          outlineOffset: 2,
        },
        "&:active": {
          transform: "scale(0.98)",
        },
        // Highlight effect when blank is selected
        ...(isHighlighted && {
          backgroundColor: theme.palette.primary.light + "40",
          borderColor: theme.palette.secondary.main,
          animation: "pulse 1.5s infinite",
        }),
      }}
      startIcon={isMobile ? <TouchAppIcon fontSize="small" /> : null}
      role="button"
      aria-label={`Option: ${name}. Click to place in selected blank.`}
      tabIndex={0}
    >
      {name}
    </Button>
  );
};

const StudentFillInBlanksOptionList = ({
  availableOptions = [],
  onOptionClick,
  isMobile,
  isSmallScreen,
  selectedBlankIndex,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const isHighlighted = selectedBlankIndex !== null;

  return (
    <Paper
      elevation={2}
      sx={{
        p: isMobile ? 2 : 3,
        mt: 2,
        background: theme.palette.background.default,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography
          variant={isMobile ? "body1" : "subtitle1"}
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          {t("tasks.availableOptions")}
        </Typography>
        {isHighlighted && (
          <Chip
            label={t("tasks.selectAnOption")}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontSize: "0.75rem",
              animation: "pulse 1.5s infinite",
            }}
          />
        )}
      </Box>

      {availableOptions.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          py={3}
          sx={{ opacity: 0.7 }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 48,
              color: theme.palette.success.main,
              mb: 1,
            }}
          />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t("tasks.allOptionsUsed")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            {t("tasks.clickFilledBlanks")}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={isMobile ? 1.5 : 1}>
          {availableOptions.map((option, idx) => (
            <Grid item xs={isSmallScreen ? 6 : isMobile ? 4 : 3} key={idx}>
              <Option
                name={option}
                onClick={onOptionClick}
                isMobile={isMobile}
                isSmallScreen={isSmallScreen}
                isHighlighted={isHighlighted}
                index={idx}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Help text */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: 2,
          display: "block",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        {selectedBlankIndex !== null
          ? t("tasks.clickOptionToFill")
          : isMobile
          ? t("tasks.tapBlankFirst")
          : t("tasks.clickBlankFirst")}
      </Typography>

      {/* Add CSS animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </Paper>
  );
};

export default React.memo(StudentFillInBlanksOptionList);
