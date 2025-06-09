import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./bootstrap.min.css";
import React from "react";
import "./App.css";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MainLayout from "./components/Layout/MainLayout";
import ListCoursesScreen from "./screen/ListCoursesScreen";
import CourseDetailsScreen from "./screen/CourseDetailsScreen";
import CreateCoursePage from "./screen/CreateCoursePage";
import Dashboard from "./screen/Dashboard";
import LoginScreen from "./screen/LoginScreen";
import LessonDetailsScreen from "./screen/LessonDetailsScreen";
import { Box, Typography } from "@mui/material";
import TasksScreen from "./screen/TasksScreen";
import CreateTaskScreen from "./screen/CreateTaskScreen";
import Landing from "./screen/Landing";
const isAdmin = false;
// Create a theme instance

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        {/* <MainLayout> */}
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/courses/create" element={<CreateCoursePage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/courses/all" element={<ListCoursesScreen />} />
          <Route path="/courses/:id" element={<CourseDetailsScreen />} />
          <Route path="/lessons/:id" element={<LessonDetailsScreen />} />
          <Route path="/tasks" element={<TasksScreen />} />
          <Route path="/tasks/create" element={<CreateTaskScreen />} />
          <Route
            path="*"
            element={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "60vh",
                }}
              >
                <Typography variant="h4">Page Not Found</Typography>
              </Box>
            }
          />
        </Routes>
        {/* </MainLayout> */}
      </Router>
    </>
  );
}

export default App;
