import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Link,
  Stack,
  Skeleton,
  Fade,
  Paper,
} from "@mui/material";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const StudentCourseDetailInstructorInfo = ({
  instructor,
  support,
  loading,
}) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={100}
        sx={{ borderRadius: theme.shape.borderRadius, mb: 3 }}
      />
    );
  }
  if (!instructor) return null;
  const name =
    typeof instructor === "string"
      ? instructor
      : instructor.name || instructor.displayName || "";
  const bio = instructor.bio || instructor.instructorBio || "";
  const photo = instructor.photoURL || instructor.profileImage || "";

  return (
    <Fade in timeout={600}>
      <Paper
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: theme.shape.borderRadius,
          bgcolor: theme.palette.background.paper,
          width: { xs: "100%", md: "300px" },
          maxWidth: { xs: "100%", md: "300px" },
          margin: { xs: "0 auto", md: "0" },
        }}
        aria-label="Instructor info section"
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t("studentCourseDetails.instructorInfo.title")}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          {photo && (
            <Avatar src={photo} alt={name} sx={{ width: 56, height: 56 }} />
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={500}>
              {name}
            </Typography>
            {bio && (
              <Typography variant="body2" color="text.secondary">
                {bio}
              </Typography>
            )}
          </Box>
        </Stack>
        {support && (
          <Box mt={2}>
            <Typography variant="subtitle2" fontWeight={500} gutterBottom>
              {t("studentCourseDetails.instructorInfo.support")}
            </Typography>
            {support.email && (
              <Typography variant="body2">
                {t("studentCourseDetails.instructorInfo.email")}:{" "}
                <Link href={`mailto:${support.email}`}>{support.email}</Link>
              </Typography>
            )}
            {support.hours && (
              <Typography variant="body2">
                {t("studentCourseDetails.instructorInfo.hours")}:{" "}
                {support.hours}
              </Typography>
            )}
            {support.responseTime && (
              <Typography variant="body2">
                {t("studentCourseDetails.instructorInfo.responseTime")}:{" "}
                {support.responseTime}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default StudentCourseDetailInstructorInfo;
