import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  useTheme,
  alpha,
  Skeleton,
} from "@mui/material";

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  onClick,
  loading = false,
  trend,
  trendValue,
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card
        sx={{
          height: "100%",
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
        }}
        elevation={2}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton variant="circular" width={56} height={56} />
            <Box flex={1}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "none",
          cursor: onClick ? "pointer" : "default",
          boxShadow: onClick ? theme.shadows[8] : theme.shadows[2],
        },
      }}
      onClick={onClick}
      elevation={2}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View ${title} details` : undefined}
      onKeyPress={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: alpha(color || theme.palette.primary.main, 0.1),
              color: color || theme.palette.primary.main,
              width: 56,
              height: 56,
            }}
            aria-hidden="true"
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon, { style: { fontSize: "2rem" } })
              : null}
          </Avatar>
          <Box flex={1}>
            <Typography
              variant="h4"
              component="div"
              fontWeight="bold"
              aria-label={`${title}: ${value}`}
            >
              {value}
            </Typography>
            <Typography variant="body1" color="text.secondary" component="div">
              {title}
            </Typography>
            {trend && (
              <Typography
                variant="caption"
                color={trend === "up" ? "success.main" : "error.main"}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                {trend === "up" ? "↗" : "↘"} {trendValue}
              </Typography>
            )}
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(StatCard);
