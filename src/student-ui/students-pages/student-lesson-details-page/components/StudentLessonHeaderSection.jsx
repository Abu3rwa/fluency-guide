import React from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

const StudentLessonHeaderSection = ({ lesson }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: theme.palette.background.paper,
        boxShadow: 1,
        px: { xs: 2, md: 4 },
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box display="flex" alignItems="center">
        <IconButton
          aria-label={t("common.back")}
          onClick={() => navigate(-1)}
          edge="start"
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: theme.typography.h5.fontFamily,
            fontWeight: theme.typography.h5.fontWeight,
            color: theme.palette.text.primary,
            maxWidth: { xs: "60vw", md: "40vw" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lesson?.title || t("lessonDetails.notFound")}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CheckCircleIcon />}
        sx={{ borderRadius: theme.shape.borderRadius, minWidth: 120 }}
        aria-label={t("lessonDetails.markComplete")}
        // TODO: Add onClick handler for marking complete
      >
        {t("lessonDetails.markComplete")}
      </Button>
    </Box>
  );
};

export default StudentLessonHeaderSection;
