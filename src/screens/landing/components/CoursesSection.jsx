import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Chip,
  Typography,
  Button,
  Stack,
  Paper,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LandingCourseCard from "./LandingCourseCard";
import { useStudentCourse } from "../../../contexts/studentCourseContext";
import { useUser } from "../../../contexts/UserContext";
import { enrollmentService } from "../../../services/enrollmentService";
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

  // Memoized fade indicator styles
  const fadeStyles = useMemo(
    () => ({
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 32,
      pointerEvents: "none",
      zIndex: 1,
      background: `linear-gradient(to right, ${theme.palette.background.default} 80%, transparent)`,
    }),
    [theme.palette.background.default]
  );

  const fadeRightStyles = useMemo(
    () => ({
      ...fadeStyles,
      right: 0,
      transform: "rotateY(180deg)",
    }),
    [fadeStyles]
  );

  const fadeLeftStyles = useMemo(
    () => ({
      ...fadeStyles,
      left: 0,
    }),
    [fadeStyles]
  );
  const navigate = useNavigate();
  const { getAllCourses } = useStudentCourse();
  const { userData: user, isStudent } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const scrollContainerRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [showFadeLeft, setShowFadeLeft] = useState(false);
  const [showFadeRight, setShowFadeRight] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAllCourses().then((data) => {
      if (mounted) {
        setCourses(data);
        setLoading(false);
      }
    });

    if (user) {
      enrollmentService.getEnrollmentsByStudent(user.uid).then((data) => {
        if (mounted) {
          setEnrollments(data);
        }
      });
    }

    const handleScroll = () => {
      if (window.scrollY > 400) setShowStickyCTA(true);
      else setShowStickyCTA(false);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      mounted = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [getAllCourses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) =>
        c.status === "published" &&
        (selectedCategory === "all" || c.category === selectedCategory)
    );
  }, [courses, selectedCategory]);

  // Helper to check scroll position for fade indicators
  const updateFadeIndicators = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setShowFadeLeft(container.scrollLeft > 0);
    setShowFadeRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1
    );
  };

  // 1. Improved auto-scroll with user interaction pause/resume
  useEffect(() => {
    if (!scrollContainerRef.current || filteredCourses.length <= 1) return;
    const container = scrollContainerRef.current;
    let intervalId;
    let currentCardIndex = 0;
    let resumeTimeout;

    const startAutoScroll = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!container) return;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        if (scrollWidth <= clientWidth) return;
        const isMobileView = window.innerWidth < 960;
        const gap = isMobileView ? 16 : 24;
        const cardWidth = isMobileView
          ? window.innerWidth - 120 + gap
          : 340 + gap;
        currentCardIndex++;
        let targetScroll = currentCardIndex * cardWidth;
        if (targetScroll >= scrollWidth - clientWidth) {
          currentCardIndex = 0;
          targetScroll = 0;
        }
        container.scrollTo({ left: targetScroll, behavior: "smooth" });
      }, 3000);
    };
    const stopAutoScroll = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    // Pause/resume logic
    const pauseAutoScroll = () => {
      setIsUserInteracting(true);
      stopAutoScroll();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        setIsUserInteracting(false);
        startAutoScroll();
      }, 3000);
    };
    // User interaction events
    container.addEventListener("mousedown", pauseAutoScroll);
    container.addEventListener("touchstart", pauseAutoScroll);
    container.addEventListener("wheel", pauseAutoScroll, { passive: true });
    container.addEventListener("keydown", pauseAutoScroll);
    container.addEventListener("scroll", updateFadeIndicators);
    // Keyboard navigation
    container.setAttribute("tabindex", "0");
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", "Featured Courses Carousel");
    // Start auto-scroll after a delay
    const startDelay = setTimeout(() => {
      startAutoScroll();
    }, 2000);
    // Initial fade update
    updateFadeIndicators();
    // Clean up
    return () => {
      clearTimeout(startDelay);
      stopAutoScroll();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      container.removeEventListener("mousedown", pauseAutoScroll);
      container.removeEventListener("touchstart", pauseAutoScroll);
      container.removeEventListener("wheel", pauseAutoScroll);
      container.removeEventListener("keydown", pauseAutoScroll);
      container.removeEventListener("scroll", updateFadeIndicators);
    };
  }, [filteredCourses]);

  const isEnrolledInAnyCourse =
    user?.enrolledCourses && user.enrolledCourses.length > 0;
  // console.log(filteredCourses);
  // Determine CTA configuration
  const getCtaConfig = () => {
    if (!user) {
      return {
        href: "/auth",
        label: "Sign Up Now",
        bannerText: "Join thousands of learners – Sign up for free!",
      };
    }

    if (isStudent) {
      if (isEnrolledInAnyCourse) {
        return {
          href: "/dashboard",
          label: "Continue Learning",
          bannerText: "Continue your learning journey!",
        };
      }
      if (filteredCourses.length > 0) {
        return {
          href: `/courses/${filteredCourses[0].id}/enroll`,
          label: "Enroll Now",
          bannerText: "Ready to start learning? Enroll in a course!",
        };
      }
      return {
        href: "/courses",
        label: "Browse All Courses",
        bannerText: "Explore our full course catalog.",
      };
    }

    // Logged in, but not a student (admin, etc.)
    return null;
  };

  const ctaConfig = getCtaConfig();

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
        <Box sx={{ position: "relative" }}>
          {/* Fade indicators */}
          {showFadeLeft && <Box sx={fadeLeftStyles} />}
          {showFadeRight && <Box sx={fadeRightStyles} />}
          <Box
            ref={scrollContainerRef}
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: { xs: 2, md: 3 },
              overflowX: "auto",
              overflowY: "hidden",
              py: 2,
              px: { xs: 1, md: 1 },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              userSelect: "none",
              cursor: "grab",
              minHeight: { xs: 320, md: 360 }, // Ensure enough height for cards
              position: "relative",
              outline: "none",
              "&:active": { cursor: "grabbing" },
            }}
            tabIndex={0}
            aria-label="Featured Courses Carousel"
          >
            {filteredCourses.map((course) => (
              <Box
                key={course.id}
                sx={{
                  flex: "0 0 auto",
                  minWidth: { xs: 260, sm: 280, md: 320 },
                  maxWidth: { xs: 280, sm: 320, md: 340 },
                  width: { xs: "calc(100vw - 120px)", sm: 300, md: 340 },
                  mx: { xs: 0.5, md: 1 },
                }}
              >
                <LandingCourseCard
                  course={course}
                  enrollment={enrollments.find((e) => e.courseId === course.id)}
                  onSignUp={() => navigate("/auth")}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {ctaConfig && (
        <>
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
              {ctaConfig.bannerText}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate(ctaConfig.href)}
            >
              {ctaConfig.label}
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
                onClick={() => navigate(ctaConfig.href)}
                sx={{ boxShadow: 4 }}
              >
                {ctaConfig.label}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CoursesSection;
