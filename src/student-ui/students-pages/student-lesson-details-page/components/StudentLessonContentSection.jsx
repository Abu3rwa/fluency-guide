import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const StudentLessonContentSection = ({ content }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!content) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
        <Typography color="text.secondary" variant="body2">
          {t("lessonDetails.noContent")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      <Typography
        variant="body1"
        component="section"
        sx={{
          fontFamily: theme.typography.body1.fontFamily,
          color: theme.palette.text.primary,
          fontSize: { xs: "1rem", md: "1.1rem" },
        }}
        dangerouslySetInnerHTML={{ __html: content }}
        aria-label={t("lessonDetails.contentSection")}
      />
      {/* Responsive images in content */}
      <style>{`
        .MuiTypography-root img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </Box>
  );
};
export default StudentLessonContentSection;
