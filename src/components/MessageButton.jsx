import React, { useState, useContext } from "react";
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../contexts/UserContext";
import { motion, AnimatePresence } from "framer-motion";

const MessageButton = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setMessage("");
    if (!user) {
      setName("");
      setEmail("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const messageData = {
        message: message.trim(),
        timestamp: serverTimestamp(),
        status: "unread",
      };

      // Add user data if authenticated
      if (user) {
        messageData.userId = user.uid;
        messageData.name = user.displayName || "Anonymous User";
        messageData.email = user.email;
      } else {
        // Add name and email if provided
        if (name.trim()) messageData.name = name.trim();
        if (email.trim()) messageData.email = email.trim();
      }

      await addDoc(collection(db, "messages"), messageData);

      // Removed notification logic
      handleClose();
    } catch (error) {
      console.error("Error sending message:", error);
      // Removed notification logic
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{
          position: "fixed",
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          variant="extended"
          onClick={handleOpen}
          sx={{
            boxShadow: 4,
            "&:hover": {
              boxShadow: 6,
            },
          }}
        >
          <ChatIcon sx={{ mr: 1 }} />
          Need help? Chat with us!
        </Fab>
      </motion.div>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              👋 Have a question?
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Drop us a message and we&apos;ll get back to you shortly!
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pb: 2 }}>
            {!user && (
              <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Your Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                typography: "caption",
              }}
            >
              <SecurityIcon fontSize="small" sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                Your message is private and secure.
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleClose}
              sx={{ color: "text.secondary" }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={!message.trim() || loading}
              sx={{
                px: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                },
              }}
            >
              Send Message
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Removed Snackbar and Alert */}
    </>
  );
};

export default MessageButton;
