import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  useTheme,
  Fade,
} from "@mui/material";

/**
 * CenteredLoader - A centralized loading component for consistent loading states across the app
 */
const CenteredLoader = ({
  // Loading type
  type = "spinner", // 'spinner', 'skeleton', 'dots'

  // Spinner props
  size = 60,
  thickness = 4,
  color = "primary",

  // Message
  message = "Loading...",
  showMessage = true,

  // Skeleton props
  skeletonCount = 3,
  skeletonHeight = 20,

  // Animation
  fadeIn = true,
  fadeInTimeout = 300,

  // Container props
  fullScreen = false,
  minHeight = "200px",

  // Custom styling
  sx = {},
}) => {
  const theme = useTheme();

  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: fullScreen ? "100vh" : minHeight,
    width: "100%",
    ...sx,
  };

  const renderSpinner = () => (
    <Box sx={{ textAlign: "center" }}>
      <CircularProgress
        size={size}
        thickness={thickness}
        color={color}
        sx={{
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
      {showMessage && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2, fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderSkeleton = () => (
    <Box sx={{ width: "100%", maxWidth: 400 }}>
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={skeletonHeight}
          sx={{
            mb: index < skeletonCount - 1 ? 2 : 0,
            borderRadius: 1,
          }}
        />
      ))}
      {showMessage && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center" }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderDots = () => (
    <Box sx={{ textAlign: "center" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mb: showMessage ? 2 : 0,
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: theme.palette.primary.main,
              animation: `bounce 1.4s ease-in-out infinite both`,
              animationDelay: `${index * 0.16}s`,
              "@keyframes bounce": {
                "0%, 80%, 100%": {
                  transform: "scale(0)",
                },
                "40%": {
                  transform: "scale(1)",
                },
              },
            }}
          />
        ))}
      </Box>
      {showMessage && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderContent = () => {
    switch (type) {
      case "skeleton":
        return renderSkeleton();
      case "dots":
        return renderDots();
      case "spinner":
      default:
        return renderSpinner();
    }
  };

  const content = <Box sx={containerStyles}>{renderContent()}</Box>;

  if (fadeIn) {
    return (
      <Fade in timeout={fadeInTimeout}>
        {content}
      </Fade>
    );
  }

  return content;
};

export default CenteredLoader;
