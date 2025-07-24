 import React, { useState } from "react";
import { Tabs, Tab, Box, Paper } from "@mui/material";

const UnifiedDashboardTabs = ({ tabs = [], initialTab = 0, sx = {} }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Paper
      sx={{
        width: "100%",
        mb: 3,
        borderRadius: 2,
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
            fontWeight: 500,
            fontSize: "1rem",
            py: 2,
            px: 3,
            minHeight: 64,
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
