import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const StudentLessonMediaPlayer = ({ media }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  if (!media || media.length === 0) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
        <Typography color="text.secondary" variant="body2">
          {t("lessonDetails.noMedia")}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {media.map((item, idx) =>
        item.type === "video" ? (
          <video
            key={idx}
            src={item.url}
            controls
            controlsList="nodownload"
            style={{
              width: "100%",
              // maxHeight: 320,
              borderRadius: theme.shape.borderRadius,
              margin: 0,
              boxShadow: theme.shadows[1],
              background: theme.palette.background.paper,
              display: "block",
            }}
            aria-label={t("lessonDetails.videoPlayer")}
          />
        ) : item.type === "audio" ? (
          <audio
            key={idx}
            src={item.url}
            controls
            style={{
              marginTop: theme.spacing(2),
              width: "100%",
              borderRadius: theme.shape.borderRadius,
              marginBottom: theme.spacing(2),
              background: theme.palette.background.paper,
            }}
            aria-label={t("lessonDetails.audioPlayer")}
          />
        ) : null
      )}
    </Box>
  );
};
export default StudentLessonMediaPlayer;
