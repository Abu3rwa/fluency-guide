import React, { useState } from "react";
import { Tabs, Tab, Box, Paper, useTheme } from "@mui/material";

const UnifiedDashboardTabs = ({ tabs = [], initialTab = 0, sx = {} }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const theme = useTheme();

  return (
    <Paper
      sx={{
        width: "100%",
        mb: theme.spacing(3),
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
        boxShadow: 2,
        ...sx,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: theme.typography.fontWeightMedium,
            fontSize: theme.typography.body1.fontSize,
            py: theme.spacing(2),
            px: theme.spacing(3),
            minHeight: theme.spacing(8),
            fontFamily: theme.typography.body1.fontFamily,
          },
          "& .MuiTabs-indicator": {
            height: 3,
          },
        }}
      >
        {tabs.map((tab, idx) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>
      <Box sx={{ minHeight: "60vh" }}>{tabs[activeTab]?.content}</Box>
    </Paper>
  );
};

export default UnifiedDashboardTabs;
