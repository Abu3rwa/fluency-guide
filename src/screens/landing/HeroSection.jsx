import React, { useState } from "react";
import { Box, Typography, Button, Fade } from "@mui/material";
import VideoModal from "./VideoModal";
import GradientText from "./GradientText";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import { useAuth } from "../../contexts/AuthContext";
import { useLandingPage } from "../../contexts/LandingPageContext";
import { ROUTES } from "../../routes/constants";

const HeroSection = ({ isRTL, t, tAuth, navigate, theme }) => {
  const [open, setOpen] = useState(false);
  const { currentUser, loading } = useAuth();
  const { heroContent } = useLandingPage();

  // Ensure heroContent is always an object to prevent errors
  const safeHeroContent = heroContent || {};

  // Show loading state if hero content is not yet loaded
  const isHeroLoading = !heroContent && !safeHeroContent.title;

  const handleStartLearning = () => {
    if (currentUser) {
      // User is logged in, navigate to profile/dashboard
      navigate(ROUTES.STUDENT_DASHBOARD.replace(":id", currentUser.id));
    } else {
      // User is not logged in, navigate to auth
      navigate("/auth");
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: "100vh", md: "90vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 8 },
        pt: { xs: "80px", md: "100px" },
        pb: { xs: 8, md: 8 },
        flexDirection: "column",
        overflow: "hidden",
        backgroundImage:
          heroContent?.backgroundImage && heroContent.backgroundImage !== ""
            ? `url(${heroContent.backgroundImage})`
            : `linear-gradient(135deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.secondary.main} 50%, 
                ${theme.palette.primary.dark} 100%)`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg,
            rgba(124, 58, 237, 0.4) 0%,
            rgba(245, 158, 66, 0.3) 50%,
            rgba(0, 0, 0, 0.2) 100%)`,
          zIndex: 1,
        },
      }}
    >
      {/* Content with enhanced styling */}
      <Fade in timeout={1000}>
        {isHeroLoading ? (
          <Box
            sx={{
              color: "#fff",
              textAlign: "center",
              zIndex: 2,
              py: { xs: 6, md: 0 },
              px: { xs: 3, md: 8 },
              position: "relative",
              maxWidth: { md: "800px" },
              width: "100%",
            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, #fff 0%, ${theme.palette.secondary.light} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: { xs: 4, md: 3 },
                fontSize: {
                  xs: "2.8rem",
                  sm: "3.5rem",
                  md: "4.5rem",
                  lg: "5rem",
                },
                fontWeight: 800,
                lineHeight: { xs: 1.2, md: 1.1 },
                letterSpacing: "-0.02em",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { opacity: 0.6 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.6 },
                },
              }}
            >
              {t("landing.hero.loading", "Loading amazing content...")}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mt: 2,
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "rgba(255, 255, 255, 0.7)",
                    animation: `bounce 1.4s infinite ${i * 0.2}s`,
                    "@keyframes bounce": {
                      "0%, 80%, 100%": { transform: "scale(0)" },
                      "40%": { transform: "scale(1)" },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              color: "#fff",
              textAlign: { xs: "center", md: isRTL ? "right" : "left" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: {
                xs: "center",
                md: isRTL ? "flex-end" : "flex-start",
              },
              zIndex: 2,
              py: { xs: 6, md: 0 },
              px: { xs: 3, md: 8 },
              position: "relative",
              maxWidth: { md: "800px" },
              width: "100%",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: { xs: 4, md: 3 },
                textAlign: "center",
                fontSize: {
                  xs: "2.8rem",
                  sm: "3.5rem",
                  md: "4.5rem",
                  lg: "5rem",
                },
                fontWeight: 800,
                background: `linear-gradient(135deg, #fff 0%, ${theme.palette.secondary.light} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: { xs: 1.2, md: 1.1 },
                letterSpacing: "-0.02em",
                textShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              {safeHeroContent?.title || t("landing.hero.title")}{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 900,
                }}
              >
                {safeHeroContent?.titleHighlight ||
                  t("landing.hero.titleHighlight")}
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 5, md: 6 },
                textAlign: "center",
                fontWeight: 500,
                color: "#ffffff", // light purple
                maxWidth: { xs: "100%", md: "90%" },
                whiteSpace: "pre-line",
                wordBreak: "break-word",
                fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.5rem" },
                lineHeight: { xs: 1.5, md: 1.6 },
                textShadow: "0 2px 4px rgba(183, 0, 255, 0.36)",
                px: { xs: 1, md: 0 },
              }}
            >
              {safeHeroContent?.subtitle || t("landing.hero.subtitle")}
            </Typography>

            {/* Welcome message for logged-in users */}
            {currentUser && (
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  textAlign: "center",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  fontStyle: "italic",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {t("landing.hero.welcomeBack", {
                  name:
                    currentUser.displayName || currentUser.email?.split("@")[0],
                })}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                gap: { xs: 3, sm: 3 },
                justifyContent: "center",
                flexDirection: { xs: "column", sm: "row" },
                width: { xs: "100%", sm: "auto" },
                alignItems: { xs: "stretch", sm: "center" },
                mt: { xs: 4, md: 2 },
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleStartLearning}
                disabled={loading}
                sx={{
                  px: { xs: 4, md: 5 },
                  py: { xs: 2.5, md: 2 },
                  fontSize: { xs: "1.2rem", md: "1.2rem" },
                  borderRadius: { xs: "16px", md: "50px" },
                  fontWeight: 700,
                  background: currentUser
                    ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: {
                    xs: currentUser
                      ? `0 12px 40px rgba(245, 158, 66, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)`
                      : `0 12px 40px rgba(124, 58, 237, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)`,
                    md: currentUser
                      ? `0 8px 32px rgba(245, 158, 66, 0.3)`
                      : `0 8px 32px rgba(124, 58, 237, 0.3)`,
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { xs: "100%", sm: "200px" },
                  height: { xs: "56px", md: "auto" },
                  textTransform: "none",
                  letterSpacing: "0.5px",
                  "&:hover": {
                    transform: {
                      xs: "translateY(-2px) scale(1.01)",
                      md: "translateY(-4px) scale(1.02)",
                    },
                    boxShadow: {
                      xs: currentUser
                        ? `0 16px 48px rgba(245, 158, 66, 0.5), 0 6px 20px rgba(0, 0, 0, 0.3)`
                        : `0 16px 48px rgba(124, 58, 237, 0.5), 0 6px 20px rgba(0, 0, 0, 0.3)`,
                      md: currentUser
                        ? `0 12px 40px rgba(245, 158, 66, 0.4)`
                        : `0 12px 40px rgba(124, 58, 237, 0.4)`,
                    },
                    background: currentUser
                      ? `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  },
                  "&:active": {
                    transform: {
                      xs: "translateY(0px) scale(0.98)",
                      md: "translateY(-2px) scale(1.01)",
                    },
                  },
                }}
              >
                {currentUser && (
                  <SchoolIcon
                    sx={{
                      fontSize: { xs: 28, md: 24 },
                      mr: { xs: 1, md: 1 },
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                    }}
                  />
                )}
                {loading
                  ? t("landing.hero.loading")
                  : currentUser
                  ? t("landing.hero.continueLearning")
                  : tAuth ? tAuth("signIn", "Start Learning") : t("landing.hero.startLearning")}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setOpen(true)}
                sx={{
                  px: { xs: 4, md: 5 },
                  py: { xs: 2.5, md: 2 },
                  fontSize: { xs: "1.2rem", md: "1.2rem" },
                  borderRadius: { xs: "16px", md: "50px" },
                  fontWeight: 700,
                  border: {
                    xs: "3px solid rgba(255, 255, 255, 0.4)",
                    md: "2px solid rgba(255, 255, 255, 0.3)",
                  },
                  color: "#fff",
                  backdropFilter: "blur(20px)",
                  background: {
                    xs: "rgba(255, 255, 255, 0.15)",
                    md: "rgba(255, 255, 255, 0.1)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { xs: "100%", sm: "200px" },
                  height: { xs: "56px", md: "auto" },
                  display: "flex",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  alignItems: "center",
                  gap: { xs: 2, md: 1.5 },
                  textTransform: "none",
                  letterSpacing: "0.5px",
                  justifyContent: "center",
                  boxShadow: {
                    xs: `0 8px 24px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)`,
                    md: "none",
                  },
                  "&:hover": {
                    background: {
                      xs: "rgba(255, 255, 255, 0.25)",
                      md: "rgba(255, 255, 255, 0.2)",
                    },
                    borderColor: {
                      xs: "rgba(255, 255, 255, 0.7)",
                      md: "rgba(255, 255, 255, 0.6)",
                    },
                    transform: {
                      xs: "translateY(-2px) scale(1.01)",
                      md: "translateY(-2px)",
                    },
                    boxShadow: {
                      xs: `0 12px 32px rgba(255, 255, 255, 0.3), 0 6px 16px rgba(0, 0, 0, 0.15)`,
                      md: "0 8px 32px rgba(255, 255, 255, 0.2)",
                    },
                  },
                  "&:active": {
                    transform: {
                      xs: "translateY(0px) scale(0.98)",
                      md: "translateY(-1px)",
                    },
                  },
                }}
              >
                <PlayCircleOutlineIcon
                  sx={{
                    fontSize: { xs: 36, md: 32 },
                    ml: isRTL ? 0 : { xs: 0.5, md: 1 },
                    mr: isRTL ? { xs: 0.5, md: 1 } : 0,
                    transition: "transform 0.3s ease",
                  }}
                />
                {t("landing.hero.watchDemo")}
              </Button>
            </Box>
          </Box>
        )}
      </Fade>
      <VideoModal
        open={open}
        onClose={() => setOpen(false)}
        t={t}
        videoId={safeHeroContent?.demoVideoId}
      />
    </Box>
  );
};

export default HeroSection;
