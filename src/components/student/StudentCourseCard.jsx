import React, { useState, memo, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  useMediaQuery,
  Fade,
  IconButton,
  Tooltip,
  LinearProgress,
  Rating,
  Skeleton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Group as GroupIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";
import { CourseCardImage } from "./cards/CourseCardImage";
import { 
  getCardStyles, 
  getButtonStyles, 
  getChipStyles, 
  getTypographyStyles,
  getFocusRingStyles 
} from "./theme/styleUtils";
import { 
  COURSE_CARD_VARIANTS, 
  DESIGN_TOKENS, 
  TRANSITIONS 
} from "./constants";

// Course stats component for better organization
const CourseStats = memo(({ 
  rating, 
  reviewCount, 
  duration, 
  totalLessons, 
  enrollmentCount 
}) => {
  const { t } = useTranslation();
  
  const stats = [
    rating > 0 && (
      <Box key="rating" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Rating
          value={rating}
          precision={0.1}
          size="small"
          readOnly
          sx={{ fontSize: "1rem" }}
        />
        <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
          {rating.toFixed(1)}
        </Typography>
        {reviewCount > 0 && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: "0.8rem" }}
          >
            ({reviewCount})
          </Typography>
        )}
      </Box>
    ),
    duration && (
      <Box key="duration" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: "0.85rem" }}
        >
          {duration}h
        </Typography>
      </Box>
    ),
    totalLessons > 0 && (
      <Box key="lessons" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <BookIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: "0.85rem" }}
        >
          {totalLessons} {t("studentCourse.lessons", "lessons")}
        </Typography>
      </Box>
    ),
    enrollmentCount > 0 && (
      <Box key="enrollment" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <GroupIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: "0.85rem" }}
        >
          {enrollmentCount.toLocaleString()}
        </Typography>
      </Box>
    )
  ].filter(Boolean);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      {stats}
    </Box>
  );
});

CourseStats.displayName = "CourseStats";

