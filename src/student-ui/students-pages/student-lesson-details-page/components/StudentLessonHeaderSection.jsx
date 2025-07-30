import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import { useNavigate } from "react-router-dom";

const StudentLessonHeaderSection = ({
  lesson,
  courseTitle,
  moduleTitle,
  onBookmark,
  onShare,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(lesson?.bookmarked || false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBookmark = async () => {
    try {
      const newBookmarkedState = !isBookmarked;
      setIsBookmarked(newBookmarkedState);

      if (onBookmark) {
        await onBookmark(lesson?.id, newBookmarkedState);
      }

      setSnackbarMessage(
        newBookmarkedState
          ? t("lessonDetails.bookmarked")
          : t("lessonDetails.bookmarkRemoved")
      );
      setSnackbarSeverity("info");
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage(t("lessonDetails.errorBookmarking"));
      setSnackbarSeverity("error");
      setShowSnackbar(true);
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleShare = async () => {
    try {
      if (onShare) {
        await onShare(lesson);
      } else {
        // Default share functionality
        if (navigator.share) {
          await navigator.share({
            title: lesson?.title || t("lessonDetails.shareTitle"),
            text: `${t("lessonDetails.shareText")} ${lesson?.title}`,
            url: window.location.href,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(window.location.href);
          setSnackbarMessage(t("lessonDetails.linkCopied"));
          setSnackbarSeverity("success");
          setShowSnackbar(true);
        }
      }
    } catch (error) {
      setSnackbarMessage(t("lessonDetails.errorSharing"));
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
  };

  const progress = lesson?.progress || 0;
  const duration = lesson?.duration || 0;
  const difficulty = lesson?.difficulty || "medium";

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  const getDifficultyIcon = (diff) => {
    switch (diff) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <>
      <Fade in timeout={600}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1100,
            marginBottom: 3,
            bgcolor: theme.palette.background.paper,
            boxShadow: isScrolled ? theme.shadows[4] : theme.shadows[1],
            borderBottom: `1px solid ${theme.palette.divider}`,
            transition: "all 0.3s ease-in-out",
            backdropFilter: isScrolled ? "blur(10px)" : "none",
            backgroundColor: isScrolled
              ? `${theme.palette.background.paper}dd`
              : theme.palette.background.paper,
          }}
        >
          {/* Lesson Title - Top Section */}
          <Box
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1.5, sm: 2 },
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: theme.typography.h4.fontFamily,
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                lineHeight: 1.2,
                textAlign: { xs: "center", sm: "left" },
                mb: { xs: 1, sm: 0 },
              }}
            >
              {lesson?.title || t("lessonDetails.notFound")}
            </Typography>
          </Box>

          {/* Navigation and Actions - Bottom Section */}
          <Box
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Left Section - Back Button and Breadcrumbs */}
            <Box
              display="flex"
              alignItems="center"
              sx={{
                flex: 1,
                minWidth: 0,
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Tooltip title={t("common.back")} arrow>
                <IconButton
                  aria-label={t("common.back")}
                  onClick={() => navigate(-1)}
                  edge="start"
                  sx={{
                    bgcolor: theme.palette.action.hover,
                    "&:hover": {
                      bgcolor: theme.palette.action.selected,
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease-in-out",
                    p: { xs: 1, sm: 1.5 },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>

              {/* Breadcrumbs */}
              {(courseTitle || moduleTitle) && (
                <Breadcrumbs
                  aria-label="lesson breadcrumb"
                  sx={{
                    "& .MuiBreadcrumbs-separator": {
                      mx: 0.5,
                    },
                    "& .MuiBreadcrumbs-ol": {
                      flexWrap: "wrap",
                    },
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  {courseTitle && (
                    <Link
                      underline="hover"
                      color="inherit"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(-2); // Go back to course
                      }}
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {courseTitle}
                    </Link>
                  )}
                  {moduleTitle && (
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      {moduleTitle}
                    </Typography>
                  )}
                </Breadcrumbs>
              )}
            </Box>

            {/* Center Section - Lesson Meta Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "center",
                flex: { xs: 1, sm: "none" },
              }}
            >
              {duration > 0 && (
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${duration} ${t("lessonDetails.minutes")}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    height: { xs: 24, sm: 28 },
                  }}
                />
              )}
              {difficulty && (
                <Chip
                  label={`${getDifficultyIcon(difficulty)} ${t(
                    `lessonDetails.${difficulty}`
                  )}`}
                  size="small"
                  color={getDifficultyColor(difficulty)}
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    height: { xs: 24, sm: 28 },
                  }}
                />
              )}
            </Box>

            {/* Right Section - Action Buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                flexShrink: 0,
              }}
            >
              {/* Bookmark Button */}
              <Tooltip
                title={
                  isBookmarked
                    ? t("lessonDetails.removeBookmark")
                    : t("lessonDetails.addBookmark")
                }
                arrow
              >
                <IconButton
                  onClick={handleBookmark}
                  sx={{
                    color: isBookmarked
                      ? theme.palette.warning.main
                      : theme.palette.action.active,
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Tooltip>

              {/* Share Button */}
              <Tooltip title={t("lessonDetails.share")} arrow>
                <IconButton
                  onClick={handleShare}
                  sx={{
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Progress Bar */}
          {progress > 0 && (
            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  {t("lessonDetails.progress")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: { xs: 3, sm: 4 },
                  borderRadius: 2,
                  bgcolor: theme.palette.action.hover,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.main,
                    transition: "transform 0.3s ease-in-out",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Fade>

      {/* Snackbar for feedback */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StudentLessonHeaderSection;
