import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
} from "@mui/material";
import { useStudyTime } from "../contexts/StudyTimeContext";

const motivationalMessages = [
  "Great focus! Keep up the momentum.",
  "You're doing wonderfully. Every minute counts!",
  "Amazing effort! Your hard work is paying off.",
  "Keep going! You're building a great study habit.",
  "Fantastic job! Consistency is the key to success.",
];

const StudyMotivationDialog = () => {
  const { activeSessionDuration } = useStudyTime();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [lastShown, setLastShown] = useState(0);

  useEffect(() => {
    const sessionMinutes = Math.floor(activeSessionDuration / 60);

    const shouldShow = () => {
      if (sessionMinutes >= 5 && lastShown < 5) return true;
      if (sessionMinutes >= 10 && lastShown < 10) return true;
      if (
        sessionMinutes >= 25 &&
        sessionMinutes % 15 === 10 &&
        lastShown < sessionMinutes
      )
        return true;
      return false;
    };

    if (shouldShow()) {
      const randomMessage =
        motivationalMessages[
          Math.floor(Math.random() * motivationalMessages.length)
        ];
      setMessage(
        `${randomMessage} You've been studying for ${sessionMinutes} minutes!`
      );
      setOpen(true);
      setLastShown(sessionMinutes);
    }
  }, [activeSessionDuration, lastShown]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Keep Up the Great Work!</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <Button onClick={handleClose} variant="contained" fullWidth>
          Continue Studying
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default StudyMotivationDialog;
