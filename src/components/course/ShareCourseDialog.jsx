import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const ShareCourseDialog = ({ open, onClose, course }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleShare = async () => {
    try {
      // Implement sharing logic here
      setSnackbarMessage(t("courses.share.success"));
      setShowSnackbar(true);
      onClose();
    } catch (error) {
      setSnackbarMessage(t("courses.share.error"));
      setShowSnackbar(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbarMessage(t("courses.share.linkCopied"));
    setShowSnackbar(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("courses.share.title")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {t("courses.share.description")}
            </Typography>
            <TextField
              fullWidth
              label={t("courses.share.emailLabel")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {window.location.href}
              </Typography>
              <IconButton onClick={handleCopyLink} size="small">
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={handleShare} variant="contained">
            {t("courses.share.button")}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setShowSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareCourseDialog;
