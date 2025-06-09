import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import CreateTaskForm from "../components/CreateTaskForm";

const CreateTaskScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, width: "100%" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Create New Task
        </Typography>
        <CreateTaskForm />
      </Paper>
    </Box>
  );
};

export default CreateTaskScreen;
