import React from "react";
import { Alert, Button, Box, Typography } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useTranslation } from "react-i18next";

const InstructionsAlert = ({ 
  show, 
  onDismiss, 
  isMobile 
}) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <Alert
      severity="info"
      sx={{
        mb: 2,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={onDismiss}
        >
          {t("tasks.gotIt")}
        </Button>
      }
    >
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
        {isMobile ? (
          <>
            <TouchAppIcon fontSize="small" />
            <Typography variant="body2">
              {t("tasks.tapBlankSpace")}
            </Typography>
          </>
        ) : (
          <>
            <KeyboardIcon fontSize="small" />
            <Typography variant="body2">
              {t("tasks.clickBlankSpace")}
            </Typography>
          </>
        )}
      </Box>
    </Alert>
  );
};

export default InstructionsAlert; 