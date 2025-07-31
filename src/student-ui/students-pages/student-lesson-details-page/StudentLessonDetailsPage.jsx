import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Padding from "./components/Padding";
import Fade from "@mui/material/Fade";
import { getLessonById } from "../../../services/student-services/studentLessonService";
import StudentLessonHeaderSection from "./components/StudentLessonHeaderSection";
import StudentLessonMediaPlayer from "./components/StudentLessonMediaPlayer";
import StudentLessonContentSection from "./components/StudentLessonContentSection";
import StudentLessonObjectivesList from "./components/StudentLessonObjectivesList";
import StudentLessonResourcesPanel from "./components/StudentLessonResourcesPanel";
import StudentLessonProgressBar from "./components/StudentLessonProgressBar";
import StudentLessonActionsBar from "./components/StudentLessonActionsBar";
import StudentLessonVocabularySection from "./components/StudentLessonVocabularySection";
import StudentLessonGrammarSection from "./components/StudentLessonGrammarSection";
import StudentLessonSkillsSection from "./components/StudentLessonSkillsSection";
import StudentLessonTasksSection from "./components/StudentLessonTasksSection";

import { useStudyTimer } from "../../../hooks/useStudyTimer";
import { useStudyTime } from "../../../contexts/StudyTimeContext";
import "./StudentLessonDetailsPage.styles.js";

const StudentLessonDetailsPage = () => {
  const { lessonId } = useParams();
  const theme = useTheme();
  const { t } = useTranslation();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Study time tracking
  const { startSession, endSession, isSessionActive } = useStudyTime();
  const { timeout } = useStudyTimer(10 * 60 * 1000); // 10 minutes timeout for lesson pages

  useEffect(() => {
    setLoading(true);
    setError(null);
    getLessonById(lessonId)
      .then((data) => {
        if (!data) {
          setError(t("lessonDetails.notFound"));
        } else {
          setLesson(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(t("lessonDetails.error"));
        setLoading(false);
      });
  }, [lessonId, t]);

  // Start study session when lesson loads
  useEffect(() => {
    if (lesson && !isSessionActive) {
      startSession();
    }
  }, [lesson, isSessionActive, startSession]);

  // End session when component unmounts
  useEffect(() => {
    return () => {
      if (isSessionActive) {
        endSession();
      }
    };
  }, [isSessionActive, endSession]);

  if (loading) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          minHeight: "100vh",
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          {/* Header Skeleton */}
          <Paper
            sx={{
              mb: 3,
              p: { xs: 2, md: 3 },
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[0],
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="60%" height={32} />
              <Box sx={{ flex: 1 }} />
              <Skeleton variant="rectangular" width={140} height={40} />
            </Box>
          </Paper>

          {/* Media Skeleton */}
          <Paper
            sx={{
              mb: 3,
              p: { xs: 2, md: 3 },
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[0],
            }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height={{ xs: 200, sm: 300, md: 400 }}
              sx={{ borderRadius: theme.shape.borderRadius }}
            />
          </Paper>

          {/* Progress Skeleton */}
          <Paper
            sx={{
              mb: 3,
              p: { xs: 2, md: 3 },
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[0],
            }}
          >
            <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={12}
              sx={{ borderRadius: theme.shape.borderRadius }}
            />
          </Paper>

          {/* Content Grid Skeleton */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[0],
                  height: 400,
                }}
              >
                <Skeleton
                  variant="text"
                  width="40%"
                  height={32}
                  sx={{ mb: 2 }}
                />
                {[...Array(6)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="text"
                    width="100%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[0],
                  height: 400,
                }}
              >
                <Skeleton
                  variant="text"
                  width="60%"
                  height={28}
                  sx={{ mb: 2 }}
                />
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="text"
                    width="80%"
                    height={16}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[0],
            }}
          >
            <Typography color="error" variant="h6" gutterBottom>
              {error}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t("lessonDetails.errorHelp")}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box
        sx={{
          background: theme.palette.background.default,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: "center",
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[0],
            }}
          >
            <Typography color="text.secondary" variant="h6" gutterBottom>
              {t("lessonDetails.empty")}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t("lessonDetails.emptyHelp")}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Prepare media array for both video and audio
  const media = [];
  if (lesson.video?.url || lesson.videoUrl) {
    media.push({ type: "video", url: lesson.video?.url || lesson.videoUrl });
  }
  if (lesson.audio?.url || lesson.audioUrl) {
    media.push({ type: "audio", url: lesson.audio?.url || lesson.audioUrl });
  }

  // Combine resources and materials for the resources panel
  const resources = [
    ...(lesson.resources || []),
    ...((lesson.materials || []).map((mat) => ({
      ...mat,
      type: mat.type || "pdf",
    })) || []),
  ];

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

          {/* this is the video player of the lesson */}
          {media.length > 0 && (
            <Box sx={{ mb: 3, mx: { xs: 0, sm: 2, md: 3 } }}>
              <StudentLessonMediaPlayer media={media} />
            </Box>
          )}
          {/* this is the progress bar of the lesson */}
          <Padding>
            <Paper
              sx={{
                mb: 3,
                p: { xs: 2, md: 3 },
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[0],
              }}
            >
              <StudentLessonProgressBar progress={lesson.progress} />
            </Paper>
          </Padding>
          {/* this is the main content of the lesson */}
          <Padding>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                {/* Left Column - Main Content */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
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
                  >
                    <StudentLessonTasksSection lessonId={lessonId} />
                  </Paper>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
                  >
                    <StudentLessonContentSection content={lesson.content} />
                  </Paper>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
                  >
                    <StudentLessonActionsBar lesson={lesson} />
                  </Paper>
                </Box>
              </Grid>

              {/* this is the sidebar of the lesson */}
              <Grid item xs={12} lg={4}>
                {/* Right Column - Sidebar */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* this is the vocabulary of the lesson */}
                  {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                    <Paper
                      sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[0],
                      }}
                    >
                      <StudentLessonVocabularySection
                        vocabulary={lesson.vocabulary}
                      />
                    </Paper>
                  )}
                  {/* this is the grammar of the lesson */}
                  {lesson.grammarFocus && lesson.grammarFocus.length > 0 && (
                    <Paper
                      sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[0],
                      }}
                    >
                      <StudentLessonGrammarSection
                        grammar={lesson.grammarFocus}
                      />
                    </Paper>
                  )}
                  {/* this is the skills of the lesson */}
                  {lesson.skills && lesson.skills.length > 0 && (
                    <Paper
                      sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: theme.shadows[0],
                      }}
                    >
                      <StudentLessonSkillsSection skills={lesson.skills} />
                    </Paper>
                  )}
                  {/* this is the resources of the lesson */}
                  <Paper
                    sx={{
                      p: { xs: 2, md: 3 },
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[0],
                    }}
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
};

export default StudentLessonDetailsPage;
