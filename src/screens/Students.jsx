import React from "react";
import { Box, Typography } from "@mui/material";
import StudentsTable from "../components/StudentsTable";

const Students = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Students
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your students and their course enrollments
      </Typography>
      <StudentsTable />
    </Box>
  );
};

export default Students;
