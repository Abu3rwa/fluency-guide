import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import {
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";

const CourseOverview = ({ course }) => {
  if (!course) {
    return null;
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Overview
        </Typography>
        <Typography variant="body1" paragraph>
          {course.description}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="primary" />
              <Typography variant="body2">
                Instructor: {course.instructor}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon color="primary" />
              <Typography variant="body2">
                Duration: {course.duration} hours
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <LanguageIcon color="primary" />
              <Typography variant="body2">
                Language: {course.language}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <CategoryIcon color="primary" />
              <Typography variant="body2">
                Category: {course.category}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CourseOverview;
