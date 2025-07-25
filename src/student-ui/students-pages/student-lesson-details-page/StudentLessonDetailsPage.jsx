import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
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
import "./StudentLessonDetailsPage.styles.js";

const StudentLessonDetailsPage = () => {
  const { lessonId } = useParams();
  const theme = useTheme();
  const { t } = useTranslation();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <main
        style={{
          background: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        {/* Header Skeleton */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: 2,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" width={220} height={40} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        {/* Media Skeleton */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={220}
            sx={{ borderRadius: theme.shape.borderRadius }}
          />
        </Box>
        {/* Progress Skeleton */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Skeleton variant="text" width={100} height={28} />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={10}
            sx={{ borderRadius: theme.shape.borderRadius, mb: 1 }}
          />
        </Box>
        {/* Objectives Skeleton */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Skeleton variant="text" width={120} height={28} />
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width="80%"
              height={24}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
        {/* Content Skeleton */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width="100%"
              height={24}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
        {/* Resources Skeleton */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Skeleton variant="text" width={120} height={28} />
          {[...Array(2)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="60%"
              height={24}
              sx={{ mb: 1, borderRadius: 1 }}
            />
          ))}
        </Box>
        {/* Actions Skeleton */}
        <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", gap: 2 }}>
          <Skeleton
            variant="rectangular"
            width={140}
            height={36}
            sx={{ borderRadius: theme.shape.borderRadius }}
          />
          <Skeleton
            variant="rectangular"
            width={140}
            height={36}
            sx={{ borderRadius: theme.shape.borderRadius }}
          />
        </Box>
        {/* Instructor Skeleton */}
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Skeleton variant="circular" width={64} height={64} />
          <Box>
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={180} height={20} />
            <Skeleton variant="text" width={100} height={20} />
          </Box>
        </Box>
        {/* Support Skeleton */}
        <Box sx={{ p: { xs: 2, md: 4 }, mt: 2 }}>
          <Skeleton variant="text" width={120} height={28} />
          <Skeleton variant="text" width={180} height={20} />
          <Skeleton variant="text" width={140} height={20} />
        </Box>
      </main>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        {/* Optionally add a retry button */}
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Typography color="text.secondary" variant="h6">
          {t("lessonDetails.empty")}
        </Typography>
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
    <main
      style={{
        background: theme.palette.background.default,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {media.length > 0 && <StudentLessonMediaPlayer media={media} />}
      {/* <Box sx={{ p: { xs: 2, md: 4 } }}></Box> */}
      <StudentLessonHeaderSection lesson={lesson} />

      <StudentLessonProgressBar progress={lesson.progress} />
      <StudentLessonObjectivesList objectives={lesson.objectives} />
      <StudentLessonContentSection content={lesson.content} />
      {lesson.vocabulary && lesson.vocabulary.length > 0 && (
        <StudentLessonVocabularySection vocabulary={lesson.vocabulary} />
      )}
      {lesson.grammarFocus && lesson.grammarFocus.length > 0 && (
        <StudentLessonGrammarSection grammar={lesson.grammarFocus} />
      )}
      {lesson.skills && lesson.skills.length > 0 && (
        <StudentLessonSkillsSection skills={lesson.skills} />
      )}
      <StudentLessonResourcesPanel resources={resources} />
      <StudentLessonActionsBar lesson={lesson} />
      {/* Instructor and Support sections removed as requested */}
    </main>
  );
};

export default StudentLessonDetailsPage;
