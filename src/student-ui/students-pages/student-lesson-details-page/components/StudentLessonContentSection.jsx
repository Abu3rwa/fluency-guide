import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import ArticleIcon from "@mui/icons-material/Article";

const StudentLessonContentSection = ({ content }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!content) {
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
        <ArticleIcon
          sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }}
        />
        <Typography color="text.secondary" variant="body1">
          {t("lessonDetails.noContent")}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography
        variant="h5"
        component="h2"
        sx={{
          fontFamily: theme.typography.h5.fontFamily,
          fontWeight: theme.typography.h5.fontWeight,
          color: theme.palette.text.primary,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ArticleIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />
        {t("lessonDetails.contentSection")}
      </Typography>
      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[0],
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="body1"
          component="div"
          sx={{
            fontFamily: theme.typography.body1.fontFamily,
            fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" },
            lineHeight: 1.6,
            color: theme.palette.text.primary,
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              fontFamily: theme.typography.h6.fontFamily,
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2,
              mt: 3,
            },
            "& h1": {
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
              mb: 3,
            },
            "& h2": {
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              mb: 2,
            },
            "& h3": {
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              mb: 2,
            },
            "& p": {
              mb: 2,
              lineHeight: 1.7,
            },
            "& ul, & ol": {
              mb: 2,
              pl: 3,
            },
            "& li": {
              mb: 1,
              lineHeight: 1.6,
            },
            "& blockquote": {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              pl: 2,
              ml: 0,
              mr: 0,
              py: 1,
              mb: 2,
              bgcolor: theme.palette.action.hover,
              borderRadius: 1,
            },
            "& code": {
              bgcolor: theme.palette.grey[100],
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.9em",
            },
            "& pre": {
              bgcolor: theme.palette.grey[100],
              p: 2,
              borderRadius: 1,
              overflow: "auto",
              mb: 2,
            },
            "& a": {
              color: theme.palette.primary.main,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            "& strong, & b": {
              fontWeight: 600,
              color: theme.palette.text.primary,
            },
            "& em, & i": {
              fontStyle: "italic",
            },
          }}
          dangerouslySetInnerHTML={{ __html: content }}
          aria-label={t("lessonDetails.contentSection")}
        />
        <style>{`
          img {
          max-width: 100%;
          height: auto;
            border-radius: ${theme.shape.borderRadius}px;
            margin: 1rem 0;
            box-shadow: ${theme.shadows[1]};
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            border-radius: ${theme.shape.borderRadius}px;
            overflow: hidden;
            box-shadow: ${theme.shadows[1]};
          }
          th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid ${theme.palette.divider};
          }
          th {
            background-color: ${theme.palette.grey[100]};
            font-weight: 600;
          }
          tr:hover {
            background-color: ${theme.palette.action.hover};
        }
      `}</style>
      </Paper>
    </Box>
  );
};

export default StudentLessonContentSection;
