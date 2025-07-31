import React from "react";
import { Box, useTheme } from "@mui/material";
import CenteredLoader from "./CenteredLoader";

/**
 * GlobalLoadingWrapper - A wrapper component that ensures consistent loading states across the app
 * This component can be used to wrap any loading state and ensure it's properly centered
 */
const GlobalLoadingWrapper = ({
  children,
  loading = false,
  loadingType = "spinner",
  loadingMessage = "Loading...",
  fullScreen = false,
  minHeight = "200px",
  sx = {},
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <CenteredLoader
        type={loadingType}
        message={loadingMessage}
        fullScreen={fullScreen}
        minHeight={minHeight}
        sx={sx}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: fullScreen ? "100vh" : minHeight,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default GlobalLoadingWrapper;
