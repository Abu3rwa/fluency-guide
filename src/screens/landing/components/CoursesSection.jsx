import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Chip,
  Typography,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Container,
  Fade,
  useMediaQuery,
} from "@mui/material";
import {
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../../contexts/ThemeContext";
import LandingCourseCard from "./LandingCourseCard";
import { useStudentCourse } from "../../../contexts/studentCourseContext";
import { useUser } from "../../../contexts/UserContext";
import { enrollmentService } from "../../../services/enrollmentService";


const CoursesSection = () => {
  // Use courses namespace for translations
  const { t: tCourses } = useTranslation('courses');
  const { t } = useTranslation(); // Default namespace for common translations
  const { mode, theme: customTheme } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const { getAllCourses } = useStudentCourse();
  const { userData: user } = useUser();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));

  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrollments, setEnrollments] = useState([]);

  // Dynamic container maxWidth based on screen size for better centering
  const containerMaxWidth = useMemo(() => {
    if (isLarge) return "lg"; // Center content on large screens
    if (isDesktop) return "md"; // Center content on medium desktop screens
    return "xl"; // Full width on smaller screens
  }, [isLarge, isDesktop]);

  // Dynamic grid columns based on screen size
  const gridColumns = useMemo(() => {
    if (isLarge) return "repeat(3, 1fr)"; // 3 columns on large screens for better centering
    if (isDesktop) return "repeat(2, 1fr)"; // 2 columns on desktop for better centering
    if (isTablet) return "repeat(2, 1fr)"; // 2 columns on tablet
    return "1fr"; // 1 column on mobile
  }, [isLarge, isDesktop, isTablet]);

  // Dynamic number of courses to display based on screen size
  const maxCoursesToShow = useMemo(() => {
    if (isLarge) return 6; // Show 6 courses (2 rows of 3) on large screens
    if (isDesktop) return 4; // Show 4 courses (2 rows of 2) on desktop
    if (isTablet) return 4; // Show 4 courses on tablet
    return 8; // Show 8 courses on mobile (can scroll)
  }, [isLarge, isDesktop, isTablet]);

  // Enhanced categories with better mobile support
  const categories = useMemo(() => [
    { label: tCourses("navigation.allCourses", "All Courses"), value: "all", icon: "🎯" },
    { label: t("landing.courses.categories.foundation"), value: "foundation", icon: "📚" },
    { label: t("landing.courses.categories.business"), value: "business", icon: "💼" },
    { label: t("landing.courses.categories.conversation"), value: "conversation", icon: "💬" },
    { label: t("landing.courses.categories.examPrep"), value: "exam", icon: "🎓" },
  ], [tCourses, t]);


  // Enhanced data fetching with performance optimizations
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Parallel data fetching for better performance
        const [coursesData, enrollmentsData] = await Promise.all([
          getAllCourses(),
          user ? enrollmentService.getEnrollmentsByStudent(user.uid) : Promise.resolve([])
        ]);
        
        if (mounted) {
          setCourses(coursesData || []);
          setEnrollments(enrollmentsData || []);
        }
      } catch (error) {
        console.error('Failed to load courses data:', error);
        if (mounted) {
          setCourses([]);
          setEnrollments([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [getAllCourses, user]);

  // Helper function to get course status based on dates
  const getCourseStatus = (course) => {
    const now = new Date();
    const startDate = course.startDate ? new Date(course.startDate) : null;
    const endDate = course.endDate ? new Date(course.endDate) : null;

    if (!startDate) {
      return 'available'; // No start date means always available
    }

    if (endDate && now > endDate) {
      return 'ended'; // Course has ended
    }

    if (now < startDate) {
      return 'upcoming'; // Course hasn't started yet
    }

    return 'active'; // Course is currently running
  };

  // Filtered courses with date-based visibility
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Basic filters
      const isPublished = course.status === "published";
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
      
      if (!isPublished || !matchesCategory) {
        return false;
      }

      // Date-based visibility logic
      const courseStatus = getCourseStatus(course);
      
      // Show all courses to everyone (click restrictions are handled in LandingCourseCard)
      return true;
    });
  }, [courses, selectedCategory, user]);
