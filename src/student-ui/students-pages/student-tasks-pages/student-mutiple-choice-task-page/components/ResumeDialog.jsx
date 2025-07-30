import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const ResumeDialog = ({ open, onClose, onResume, onStartOver }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("tasks.resumeQuizTitle") || "Resume Quiz?"}</DialogTitle>
      <DialogContent>
        <Typography>
          {t("tasks.resumeQuizContent") ||
            "You have a previously started quiz. Would you like to continue where you left off or start over?"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onStartOver} color="secondary">
          {t("tasks.startOver") || "Start Over"}
        </Button>
        <Button onClick={onResume} variant="contained" color="primary">
          {t("tasks.resume") || "Resume"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumeDialog;
