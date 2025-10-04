import React, { useState, memo } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Skeleton,
  useMediaQuery,
  Fade,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Star as StarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  PlayArrow as PlayIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";

// Optimized image component with lazy loading
const CourseImage = memo(({ src, alt, loading }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height={180}
        animation="wave"
        sx={{ borderRadius: "12px 12px 0 0" }}
      />
    );
  }

  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {!imageLoaded && !imageError && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={180}
          animation="wave"
          sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
      
      {!imageError ? (
        <CardMedia
          component="img"
          height={180}
          image={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          sx={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
            opacity: imageLoaded ? 1 : 0,
          }}
        />
      ) : (
        <Box
          sx={{
            height: 180,
            bgcolor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "grey.500",
          }}
        >
          <BookIcon sx={{ fontSize: 48 }} />
        </Box>
      )}
      
      {/* Play overlay for preview */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          transition: "opacity 0.3s ease",
          ".course-card:hover &": {
            opacity: 1,
          },
        }}
      >
        <IconButton
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.9)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <PlayIcon sx={{ fontSize: 32, color: "primary.main" }} />
        </IconButton>
      </Box>
    </Box>
  );
});

CourseImage.displayName = "CourseImage";

const CourseCard = memo(({ 
  course, 
  loading = false, 
  showBookmark = false,
  isBookmarked = false,
  onBookmarkToggle,
  variant = "default", // default, compact, detailed
  priority = false 
}) => {
  const { t } = useTranslation();
  const { t: tCourses } = useTranslation('courses');
  const { mode } = useCustomTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <Card
        sx={{
          height: variant === "compact" ? 320 : 400,
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height={180} />
        <CardContent sx={{ p: 2 }}>
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={36} />
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
    price,
    instructorName,
    image,
    thumbnail,
    category,
    level,
    duration,
    rating = 0,
    enrollmentCount = 0,
    discount,
    featured = false,
  } = course;

  const finalPrice = discount ? price * (1 - discount / 100) : price;
  const imageUrl = thumbnail || image;

  const handleCardClick = (e) => {
    e.preventDefault();
    navigate(`/student/courses/${id}`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onBookmarkToggle?.(course);
  };

  return (
    <Fade in timeout={300 + (priority ? 0 : 200)}>
      <Card
        className="course-card"
        component={Link}
        to={`/student/courses/${id}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: variant === "compact" ? 320 : 400,
          borderRadius: 3,
          boxShadow: isHovered ? 8 : 2,
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          textDecoration: "none",
          color: "inherit",
          position: "relative",
          overflow: "hidden",
          bgcolor: mode === "dark" ? "grey.900" : "background.paper",
          border: `1px solid ${mode === "dark" ? "grey.800" : "grey.200"}`,
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
            transition: "left 0.5s ease",
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
            label={t("courseCard.featured", "Featured")}
            color="secondary"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 2,
              fontWeight: 600,
            }}
          />
        )}

        {/* Bookmark Button */}
        {showBookmark && (
          <Tooltip title={isBookmarked ? t("courseCard.removeBookmark") : t("courseCard.addBookmark")}>
            <IconButton
              onClick={handleBookmarkClick}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 2,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                "&:hover": { bgcolor: "white" },
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
        <CourseImage 
          src={imageUrl} 
          alt={title} 
          loading={loading}
        />

        {/* Course Content */}
        <CardContent 
          sx={{ 
            p: { xs: 2, md: 2.5 }, 
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Category & Level */}
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Chip
              label={category}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: 24 }}
            />
            <Chip
              label={level}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: "0.75rem", height: 24 }}
            />
          </Box>

          {/* Course Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.3,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
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
                mb: 2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.4,
              }}
            >
              {description}
            </Typography>
          )}

          {/* Instructor Info */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{ 
                width: 24, 
                height: 24, 
                mr: 1, 
                bgcolor: "primary.main",
                fontSize: "0.75rem"
              }}
            >
              <PersonIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.85rem" }}
            >
              {t("courseCard.by", "By")} {instructorName}
            </Typography>
          </Box>

          {/* Course Stats */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            {rating > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <StarIcon sx={{ fontSize: 16, color: "orange" }} />
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  {rating.toFixed(1)}
                </Typography>
              </Box>
            )}
            
            {duration && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: "0.85rem" }}
                >
                  {typeof duration === 'number' ? `${duration} ${tCourses("common.hoursSuffix", "h")}` : duration}
                </Typography>
              </Box>
            )}
            
            {enrollmentCount > 0 && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: "0.85rem" }}
              >
                {enrollmentCount} {t("courseCard.students", "students")}
              </Typography>
            )}
          </Box>

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
                    fontSize: "0.85rem",
                  }}
                >
                  ${price}
                </Typography>
              )}
              
              <Typography
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 700, fontSize: "1.1rem" }}
              >
                {price === 0 ? (
                  t("courseCard.free", "Free")
                ) : (
                  `$${finalPrice.toFixed(2)}`
                )}
              </Typography>
              
              {discount > 0 && (
                <Chip
                  label={t("courseCard.percentOff", "{{percent}}% off", { percent: discount })}
                  color="error"
                  size="small"
                  sx={{ mt: 0.5, fontSize: "0.7rem", height: 20 }}
                />
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                minWidth: "auto",
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate(`/student/courses/${id}`);
              }}
            >
              {t("courseCard.viewCourse", "View Course")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
});

CourseCard.displayName = "CourseCard";

export default CourseCard;
