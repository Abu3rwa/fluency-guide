import React from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import EnrollmentsTable from "../components/EnrollmentsTable";
import PendingEnrollments from "../components/PendingEnrollments";

const Enrollments = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Enrollments
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage student enrollments in courses, track progress, and handle status
        updates.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Enrollments" />
          <Tab label="Pending Requests" />
        </Tabs>
      </Box>

      {activeTab === 0 ? <EnrollmentsTable /> : <PendingEnrollments />}
    </Box>
  );
};

export default Enrollments;
