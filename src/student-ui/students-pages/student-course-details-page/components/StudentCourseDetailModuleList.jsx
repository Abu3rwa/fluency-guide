import React, { useState, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Typography,
  Box,
  Button,
  Fade,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MAX_HEIGHT = 220; // px, adjust for ~3-4 modules

const StudentCourseDetailModuleList = ({ modules = [], lessons = [] }) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  // Group lessons by moduleId
  const lessonsByModule = {};
  lessons.forEach((lesson) => {
    if (!lessonsByModule[lesson.moduleId])
      lessonsByModule[lesson.moduleId] = [];
    lessonsByModule[lesson.moduleId].push(lesson);
  });

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
        aria-label="Course modules and lessons list"
      >
        <Typography
          fontSize={theme.typography.h3.fontSize}
          align="center"
          variant="h3"
          fontWeight={600}
          gutterBottom
          sx={{ fontFamily: theme.typography.h6.fontFamily }}
        >
          {t("studentCourseDetails.moduleList.title")}
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
          {modules.map((mod) => (
            <Accordion
              key={mod.id || mod.title}
              sx={{
                mb: 1,
                bgcolor: theme.palette.background.main,
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[1],
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  fontSize={theme.typography.body2.fontSize}
                  sx={{
                    fontFamily: theme.typography.body2.fontFamily,
                    color: theme.palette.text.primary,
                  }}
                >
                  {mod.title.trim().charAt(0).toUpperCase() +
                    mod.title.trim().slice(1).toLowerCase()}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {mod.description}
                </Typography>
                <List dense>
                  {(lessonsByModule[mod.id] || []).map((lesson) => (
                    <ListItem
                      key={lesson.id || lesson.title}
                      sx={{ pl: 2 }}
                      divider
                    >
                      <Typography
                        component={Link}
                        to={`/student/lessons/${lesson.id}`}
                        sx={{
                          textDecoration: "none",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {lesson.title}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
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
          sx={{ mt: 1 }}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded
            ? t("studentCourseDetails.moduleList.showLess")
            : t("studentCourseDetails.moduleList.showAll")}
        </Button>
      </Box>
    </Fade>
  );
};

export default StudentCourseDetailModuleList;
