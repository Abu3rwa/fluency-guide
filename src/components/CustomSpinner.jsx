import { Box, CircularProgress, Typography, useTheme } from "@mui/material";

const CustomSpinner = ({
  message = "Please Wait!",
  size = 60,
  thickness = 4,
  showMessage = true,
  overlay = true,
  position = "center", // center, top-left, top-right, custom
}) => {
  const theme = useTheme();

  const positionStyles = {
    center: {
      position: overlay ? "fixed" : "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    "top-left": {
      position: "absolute",
      top: 16,
      left: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    "top-right": {
      position: "absolute",
      top: 16,
      right: 16,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    custom: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  const overlayStyles = overlay
    ? {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }
    : {};

  return (
    <Box
      sx={{
        ...positionStyles[position],
        ...overlayStyles,
      }}
    >
      <CircularProgress
        size={size}
        thickness={thickness}
        sx={{
          color: theme.palette.primary.main,
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": {
              transform: "rotate(0deg)",
            },
            "100%": {
              transform: "rotate(360deg)",
            },
          },
          mb: showMessage ? 2 : 0,
        }}
      />
      {showMessage && (
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
            mt: 2,
            textAlign: "center",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default CustomSpinner;
