import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import CreateCourseForm from "../components/CreateCourseForm";

const CreateCoursePage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Paper
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          Create New Course
        </Typography>
        <CreateCourseForm />
      </Paper>
    </Box>
  );
};

export default CreateCoursePage;
