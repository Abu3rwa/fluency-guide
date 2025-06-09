import React from "react";
import { Box, Typography } from "@mui/material";
import TasksTable from "../components/TasksTable";

const TasksScreen = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        All Tasks
      </Typography>
      <TasksTable />
    </Box>
  );
};

export default TasksScreen;
