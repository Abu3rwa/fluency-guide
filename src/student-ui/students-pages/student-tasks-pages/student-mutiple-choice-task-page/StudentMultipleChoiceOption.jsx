import React from "react";
import { FormControlLabel, Radio, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const StudentMultipleChoiceOption = ({
  value,
  label,
  selected,
  onChange,
  disabled,
  isMobile,
  isSmallScreen,
  optionIndex,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleClick = () => {
    if (!disabled) {
      onChange({ target: { value } });
    }
  };

  return (
    <Box
      sx={{
        mb: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: disabled ? "none" : "translateY(-1px)",
        },
      }}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${t("tasks.selectOption")} ${optionIndex + 1}: ${label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <FormControlLabel
        value={value}
        control={
          <Radio
            checked={selected}
            onChange={onChange}
            disabled={disabled}
            sx={{
              "&.Mui-checked": {
                color: theme.palette.primary.main,
              },
              "&.Mui-disabled": {
                color: theme.palette.action.disabled,
              },
            }}
          />
        }
        label={
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: selected ? 600 : 400,
              color: selected
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              textAlign: "left",
              wordBreak: "break-word",
            }}
            dir="auto"
          >
            {label}
          </Typography>
        }
        sx={{
          background: selected
            ? theme.palette.primary.main + "15"
            : theme.palette.background.paper,
          borderRadius: 2,
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          width: "100%",
          border: `2px solid ${
            selected ? theme.palette.primary.main : theme.palette.divider
          }`,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            background: disabled
              ? theme.palette.background.paper
              : selected
              ? theme.palette.primary.main + "25"
              : theme.palette.action.hover,
            borderColor: disabled
              ? theme.palette.divider
              : theme.palette.primary.main,
          },
          "&.Mui-disabled": {
            opacity: 0.6,
            background: theme.palette.action.disabledBackground,
          },
        }}
      />
    </Box>
  );
};

export default StudentMultipleChoiceOption;
