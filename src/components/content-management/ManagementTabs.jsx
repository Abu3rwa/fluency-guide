import React from "react";
import {
  Card,
  Tabs,
  Tab,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const ManagementTabs = ({ activeTab, setActiveTab, resourceDefs }) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
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
        aria-label={t("management.tabs.label")}
      >
        {Object.values(resourceDefs).map((def) => (
          <Tab key={def.plural} label={def.plural} />
        ))}
      </Tabs>
    </Card>
  );
};

export default ManagementTabs;
