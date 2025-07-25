import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Skeleton,
  Fade,
} from "@mui/material";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const MAX_HEIGHT = 96; // px, adjust for ~3 lines

const StudentCourseDetailOverviewSection = ({ course, loading }) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={100}
        sx={{ borderRadius: theme.shape.borderRadius, mb: 3 }}
      />
    );
  }
  if (!course) return null;

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          mb: 3,
          bgcolor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          p: { xs: 2, md: 3 },
          position: "relative",
        }}
        aria-label="Course overview section"
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t("studentCourseDetails.overview.title")}
        </Typography>
        <Box
          ref={contentRef}
          sx={{
            maxHeight: expanded ? "none" : `${MAX_HEIGHT}px`,
            overflow: "hidden",
            position: "relative",
            transition: "max-height 0.3s",
          }}
        >
          <Typography
            variant="body1"
            gutterBottom
            sx={{
              fontFamily: theme.typography.body1.fontFamily,
              fontSize: theme.typography.body1.fontSize,
            }}
          >
            {course.shortDescription}
          </Typography>
          {Array.isArray(course.objectives) && course.objectives.length > 0 && (
            <>
              <Typography
                variant="h3"
                gutterBottom
                color="primary"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: theme.typography.h3.fontSize,
                  fontFamily: "Inter",
                }}
              >
                {t("studentCourseDetails.overview.objectives")}
              </Typography>
              <List dense>
                {course.objectives.map((obj, idx) => (
                  <ListItem key={idx} sx={{ pl: 0 }}>
                    {obj}
                  </ListItem>
                ))}
              </List>
            </>
          )}
          {Array.isArray(course.whatYouWillLearn) &&
            course.whatYouWillLearn.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  {t("studentCourseDetails.overview.whatYouWillLearn")}
                </Typography>
                <List dense>
                  {course.whatYouWillLearn.map((item, idx) => (
                    <ListItem key={idx} sx={{ pl: 0 }}>
                      {item}
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          {!expanded && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 40,
                background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, ${theme.palette.background.paper} 100%)`,
                pointerEvents: "none",
              }}
            />
          )}
        </Box>
        <Button
          variant="text"
          color="primary"
          sx={{
            mt: 1,
            fontFamily: theme.typography.body2.fontFamily,
            fontSize: theme.typography.body2.fontSize,
          }}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded
            ? t("studentCourseDetails.overview.viewLess")
            : t("studentCourseDetails.overview.viewMore")}
        </Button>
      </Box>
    </Fade>
  );
};

export default StudentCourseDetailOverviewSection;
