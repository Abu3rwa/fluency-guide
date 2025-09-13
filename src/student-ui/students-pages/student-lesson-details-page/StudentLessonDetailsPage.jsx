import React, { useEffect, useState, memo } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { getLessonById } from "../../../services/student-services/studentLessonService";
import { useStudyTimer } from "../../../hooks/useStudyTimer";
import { useStudyTime } from "../../../contexts/StudyTimeContext";
import { studentCoursePreviewService } from "../../../services/student-services/studentCoursePreviewService";
import { useAuth } from "../../../contexts/AuthContext";
import LessonContent from "./components/LessonContent";
import "./StudentLessonDetailsPage.styles.js";

const StudentLessonDetailsPage = memo(() => {
  const { lessonId } = useParams();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const { t } = useTranslation();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Study time tracking
  const { startSession, endSession, isSessionActive } = useStudyTime();
  const { timeout } = useStudyTimer(10 * 60 * 1000); // 10 minutes timeout for lesson pages

  // Lesson data fetching effect
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getLessonById(lessonId);

        if (!data) {
          setError(t("lessonDetails.notFound"));
          setLoading(false);
          return;
        }

        // Check if lesson is previewable using the correct indices
        const isPreviewable = studentCoursePreviewService.isLessonPreviewable(
          data.lessonIndex || 0,
          data.moduleIndex || 0,
          data.lessonIndexInModule || 0
        );

        if (!isPreviewable && !currentUser) {
          setError(t("lessonDetails.enrollmentRequired"));
          setLoading(false);
          return;
        }

        setLesson(data);
        setLoading(false);
      } catch (err) {
        setError(t("lessonDetails.error"));
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, t, currentUser]);

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
              sx={{ 
                borderRadius: theme.shape.borderRadius,
                height: { xs: 200, sm: 300, md: 400 }
              }}
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

  return <LessonContent lesson={lesson} lessonId={lessonId} />;
});

StudentLessonDetailsPage.displayName = "StudentLessonDetailsPage";

export default StudentLessonDetailsPage;
