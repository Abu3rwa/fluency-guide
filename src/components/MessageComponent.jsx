import React, { useState } from "react";
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { Chat as ChatIcon, Send as SendIcon } from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";

const MessageComponent = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUser = useContext(UserContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const messageData = {
        message: message.trim(),
        timestamp: serverTimestamp(),
        status: "unread",
        ...(currentUser
          ? {
              userId: currentUser.uid,
              name: currentUser.displayName || "Anonymous",
              email: currentUser.email,
            }
          : {
              name: "Anonymous",
              email: "Not provided",
            }),
      };

      await addDoc(collection(db, "messages"), messageData);

      setMessage("");
      handleClose();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleOpen}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <ChatIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <ChatIcon /> Need help? Chat with us!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            👋 Have a question or need assistance? Drop us a message and we'll
            get back to you shortly!
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            🔒 Your message is private and secure.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            endIcon={<SendIcon />}
            disabled={loading || !message.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MessageComponent;
