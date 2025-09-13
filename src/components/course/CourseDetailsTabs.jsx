import React from "react";
import {
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * CourseDetailsTabs - Tab navigation component for CourseDetailsScreen
 * Manages tab switching and renders appropriate tab content
 */
const CourseDetailsTabs = ({
  activeTab,
  onTabChange,
  theme,
  isMobile,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        sx={{
          mb: { xs: 2, md: 3 },
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          "& .MuiTab-root": {
            color: theme.palette.text.secondary,
            fontSize: { xs: "0.875rem", md: "1rem" },
            minWidth: { xs: "auto", md: 120 },
            "&.Mui-selected": {
              color: theme.palette.primary.main,
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: theme.palette.primary.main,
          },
        }}
        aria-label="Course Details Tabs"
      >
        <Tab label={t("courseDetails.overview")} />
        <Tab label={t("courseDetails.modules")} />
        <Tab label={t("courseDetails.lessons")} />
        <Tab label={t("courseDetails.analytics")} />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {children}
      </Box>
    </>
  );
};

export default CourseDetailsTabs;