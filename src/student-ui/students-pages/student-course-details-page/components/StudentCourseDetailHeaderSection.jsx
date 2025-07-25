import React from "react";
import {
  Box,
  Grid,
  Typography,
  Avatar,
  Button,
  Stack,
  useMediaQuery,
} from "@mui/material";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const StudentCourseDetailHeaderSection = ({ course, user, loading }) => {
  const { theme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  if (loading || !course) return null;

  return (
    <Box
      sx={{
        mb: 4,
        bgcolor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
        p: { xs: 0, md: 4 },
        boxShadow: theme.shadows[1],
        width: "100%",
        maxWidth: "100%",
        mx: "auto",
        overflowX: "hidden",
      }}
    >
      <Grid container spacing={4} alignItems="center">
        {/* Video or Image */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: "16/9",
              overflow: "hidden",
              bgcolor: theme.palette.grey[900],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: { xs: "auto", md: 0 },
              maxWidth: "100%",
            }}
          >
            {course.intro ? (
              <video
                src={course.intro}
                controls
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                aria-label={t(
                  "studentCourseDetails.header.introAriaLabel",
                  "Course introduction video"
                )}
              />
            ) : (
              <img
                src={course.bannerImage || "/placeholder-banner.jpg"}
                alt={course.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </Box>
        </Grid>
        {/* Title, Author, CTA */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2} sx={{ mt: 2, px: 2 }}>
            <Typography
              variant="h3"
              fontFamily={theme.typography.h3.fontFamily}
            >
              {course.title}
            </Typography>
            <Typography
              variant="body1"
              fontFamily={theme.typography.body1.fontFamily}
              color="text.secondary"
              sx={{
                textAlign: "justify",
              }}
            >
              {course.shortDescription}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={course.instructor?.photoURL || "/default-avatar.png"}
                alt={
                  course.instructor?.name ||
                  course.instructor ||
                  t("studentCourseDetails.header.instructor")
                }
                sx={{ width: 48, height: 48 }}
              />
              <Box>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  fontFamily={theme.typography.body1.fontFamily}
                >
                  {course.instructor?.name ||
                    course.instructor ||
                    t("studentCourseDetails.header.instructor")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontFamily={theme.typography.body2.fontFamily}
                >
                  {course.instructor?.role ||
                    t("studentCourseDetails.header.role")}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth={isMobile}
              sx={{
                mt: 2,
                minWidth: { xs: "auto", md: 220 },
                alignSelf: isMobile ? "stretch" : "flex-start",
              }}
            >
              {t("studentCourseDetails.header.startLearning")}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentCourseDetailHeaderSection;
