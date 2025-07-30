import React from "react";
import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import { TrendingUp as TrendingUpIcon } from "@mui/icons-material";

const StatCard = ({
  title,
  value,
  change,
  changeType = "positive",
  icon,
  iconColor,
  iconBgColor,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[1],
        border: `1px solid ${theme.palette.grey[100]}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="body2"
              fontWeight="500"
              sx={{
                color: theme.palette.grey[600],
                mb: 0.5,
                fontSize: "0.875rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              component="p"
              fontWeight="bold"
              sx={{
                color: theme.palette.grey[900],
                mb: 0.5,
                fontSize: { xs: "1.75rem", md: "2rem" },
              }}
            >
              {value}
            </Typography>
            <Box display="flex" alignItems="center">
              <TrendingUpIcon
                sx={{
                  fontSize: 16,
                  color:
                    changeType === "positive"
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  mr: 0.5,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color:
                    changeType === "positive"
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  fontSize: "0.875rem",
                }}
              >
                {change}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor:
                iconBgColor || theme.palette.primary.light + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                color: iconColor || theme.palette.primary.main,
                "& svg": {
                  fontSize: 24,
                },
              }}
            >
              {icon}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
