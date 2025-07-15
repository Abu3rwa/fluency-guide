import React from 'react';
import { Card, Tabs, Tab } from '@mui/material';

const ResourceTabs = ({ activeTab, handleTabChange, resourceDefs, t }) => (
  <Card
    sx={{
      mb: 3,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: (theme) => theme.shadows[2],
    }}
  >
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      sx={{
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          py: 2,
          px: 3,
          minHeight: 64,
        },
        '& .MuiTabs-indicator': {
          height: 3,
        },
      }}
      aria-label={t('management.tabs.label')}
    >
      {Object.values(resourceDefs).map((def) => (
        <Tab key={def.plural} label={def.plural} />
      ))}
    </Tabs>
  </Card>
);

export default ResourceTabs;
