import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";

const AchievementDetailsModal = ({ open, achievement, onClose }) => {
  const closeBtnRef = useRef();

  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!achievement) return null;
  const unlocked = achievement.isUnlocked !== false;
  const unlockDate = achievement.unlockDate || achievement.earnedAt;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="achievement-details-title"
      aria-describedby="achievement-details-desc"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle
        id="achievement-details-title"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        {unlocked ? (
          <EmojiEventsIcon color="warning" />
        ) : (
          <LockIcon color="disabled" />
        )}
        {achievement.title || "Achievement"}
        <Box flexGrow={1} />
        <Tooltip title="Close">
          <IconButton
            onClick={onClose}
            ref={closeBtnRef}
            aria-label="Close details"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent dividers>
        <Typography
          id="achievement-details-desc"
          variant="body1"
          sx={{ mb: 2 }}
        >
          {achievement.description || "No description available."}
        </Typography>
        <Typography
          variant="body2"
          color={unlocked ? "success.main" : "text.secondary"}
          sx={{ mb: 1 }}
        >
          {unlocked ? "Unlocked" : "Locked"}
        </Typography>
        {unlocked && unlockDate && (
          <Typography variant="body2" color="text.secondary">
            Unlocked on:{" "}
            {typeof unlockDate === "string"
              ? new Date(unlockDate).toLocaleString()
              : unlockDate?.toLocaleString?.()}
          </Typography>
        )}
        {achievement.currentProgress !== undefined && !unlocked && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Progress: {achievement.currentProgress}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AchievementDetailsModal;
