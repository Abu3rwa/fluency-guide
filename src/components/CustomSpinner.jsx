import { Box, CircularProgress, Typography, useTheme } from "@mui/material";

const CustomSpinner = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
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
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 500,
          mt: 2,
        }}
      >
        Loading...
      </Typography>
    </Box>
  );
};

export default CustomSpinner;
