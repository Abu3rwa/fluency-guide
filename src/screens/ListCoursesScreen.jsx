import React from "react";
import { Box, Typography } from "@mui/material";
import CoursesTable from "../components/CoursesTable";

const ListCoursesScreen = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        All Courses
      </Typography>
      <CoursesTable />
    </Box>
  );
};

export default ListCoursesScreen;