const StudentCourseCard = memo(({ 
  course, 
  loading = false, 
  showBookmark = true,
  isBookmarked = false,
  onBookmarkToggle,
  variant = COURSE_CARD_VARIANTS.DEFAULT,
  priority = false,
  showProgress = false,
  progress = 0,
  enrollment = null,
  className,
  onPreviewClick
}) => {
  const { t } = useTranslation();
  const { mode, theme } = useCustomTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  
  const [isHovered, setIsHovered] = useState(false);

  // Event handlers with useCallback for performance
  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    navigate(`/student/courses/${course?.id}`);
  }, [navigate, course?.id]);

  const handleBookmarkClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    onBookmarkToggle?.(course);
  }, [onBookmarkToggle, course]);

  const handleActionClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/student/courses/${course?.id}`);
  }, [navigate, course?.id]);

  const handlePreview = useCallback(() => {
    onPreviewClick?.(course);
  }, [onPreviewClick, course]);

  // Get enrollment status
  const getEnrollmentStatus = useCallback(() => {
    if (!enrollment) return null;
    
    const statusMap = {
      enrolled: { 
        label: t("studentCourse.enrolled"), 
        color: "success", 
        icon: <CheckCircleIcon /> 
      },
      pending: { 
        label: t("studentCourse.pending"), 
        color: "warning", 
        icon: <ScheduleIcon /> 
      },
      rejected: { 
        label: t("studentCourse.rejected"), 
        color: "error", 
        icon: <LockIcon /> 
      }
    };
    
    return statusMap[enrollment.status] || null;
  }, [enrollment, t]);

  // Loading state
  if (loading) {
    return (
      <Card
        sx={{
          height: variant === COURSE_CARD_VARIANTS.COMPACT ? 350 : 420,
          borderRadius: DESIGN_TOKENS.BORDER_RADIUS.LARGE,
          boxShadow: DESIGN_TOKENS.SHADOWS.CARD_REST,
        }}
        className={className}
      >
        <CourseCardImage loading={true} />
        <CardContent sx={{ p: DESIGN_TOKENS.SPACING.LG }}>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (!course) {
    return null;
  }

  const {
    id,
    title,
    description,
    shortDescription,
    price = 0,
    instructorName,
    image,
    thumbnail,
    category,
    level,
    duration,
    rating = 0,
    reviewCount = 0,
    enrollmentCount = 0,
    discount = 0,
    featured = false,
    tags = [],
    language = "English",
    totalLessons = 0,
  } = course;

  const finalPrice = discount ? price * (1 - discount / 100) : price;
  const imageUrl = thumbnail || image;
  const enrollmentStatus = getEnrollmentStatus();

  return (
    <Fade in timeout={300 + (priority ? 0 : Math.random() * 200)}>
      <Card
        className="student-course-card"
        component={Link}
        to={`/student/courses/${id}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: variant === "compact" ? 350 : 420,
          borderRadius: 4,
          boxShadow: isHovered ? 12 : 3,
          transform: isHovered ? "translateY(-8px)" : "translateY(0)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          textDecoration: "none",
          color: "inherit",
          position: "relative",
          overflow: "hidden",
          bgcolor: mode === "dark" ? "grey.900" : "background.paper",
          border: `2px solid ${
            enrollmentStatus?.color === "success" 
              ? "success.main" 
              : isHovered 
                ? "primary.main" 
                : "transparent"
          }`,
          "&:hover": {
            textDecoration: "none",
            color: "inherit",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)`,
            transition: "left 0.6s ease",
            zIndex: 1,
          },
          "&:hover::before": {
            left: "100%",
          },
        }}
      >
        {/* Featured Badge */}
        {featured && (
          <Chip
            label={t("studentCourse.featured", "⭐ Featured")}
            color="warning"
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 3,
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
        )}

        {/* Enrollment Status Badge */}
        {enrollmentStatus && (
          <Chip
            icon={enrollmentStatus.icon}
            label={enrollmentStatus.label}
            color={enrollmentStatus.color}
            size="small"
            sx={{
              position: "absolute",
              top: featured ? 56 : 16,
              left: 16,
              zIndex: 3,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        )}

        {/* Bookmark Button */}
        {showBookmark && (
          <Tooltip title={isBookmarked ? t("studentCourse.removeBookmark") : t("studentCourse.addBookmark")}>
            <IconButton
              onClick={handleBookmarkClick}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 3,
                bgcolor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(4px)",
                "&:hover": { 
                  bgcolor: "white",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isBookmarked ? (
                <BookmarkIcon color="primary" />
              ) : (
                <BookmarkBorderIcon />
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* Course Image */}
        <CourseCardImage 
          src={imageUrl} 
          alt={title} 
          loading={loading}
          featured={featured}
          onPreviewClick={onPreviewClick ? handlePreview : undefined}
          priority={priority}
        />

        {/* Course Content */}
        <CardContent 
          sx={{ 
            p: DESIGN_TOKENS.SPACING.LG,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Category, Level & Language */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={category}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontSize: "0.75rem", height: 26, fontWeight: 600 }}
            />
            <Chip
              label={level}
              size="small"
              color="secondary"
              sx={{ fontSize: "0.75rem", height: 26, fontWeight: 600 }}
            />
            {language && (
              <Chip
                icon={<LanguageIcon sx={{ fontSize: 14 }} />}
                label={language}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 26 }}
              />
            )}
          </Box>

          {/* Course Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", md: "1.2rem" },
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: mode === "dark" ? "white" : "text.primary",
            }}
          >
            {title}
          </Typography>

          {/* Course Description */}
          {variant !== "compact" && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.5,
                fontSize: "0.9rem",
              }}
            >
              {shortDescription || description}
            </Typography>
          )}

          {/* Instructor */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{ 
                width: 28, 
                height: 28, 
                bgcolor: "primary.main",
                fontSize: "0.8rem"
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.9rem", fontWeight: 500 }}
            >
              {instructorName}
            </Typography>
          </Box>

          {/* Course Stats */}
          <CourseStats
            rating={rating}
            reviewCount={reviewCount}
            duration={duration}
            totalLessons={totalLessons}
            enrollmentCount={enrollmentCount}
          />

          {/* Progress Bar for Enrolled Courses */}
          {showProgress && progress > 0 && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                  {t("studentCourse.progress")}
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: mode === "dark" ? "grey.700" : "grey.200",
                }}
              />
            </Box>
          )}

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Price & Action */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: "auto",
            }}
          >
            <Box>
              {discount > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                    fontSize: "0.9rem",
                  }}
                >
                  ${price}
                </Typography>
              )}
              
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 800, fontSize: "1.3rem" }}
              >
                {price === 0 ? (
                  t("studentCourse.free", "Free")
                ) : (
                  `$${finalPrice.toFixed(2)}`
                )}
              </Typography>
              
              {discount > 0 && (
                <Chip
                  label={`${discount}% OFF`}
                  color="error"
                  size="small"
                  sx={{ mt: 0.5, fontSize: "0.7rem", height: 22, fontWeight: 700 }}
                />
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="medium"
              sx={getButtonStyles(theme, "primary", "medium")}
              onClick={handleActionClick}
              aria-label={`${enrollmentStatus?.color === "success" 
                ? t("studentCourse.continue", "Continue")
                : t("studentCourse.viewCourse", "View Course")
              } ${title}`}
            >
              {enrollmentStatus?.color === "success" 
                ? t("studentCourse.continue", "Continue")
                : t("studentCourse.viewCourse", "View Course")
              }
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
});

StudentCourseCard.displayName = "StudentCourseCard";

export default StudentCourseCard;