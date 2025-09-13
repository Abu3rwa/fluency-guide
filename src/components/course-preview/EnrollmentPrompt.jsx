import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { studentCoursePreviewService } from "../../services/student-services/studentCoursePreviewService";

const EnrollmentPrompt = ({ open, course, onClose, lessons }) => {
  console.log("from enrollment prompt", lessons);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userData: user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const handleEnroll = () => {
    // Track conversion step
    studentCoursePreviewService.trackConversionStep(
      "enrollment_prompt",
      course.id,
      user?.uid
    );

    // Track enrollment prompt interaction
    studentCoursePreviewService.trackEnrollmentPrompt(
      course.id,
      "enroll_click",
      user?.uid
    );

    if (!isAuthenticated) {
      navigate(`/auth?redirect=${encodeURIComponent(`/courses/${course.id}`)}`);
    } else {
      // Proceed to payment/enrollment
      navigate(`/courses/${course.id}/enroll`);
    }
    onClose();
  };

  const handleContinueBrowsing = () => {
    // Track enrollment prompt interaction
    studentCoursePreviewService.trackEnrollmentPrompt(
      course.id,
      "continue_browsing",
      user?.uid
    );
    onClose();
  };

  const handleClose = () => {
    // Track enrollment prompt interaction
    studentCoursePreviewService.trackEnrollmentPrompt(
      course.id,
      "close",
      user?.uid
    );
    onClose();
  };

  // Track when dialog opens
  React.useEffect(() => {
    if (open) {
      studentCoursePreviewService.trackEnrollmentPrompt(
        course.id,
        "view",
        user?.uid
      );
    }
  }, [open, course.id, user?.uid]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? "100%" : "90vh",
          bgcolor: theme.palette.background.paper,
          backgroundImage: "none", // Prevents any unwanted background patterns
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        {t("enrollment.title", "Unlock Full Course Access")}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            component="img"
            src={course.thumbnail || course.image}
            alt={course.title}
            sx={{
              width: "100%",
              maxWidth: 300,
              borderRadius: 2,
              height: 200,
              objectFit: "cover",
              boxShadow: theme.shadows[2],
              mb: 2,
            }}
          />
        </Box>

        <Typography variant="h6" gutterBottom align="center">
          {course.title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          {t(
            "enrollment.description",
            "Get access to all {{count}} lessons, assignments, and certificates.",
            {
              count: lessons?.length || 0,
            }
          )}
        </Typography>

        <Box sx={{ mb: 3 }}>
          {[
            "enrollment.benefits.fullAccess",
            "enrollment.benefits.resources",
            "enrollment.benefits.certificate",
            "enrollment.benefits.lifetime",
          ].map((benefit, index) => (
            <Box
              key={benefit}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: index < 3 ? 2 : 0,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                  borderRadius: 1,
                },
              }}
            >
              <CheckCircleIcon
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 20,
                }}
              />
              <Typography variant="body1">
                {t(benefit, benefit.split(".").pop())}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Price Display */}
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.primary.dark
                : theme.palette.primary.lighter || theme.palette.primary.light,
            borderRadius: 2,
            mb: 3,
            boxShadow: theme.shadows[1],
            border: `1px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary"
            sx={{ mb: 0.5 }}
          >
            {course.price
              ? `${course.price} ${t("enrollment.price.currency", "SDG")}`
              : t("enrollment.price.free", "Free")}
          </Typography>
          <Typography
            variant="body2"
            color={
              theme.palette.mode === "dark" ? "text.primary" : "text.secondary"
            }
            sx={{ opacity: 0.9 }}
          >
            {t("enrollment.price.oneTime", "One-time payment")}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleEnroll}
          className="enrollment-cta"
          sx={{
            py: 2,
            fontSize: isMobile ? "1.1rem" : "1rem",
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: theme.shadows[4],
            "&:hover": {
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {isAuthenticated
            ? t(
                "enrollment.buttons.enrollNow",
                "Enroll Now - {{price}} {{currency}}",
                {
                  price: course.price || t("enrollment.price.free", "Free"),
                  currency: t("enrollment.price.currency", "SDG"),
                }
              )
            : t("enrollment.buttons.signUpAndEnroll", "Sign Up & Enroll")}
        </Button>

        <Button
          variant="outlined"
          onClick={handleContinueBrowsing}
          fullWidth
          sx={{
            fontSize: isMobile ? "1rem" : "0.9rem",
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          }}
        >
          {t("enrollment.buttons.continueBrowsing", "Continue Browsing")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrollmentPrompt;
