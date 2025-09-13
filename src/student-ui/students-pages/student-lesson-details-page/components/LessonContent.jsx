import React, { useMemo } from "react";
import { Box, Container, Grid, Paper, Fade } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StudentLessonHeaderSection from "./StudentLessonHeaderSection";
import StudentLessonMediaPlayer from "./StudentLessonMediaPlayer";
import StudentLessonContentSection from "./StudentLessonContentSection";
import StudentLessonObjectivesList from "./StudentLessonObjectivesList";
import StudentLessonResourcesPanel from "./StudentLessonResourcesPanel";
import StudentLessonProgressBar from "./StudentLessonProgressBar";
import StudentLessonActionsBar from "./StudentLessonActionsBar";
import StudentLessonVocabularySection from "./StudentLessonVocabularySection";
import StudentLessonGrammarSection from "./StudentLessonGrammarSection";
import StudentLessonSkillsSection from "./StudentLessonSkillsSection";
import StudentLessonTasksSection from "./StudentLessonTasksSection";
import Padding from "./Padding";

const LessonContent = React.memo(({ lesson, lessonId }) => {
  const theme = useTheme();

  // Memoize media array calculation
  const media = useMemo(() => {
    if (!lesson) return [];

    const mediaArray = [];
    const videoUrl = lesson.video?.url || lesson.videoUrl;
    const audioUrl = lesson.audio?.url || lesson.audioUrl;

    if (videoUrl) {
      mediaArray.push({ type: "video", url: videoUrl });
    }
    if (audioUrl) {
      mediaArray.push({ type: "audio", url: audioUrl });
    }
    return mediaArray;
  }, [lesson]);

  // Memoize resources calculation
  const resources = useMemo(() => {
    if (!lesson) return [];

    const resourcesList = lesson.resources || [];
    const materialsList = (lesson.materials || []).map((mat) => ({
      ...mat,
      type: mat.type || "pdf",
    }));

    return [...resourcesList, ...materialsList];
  }, [lesson]);

  // Memoize lesson sections for sidebar
  const lessonSections = useMemo(() => {
    if (!lesson) return [];

    const sections = [];

    if (lesson.vocabulary?.length > 0) {
      sections.push({
        key: "vocabulary",
        component: (
          <StudentLessonVocabularySection vocabulary={lesson.vocabulary} />
        ),
      });
    }

    if (lesson.grammarFocus?.length > 0) {
      sections.push({
        key: "grammar",
        component: (
          <StudentLessonGrammarSection grammar={lesson.grammarFocus} />
        ),
      });
    }

    if (lesson.skills?.length > 0) {
      sections.push({
        key: "skills",
        component: <StudentLessonSkillsSection skills={lesson.skills} />,
      });
    }

    return sections;
  }, [lesson]);

  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          background: theme.palette.background.default,
          minHeight: "100vh",
          pt: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="lg" sx={{ py: 0, px: { xs: 0, sm: 2, md: 3 } }}>
          <StudentLessonHeaderSection lesson={lesson} />

          {media.length > 0 && (
            <Box sx={{ mb: 3, mx: { xs: 0, sm: 2, md: 3 } }}>
              <StudentLessonMediaPlayer media={media} />
            </Box>
          )}
          <Padding>
            <Paper
              sx={{
                mb: 3,
                p: { xs: 2, md: 3 },
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[0],
              }}
              role="region"
              aria-label="Lesson Progress"
            >
              <StudentLessonProgressBar progress={lesson.progress} />
            </Paper>
          </Padding>
          <Padding>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
                    role="region"
                    aria-label="Learning Objectives"
                  >
                    <StudentLessonObjectivesList
                      objectives={lesson.objectives}
                    />
                  </Paper>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
                    role="region"
                    aria-label="Lesson Tasks"
                  >
                    <StudentLessonTasksSection lessonId={lessonId} />
                  </Paper>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
                    role="region"
                    aria-label="Lesson Content"
                  >
                    <StudentLessonContentSection content={lesson.content} />
                  </Paper>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
                    role="region"
                    aria-label="Lesson Actions"
                  >
                    <StudentLessonActionsBar lesson={lesson} />
                  </Paper>
                </Box>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {lessonSections.map((section) => (
                    <Paper
                      key={section.key}
                      sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[0],
                      }}
                      role="region"
                      aria-label={`Lesson ${
                        section.key.charAt(0).toUpperCase() +
                        section.key.slice(1)
                      }`}
                    >
                      {section.component}
                    </Paper>
                  ))}
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
                    role="region"
                    aria-label="Lesson Resources"
                  >
                    <StudentLessonResourcesPanel resources={resources} />
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Padding>
        </Container>
      </Box>
    </Fade>
  );
});

LessonContent.displayName = "LessonContent";

export default LessonContent;
