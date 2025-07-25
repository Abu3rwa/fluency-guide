import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Typography,
  Button,
  Stack,
  Paper,
  CircularProgress,
} from "@mui/material";
import CourseCard from "./CourseCard";
import { useStudentCourse } from "../../../contexts/studentCourseContext";
import { useUser } from "../../../contexts/UserContext";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const categories = [
  { label: "All", value: "all" },
  { label: "Foundation", value: "foundation" },
  { label: "Business", value: "business" },
  { label: "Conversation", value: "conversation" },
  { label: "Exam Prep", value: "exam" },
];

const CoursesSection = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { getAllCourses } = useStudentCourse();
  const { userData: user, isStudent } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAllCourses().then((data) => {
      if (mounted) {
        setCourses(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [getAllCourses]);

  // Filter for published and featured
  const filteredCourses = courses.filter(
    (c) =>
      c.published &&
      c.featured &&
      (selectedCategory === "all" || c.category === selectedCategory)
  );
  console.log(filteredCourses);
  // Sticky CTA logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) setShowStickyCTA(true);
      else setShowStickyCTA(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine CTA button
  let ctaHref = "/auth";
  let ctaLabel = "Sign Up Now";
  if (user && isStudent && filteredCourses.length > 0) {
    ctaHref = `/courses/${filteredCourses[0].id}/enroll`;
    ctaLabel = "Enroll in a Course";
  }

  let stickyCtaLabel = "Sign Up to Access All Courses";
  let stickyCtaHref = "/auth";
  if (user && isStudent && filteredCourses.length > 0) {
    stickyCtaLabel = "Enroll in a Course";
    stickyCtaHref = `/courses/${filteredCourses[0].id}/enroll`;
  }

  return (
    <Box
      sx={{
        py: { xs: 4, md: 8 },
        bgcolor: theme.palette.background.default,
        position: "relative",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: theme.palette.primary.main,
          fontFamily: theme.typography.h4.fontFamily,
        }}
      >
        {t("courses.title", "Explore Our Courses")}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        mb={3}
        flexWrap="wrap"
      >
        {categories.map((cat) => (
          <Chip
            key={cat.value}
            label={cat.label}
            color={selectedCategory === cat.value ? "primary" : "default"}
            onClick={() => setSelectedCategory(cat.value)}
            clickable
          />
        ))}
      </Stack>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredCourses.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
          No courses found.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
            overflowX: "auto",
            py: 2,
            px: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
          tabIndex={0}
          aria-label="Featured Courses Carousel"
        >
          {filteredCourses.map((course) => (
            <Box
              key={course.id}
              sx={{ flex: "0 0 auto", minWidth: 300, maxWidth: 340 }}
            >
              <CourseCard
                course={course}
                onSignUp={() => (window.location.href = "/auth")}
              />
            </Box>
          ))}
        </Box>
      )}
      {/* Section CTA Banner */}
      <Paper
        elevation={3}
        sx={{
          mt: 5,
          p: 3,
          textAlign: "center",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={1}>
          Join thousands of learners – Sign up for free!
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          href={ctaHref}
        >
          {ctaLabel}
        </Button>
      </Paper>
      {/* Sticky CTA */}
      {showStickyCTA && (
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            left: 0,
            width: "100vw",
            display: "flex",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            href={stickyCtaHref}
            sx={{ boxShadow: 4 }}
          >
            {stickyCtaLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CoursesSection;
