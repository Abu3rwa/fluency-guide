import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  useTheme,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LockIcon from "@mui/icons-material/Lock";
import { useTranslation } from "react-i18next";
import { studentCoursePreviewService } from "../../services/student-services/studentCoursePreviewService";

const CoursePreviewCard = ({
  course,
  accessLevel,
  onEnroll,
  onLessonClick,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);

  const previewStats = studentCoursePreviewService.getPreviewStats(course);
  const isEnrolled = accessLevel === "enrolled";
  const canPreview = accessLevel === "preview";

  const handleLessonClick = (lesson, index) => {
    if (
      studentCoursePreviewService.isLessonPreviewable(
        index,
        previewStats.previewLessons
      )
    ) {
      onLessonClick(lesson, index);
    } else {
      onEnroll();
    }
  };

  return (
    <Card sx={{ mb: 2, position: "relative" }}>
      <CardMedia
        component="img"
        height="200"
        image={course.thumbnail || course.image}
        alt={course.title}
      />

      {/* Preview Badge */}
      {canPreview && (
        <Chip
          label="PREVIEW"
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontWeight: 600,
          }}
        />
      )}

      <CardContent>
        <Typography variant="h6" gutterBottom>
          {course.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {canPreview
              ? `${previewStats.previewLessons} of ${previewStats.totalLessons} lessons available`
              : "Course Progress"}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={canPreview ? previewStats.previewPercentage : 0}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Preview Lessons */}
        {course.lessons &&
          course.lessons
            .slice(0, previewStats.previewLessons)
            .map((lesson, index) => (
              <Box
                key={lesson.id}
                sx={{
                  p: 2,
                  mb: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                  },
                }}
                onClick={() => handleLessonClick(lesson, index)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <PlayArrowIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {lesson.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lesson.duration || "5"} min • Preview
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}

        {/* Locked Content Preview */}
        {canPreview && previewStats.lockedLessons > 0 && (
          <Box sx={{ mt: 3, p: 3, bgcolor: "grey.100", borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              🔒 Remaining {previewStats.lockedLessons} lessons
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enroll to unlock all {previewStats.totalLessons} lessons and get
              full access
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={onEnroll}
            >
              Enroll Now - ${course.price || "Free"}
            </Button>
          </Box>
        )}

        {/* Action Button */}
        {!canPreview && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onEnroll}
            sx={{ mt: 2 }}
          >
            {isEnrolled ? "Continue Learning" : "Enroll Now"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursePreviewCard;