// if (filteredCourses.length==0){return;}

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: {
            xs: "100%",
            md: isLarge ? "1200px" : "900px",
            lg: "1200px"
          },
          px: { xs: 2, sm: 3, md: 3, lg: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Enhanced Section Header with Responsive Centering */}
        <Fade in timeout={800}>
          <Box
            textAlign="center"
            mb={{ xs: 4, md: 6 }}
            sx={{
              width: "100%",
              maxWidth: {
                xs: "100%",
                md: isLarge ? "800px" : "700px",
                lg: "900px"
              },
              px: { xs: 2, md: 0 },
              // Ensure perfect centering
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                mb: 2,
                fontWeight: 800,
                background: `linear-gradient(135deg,
                  ${theme.palette.primary.main} 0%,
                  ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                textAlign: "center",
                // Responsive letter spacing for better readability
                letterSpacing: { xs: "-0.02em", md: "-0.03em" },
              }}
            >
              {tCourses("listing.title", "Explore Our Courses")}
            </Typography>

             
          </Box>
        </Fade>

        {/* Enhanced Category Filters with Responsive Centering */}
        <Fade in timeout={1000}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: { xs: 3, md: 5 },
              px: { xs: 1, md: 0 },
              width: "100%",
              maxWidth: {
                xs: "100%",
                md: isLarge ? "900px" : "800px",
                lg: "1000px"
              },
              flexDirection: "column",
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 1, md: 1.5 }}
              sx={{
                flexWrap: "wrap",
                justifyContent: "center",
                gap: { xs: 1, md: 1.5 },
                // Better spacing for larger screens
                maxWidth: "100%",
                "& > *": {
                  flexShrink: 0,
                },
              }}
            >
              {categories.map((category) => (
                <Chip
                  key={category.value}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </Box>
                  }
                  onClick={() => setSelectedCategory(category.value)}
                  color={selectedCategory === category.value ? "primary" : "default"}
                  variant={selectedCategory === category.value ? "filled" : "outlined"}
                  clickable
                  sx={{
                    height: { xs: 36, md: 40 },
                    fontSize: { xs: "0.85rem", md: "0.9rem" },
                    fontWeight: selectedCategory === category.value ? 600 : 500,
                    transition: "all 0.3s ease",
                    // Enhanced hover effects for better UX
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[4],
                    },
                    // Better padding for larger screens
                    px: { xs: 1.5, md: 2 },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Fade>

        {/* Course Content Area */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredCourses.length === 0 ? (
          <Fade in timeout={600}>
            <Paper
              elevation={2}
              sx={{
                textAlign: "center",
                py: { xs: 6, md: 8 },
                px: 3,
                borderRadius: theme.shape.borderRadius * 3,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 2, fontSize: { xs: "1.1rem", md: "1.25rem" } }}
              >
                {tCourses("listing.noResults", "No courses found matching your criteria")}
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setSelectedCategory("all")}
                sx={{ mt: 2 }}
              >
                {tCourses("navigation.allCourses", "All Courses")}
              </Button>
            </Paper>
          </Fade>
        ) : (
          <Fade in timeout={1200}>
            <Box
              sx={{
                // Ensure the entire content area is centered
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Course Grid - Responsive Layout with Enhanced Centering */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: gridColumns,
                  gap: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
                  mb: { xs: 3, md: 4 },
                  width: "100%",
                  placeItems: { xs: "stretch", md: "center" },
                  // Ensure the grid itself is centered
                  justifyContent: "center",
                  maxWidth: {
                    xs: "100%",
                    md: isLarge ? "1050px" : "850px",
                    lg: "1250px"
                  },
                  mx: "auto",
                  // Ensure grid items are properly sized and centered
                  "& > *": {
                    width: "100%",
                    maxWidth: {
                      xs: "100%",
                      md: isLarge ? "320px" : "400px",
                      lg: "380px"
                    },
                    minWidth: {
                      xs: "100%",
                      md: isLarge ? "300px" : "350px",
                      lg: "350px"
                    },
                  },
                }}
              >
                {filteredCourses.slice(0, maxCoursesToShow).map((course, index) => (
                  <LandingCourseCard
                    key={course.id}
                    course={course}
                    courseStatus={getCourseStatus(course)}
                    enrollment={enrollments.find((e) => e.courseId === course.id)}
                    onSignUp={() => navigate("/auth")}
                    loading={loading}
                    priority={index < 3}
                  />
                ))}
              </Box>

              {/* View All Courses Button with Enhanced Centering */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: { xs: 3, md: 4 },
                  width: "100%",
                  maxWidth: {
                    xs: "100%",
                    md: isLarge ? "600px" : "500px",
                    lg: "700px"
                  },
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  endIcon={<ViewListIcon />}
                  onClick={() => navigate("/student/courses")}
                  sx={{
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 2 },
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    fontWeight: 600,
                    borderRadius: theme.shape.borderRadius * 3,
                    textTransform: "none",
                    minWidth: { xs: "200px", md: "250px" },
                    // Enhanced button styling for larger screens
                    ...(isDesktop && {
                      fontSize: "1.1rem",
                      px: 5,
                      py: 2.5,
                    }),
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  {tCourses("navigation.allCourses", "View All Courses")}
                </Button>
              </Box>
            </Box>
          </Fade>
        )}

      </Box>
    </Box>
  );
};

export default CoursesSection;
