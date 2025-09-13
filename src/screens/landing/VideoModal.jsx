import React, { useState } from "react";
import {
  Modal,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";

const VIDEO_ID = "dQw4w9WgXcQ"; // Replace with your actual video ID

const VideoModal = ({ open, onClose, t }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(false);
    // Track video view
    if (window.gtag) {
      window.gtag("event", "video_view", {
        event_category: "Engagement",
        event_label: "Demo Video",
      });
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(false);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="demo-video-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          outline: "none",
          width: { xs: "90vw", sm: 640 },
          maxWidth: "100vw",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            id="demo-video-modal"
            sx={{
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {t("landing.hero.demoVideo.title")}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label={t("common.close")}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%", // 16:9 aspect ratio
            bgcolor: "background.default",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {error ? (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
              }}
            >
              <Alert
                severity="error"
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={handleRetry}
                  >
                    <ReplayIcon />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {t("landing.hero.demoVideo.error")}
              </Alert>
              <Typography variant="body2" color="text.secondary" align="center">
                {t("landing.hero.demoVideo.errorHelp")}
              </Typography>
            </Box>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&cc_load_policy=1&cc_lang_pref=auto&rel=0`}
              title={t("landing.hero.demoVideo.title")}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: 8,
              }}
            />
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 2,
            textAlign: "center",
          }}
        >
          {t("landing.hero.demoVideo.caption")}
        </Typography>
      </Box>
    </Modal>
  );
};

export default VideoModal;
