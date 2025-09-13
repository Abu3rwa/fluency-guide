import React, { useEffect, useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Badge,
  CircularProgress,
  useTheme,
  Fade,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import BookIcon from "@mui/icons-material/Book";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventIcon from "@mui/icons-material/Event";
import TimerIcon from "@mui/icons-material/Timer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../contexts/UserContext";
import { useRTL, getRTLIconClass, getDirectionalSpacing } from "../../../utils/rtlUtils";
import { enrollmentService } from "../../../services/enrollmentService";
import { ROUTES } from "../../../routes/constants";
import { useNavigate } from "react-router-dom";
import PaymentDialog from "../../../components/PaymentDialog";

const LandingCourseCard = ({ course, courseStatus, enrollment, onSignUp }) => {
  // Use courses namespace for translations
  const { t: tCourses } = useTranslation('courses');
  const { t } = useTranslation(); // Default namespace for common translations
  const { userData: user, isStudent } = useUser();
  const isRTL = useRTL();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [languageKey, setLanguageKey] = useState(0); // Force re-render on language change
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const navigate = useNavigate();
  const theme = useTheme();

  // Countdown timer for upcoming courses
  useEffect(() => {
    if (courseStatus === 'upcoming' && course.startDate) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const startTime = new Date(course.startDate).getTime();
        const difference = startTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setCountdown({ days, hours, minutes, seconds });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };

      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [courseStatus, course.startDate]);

  // Get course status display info
  const getStatusInfo = () => {
    const startDate = course.startDate ? new Date(course.startDate) : null;
    const endDate = course.endDate ? new Date(course.endDate) : null;

    switch (courseStatus) {
      case 'upcoming':
        return {
          label: tCourses('status.upcoming', 'Starting Soon'),
          color: 'info',
          icon: <TimerIcon sx={{ fontSize: 16 }} />,
          description: startDate ? 
            `${t('course.startsOn')} ${startDate.toLocaleDateString()}` : 
            t('course.comingSoon')
        };
      case 'active':
        return {
          label: tCourses('status.active', 'Live Now'),
          color: 'success',
          icon: <PlayCircleIcon sx={{ fontSize: 16 }} />,
          description: endDate ? 
            `${t('course.endsOn')} ${endDate.toLocaleDateString()}` : 
            t('course.ongoingCourse')
        };
      case 'ended':
        return {
          label: tCourses('status.ended', 'Course Ended'),
          color: 'error',
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
          description: endDate ? 
            `${t('course.endedOn')} ${endDate.toLocaleDateString()}` : 
            t('course.noLongerAvailable')
        };
      default:
        return {
          label: tCourses('status.available', 'Available'),
          color: 'primary',
          icon: <BookIcon sx={{ fontSize: 16 }} />,
          description: t('course.enrollAnytime')
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Listen for language changes to force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageKey(prev => prev + 1);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Debug RTL state
  useEffect(() => {
    console.log('LandingCourseCard - RTL state:', isRTL, 'Language:', t('language.en'));
  }, [isRTL, t]);

  // Get enrollment status from actual enrollment data
  const enrollmentStatus = enrollment ? enrollment.status : "not-enrolled";

  // Helper function to get image URL string
  const getImageUrl = (course) => {
    // Ensure we return a string, not an object
    if (typeof course.thumbnail === 'string') {
      return course.thumbnail;
    }
    if (typeof course.image === 'string') {
      return course.image;
    }
    // If both thumbnail and image are objects (Firebase references), extract URL
    if (course.thumbnail && typeof course.thumbnail === 'object' && course.thumbnail.url) {
      return course.thumbnail.url;
    }
    if (course.image && typeof course.image === 'object' && course.image.url) {
      return course.image.url;
    }
    // Fallback to default image
    return "/images/course-default.png";
  };

  // Helper function to get safe theme colors
  const getThemeColor = (colorName) => {
    const colorMap = {
      primary: theme.palette.primary,
      secondary: theme.palette.secondary,
      success: theme.palette.success,
      warning: theme.palette.warning,
      error: theme.palette.error,
      info: theme.palette.info,
    };

    const color = colorMap[colorName];

    // If the color doesn't exist or is undefined, fall back to primary
    if (!color || !color.main || !color.dark) {
      return (
        colorMap.primary || {
          main: "#1976d2",
          dark: "#1565c0",
        }
      );
    }

    return color;
  };

  // Enhanced action button logic based on actual enrollment status and course status
  const getActionButton = () => {
    console.log('getActionButton - isRTL:', isRTL, 'enrollment:', enrollmentStatus, 'courseStatus:', courseStatus);
    
    // If course has ended, only show "Course Ended" for non-admin users
    if (courseStatus === 'ended' && (!user || (user.role !== 'admin' && !user.isAdmin))) {
      return {
        text: tCourses("status.ended", "Course Ended"),
        variant: "error",
        disabled: true,
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        color: "error",
      };
    }
    
    if (!user) {
      return {
        text: tCourses("card.details", "View Course"),
        variant: "primary",
        onClick: () =>
          navigate(ROUTES.STUDENT_COURSE_DETAILS.replace(":id", course.id)),
        icon: (
          <BookIcon 
            sx={{ 
              fontSize: 16,
              transform: 'none' // Non-directional icon
            }} 
          />
        ),
        color: "primary",
      };
    }

    switch (enrollmentStatus) {
      case "active":
        return {
          text: tCourses("enrollment.startLearning", "Start Learning"),
          variant: "success",
          onClick: () =>
            navigate(ROUTES.STUDENT_COURSE_DETAILS.replace(":id", course.id)),
          icon: (
            <PlayCircleIcon 
              sx={{ 
                fontSize: 16,
                transform: isRTL ? 'scaleX(-1)' : 'none' // Directional icon
              }} 
            />
          ),
          color: "success",
        };
      case "pending":
        return {
          text: tCourses("enrollment.enrolling", "Enrollment Pending"),
          variant: "pending",
          disabled: true,
          icon: (
            <AccessTimeIcon 
              sx={{ 
                fontSize: 16,
                transform: 'none' // Non-directional icon
              }} 
            />
          ),
          color: "warning",
        };
      case "rejected":
        return {
          text: tCourses("enrollment.enrollmentError", "Enrollment Rejected"),
          variant: "error",
          disabled: true,
          icon: null,
          color: "error",
        };
      default:
        // For upcoming courses, show different text
        if (courseStatus === 'upcoming') {
          return {
            text: course.price === 0
              ? tCourses("card.registerFree", "Register for Free")
              : tCourses("card.registerNow", "Register Now"),
            variant: "info",
            onClick: () => setShowPaymentDialog(true),
            icon: (
              <EventIcon 
                sx={{ 
                  fontSize: 16,
                  transform: 'none'
                }} 
              />
            ),
            color: "info",
          };
        }
        
        return {
          text:
            course.price === 0
              ? tCourses("card.free", "Free")
              : tCourses("card.enroll", "Enroll Now"),
          variant: "primary",
          onClick: () => setShowPaymentDialog(true),
          icon: (
            <TrendingUpIcon 
              sx={{ 
                fontSize: 16,
                transform: isRTL ? 'scaleX(-1)' : 'none' // Directional icon
              }} 
            />
          ),
          color: "primary",
        };
    }
  };

  const actionButton = getActionButton();

  // Calculate actual course statistics
  const getCourseStats = () => {
    const stats = {
      lessons: tCourses("card.lessons", "{{count}} lessons", { count: course.totalLessons || 0 }),
      duration: course.duration || tCourses("common.noData", "N/A"),
      students: tCourses("card.students", "{{count}} students", { count: course.maxStudents || 0 }),
      rating: course.rating || null,
    };
    return stats;
  };

  const courseStats = getCourseStats();

  // Format price with actual course data
  const formatPrice = () => {
    if (course.price === 0) {
      return {
        displayPrice: t("landing.courseCard.free"),
        originalPrice: null,
      };
    }

    const originalPrice = course.price;
    let displayPrice = originalPrice;

    // Apply discount if available
    if (course.discount && course.discount > 0) {
      const discountedPrice = Math.round(
        (originalPrice * (100 - course.discount)) / 100
      );
      displayPrice = discountedPrice;
    }

    return {
      displayPrice: `$${displayPrice}`,
      originalPrice: course.discount ? `$${originalPrice}` : null,
    };
  };

  const priceInfo = formatPrice();

  return (
    <React.Fragment>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 340,
          transition: "all 0.5s ease",
          transform: isHovered ? "translateY(-8px)" : "translateY(0)",
          cursor: "pointer",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() =>
          navigate(ROUTES.STUDENT_COURSE_DETAILS.replace(":id", course.id))
        }
      >
        {/* Course Status Badge */}
        {courseStatus !== 'available' && (
          <Box
            sx={{
              position: "absolute",
              top: course.featured || course.discount ? 60 : 16,
              left: isRTL ? "auto" : 16,
              right: isRTL ? 16 : "auto",
              zIndex: 20,
              background: `linear-gradient(45deg, ${
                getThemeColor(statusInfo.color).main
              }, ${getThemeColor(statusInfo.color).dark})`,
              color: "white",
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              boxShadow: 3,
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </Box>
        )}

        {/* Featured Badge */}
        {course.featured && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: isRTL ? "auto" : 16,
              right: isRTL ? 16 : "auto",
              zIndex: 20,
              background: `linear-gradient(45deg, ${
                getThemeColor("warning").main
              }, ${getThemeColor("warning").dark})`,
              color: "white",
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              boxShadow: 3,
              animation: "pulse 2s infinite",
              direction: isRTL ? "rtl" : "ltr",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.8 },
              },
            }}
          >
            <StarIcon 
              sx={{ 
                fontSize: 12,
                transform: 'none' // Non-directional icon
              }} 
            />
            {t("landing.courseCard.featured")}
          </Box>
        )}

        {/* Discount Badge */}
        {course.discount && course.discount > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: isRTL ? "auto" : 16,
              left: isRTL ? 16 : "auto",
              zIndex: 20,
              background: `linear-gradient(45deg, ${
                getThemeColor("error").main
              }, ${getThemeColor("error").dark})`,
              color: "white",
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontSize: "0.75rem",
              fontWeight: 700,
              boxShadow: 3,
            }}
          >
            {t("landing.courseCard.percentOff", { percent: course.discount })}
          </Box>
        )}

        <Card
          sx={{
            width: "100%",
            minHeight: 420,
            position: "relative",
            boxShadow: isHovered ? 8 : 2,
            transition: "all 0.3s ease",
            borderRadius: 3,
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isHovered
                ? `linear-gradient(45deg, ${getThemeColor("primary").main}20, ${
                    getThemeColor("secondary").main
                  }20)`
                : "transparent",
              transition: "all 0.3s ease",
              zIndex: 1,
            },
          }}
        >
          {/* Image Container */}
          <Box sx={{ position: "relative", height: 200 }}>
            <CardMedia
              component="img"
              height="200"
              image={getImageUrl(course)}
              alt={course.title}
              sx={{
                objectFit: "cover",
                transition: "all 0.7s ease",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
              onLoad={() => setImageLoaded(true)}
            />

            {!imageLoaded && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, ${
                    theme.palette.grey?.[200] || "#e0e0e0"
                  }, ${theme.palette.grey?.[300] || "#bdbdbd"})`,
                  animation: "pulse 2s infinite",
                }}
              />
            )}

            {/* Overlay Content */}
            <Fade in={isHovered} timeout={300}>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "white",
                  fontSize: "0.875rem",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              >
                {courseStats.lessons > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <BookIcon 
                      sx={{ 
                        fontSize: 16,
                        transform: 'none' // Non-directional icon
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: "white" }}>
                      {courseStats.lessons} {t("landing.courseCard.lessons")}
                    </Typography>
                  </Box>
                )}
                {courseStats.duration && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeIcon 
                      sx={{ 
                        fontSize: 16,
                        transform: 'none' // Non-directional icon
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: "white" }}>
                      {courseStats.duration}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Fade>
          </Box>

          <CardContent sx={{ p: 3, position: "relative", zIndex: 2 }}>
            {/* Course Status Information */}
            {courseStatus !== 'available' && (
              <Alert 
                severity={statusInfo.color === 'error' ? 'error' : statusInfo.color === 'success' ? 'success' : 'info'}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {statusInfo.icon}
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {statusInfo.description}
                  </Typography>
                </Box>
                
                {/* Countdown Timer for Upcoming Courses */}
                {courseStatus === 'upcoming' && countdown.days > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {countdown.days}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('dashboard.time.days')}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {countdown.hours}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('dashboard.time.hours')}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {countdown.minutes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('dashboard.time.minutes')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Alert>
            )}

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "color 0.3s ease",
                color: isHovered ? "primary.main" : "text.primary",
              }}
            >
              {course.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {course.shortDescription || course.description}
            </Typography>

            {/* Instructor */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 2, fontWeight: 500, display: "block" }}
            >
              {t("landing.courseCard.by")} {course.instructor}
            </Typography>

            {/* Tags */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
            >
              {course.level && (
                <Chip
                  label={course.level}
                  size="small"
                  sx={{
                    bgcolor: "primary.100",
                    color: "primary.700",
                    fontWeight: 600,
                  }}
                />
              )}
              {course.category && (
                <Chip
                  label={course.category}
                  size="small"
                  sx={{
                    bgcolor: "secondary.100",
                    color: "secondary.700",
                    fontWeight: 600,
                  }}
                />
              )}
              {course.certificateIncluded && (
                <Chip
                  label={t("landing.courseCard.certificate")}
                  size="small"
                  icon={
                    <SchoolIcon 
                      sx={{ 
                        fontSize: 16,
                        transform: 'none' // Non-directional icon
                      }} 
                    />
                  }
                  sx={{
                    bgcolor: "success.100",
                    color: "success.700",
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            {/* Stats */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 2, 
              mb: 2,
              direction: isRTL ? "rtl" : "ltr",
            }}>
              {courseStats.rating && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <StarIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: "warning.main",
                      transform: 'none' // Non-directional icon
                    }} 
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {courseStats.rating}
                  </Typography>
                </Box>
              )}
              {courseStats.students > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PeopleIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: "text.secondary",
                      transform: 'none' // Non-directional icon
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {courseStats.students.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Price */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              {course.price === 0 ? (
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "success.main" }}
                >
                  {t("landing.courseCard.free")}
                </Typography>
              ) : (
                <>
                  {priceInfo.originalPrice && (
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: "line-through",
                        color: "text.disabled",
                      }}
                    >
                      {priceInfo.originalPrice}
                    </Typography>
                  )}
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {priceInfo.displayPrice}
                  </Typography>
                </>
              )}
            </Box>

            {/* Action Button */}
            <Button
              variant="contained"
              color={actionButton.color}
              fullWidth
              disabled={actionButton.disabled}
              startIcon={!isRTL ? actionButton.icon : undefined}
              endIcon={isRTL ? actionButton.icon : undefined}
              onClick={(e) => {
                e.stopPropagation();
                console.log('Button clicked - isRTL:', isRTL, 'startIcon:', !isRTL ? 'yes' : 'no', 'endIcon:', isRTL ? 'yes' : 'no');
                if (!actionButton.disabled && actionButton.onClick) {
                  actionButton.onClick();
                }
              }}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.875rem",
                direction: isRTL ? "rtl" : "ltr",
                background: actionButton.disabled
                  ? "grey.300"
                  : `linear-gradient(45deg, ${
                      getThemeColor(actionButton.color).main
                    }, ${getThemeColor(actionButton.color).dark})`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: actionButton.disabled ? "none" : "scale(1.02)",
                  boxShadow: actionButton.disabled ? "none" : 4,
                },
              }}
            >
              {actionButton.text}
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        course={course}
        userData={user}
        onPaymentComplete={(result) => {
          setShowPaymentDialog(false);
        }}
      />
    </React.Fragment>
  );
};

export default LandingCourseCard;
