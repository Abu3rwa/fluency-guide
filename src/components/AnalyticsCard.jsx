import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const AnalyticsCard = ({ title, value, icon, color = "primary.main" }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {t(`courses.analytics.${title}`)}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
