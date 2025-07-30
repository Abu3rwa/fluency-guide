import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";

const StudentLessonMediaPlayer = ({ media }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!media || media.length === 0) {
    return (
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          textAlign: "center",
          borderRadius: theme.shape.borderRadius,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <VideoLibraryIcon
          sx={{
            fontSize: 48,
            color: theme.palette.text.secondary,
            mb: 2,
          }}
        />
        <Typography color="text.secondary" variant="body1">
          {t("lessonDetails.noMedia")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {media.map((item, idx) => (
        <Box key={idx} sx={{ mb: idx < media.length - 1 ? 3 : 0 }}>
          {item.type === "video" ? (
            <Box
              sx={{
                position: "relative",
                borderRadius: { xs: 0, sm: theme.shape.borderRadius },
                overflow: "hidden",
                boxShadow: theme.shadows[0],
                bgcolor: theme.palette.background.paper,
                border: {
                  xs: "none",
                  sm: `1px solid ${theme.palette.divider}`,
                },
              }}
            >
              <video
                src={item.url}
                controls
                controlsList="nodownload"
                style={{
                  width: "100%",
                  maxHeight: "60vh",
                  display: "block",
                  borderRadius: 0,
                }}
                aria-label={t("lessonDetails.videoPlayer")}
              />
              {/* <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {t("lessonDetails.video")}
                </Typography>
              </Box> */}
            </Box>
          ) : item.type === "audio" ? (
            <Paper
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[0],
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <AudiotrackIcon
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 24,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                  }}
                >
                  {t("lessonDetails.audio")}
                </Typography>
              </Box>
              <audio
                src={item.url}
                controls
                style={{
                  width: "100%",
                  borderRadius: theme.shape.borderRadius,
                }}
                aria-label={t("lessonDetails.audioPlayer")}
              />
            </Paper>
          ) : null}
        </Box>
      ))}
    </Box>
  );
};

export default StudentLessonMediaPlayer;
