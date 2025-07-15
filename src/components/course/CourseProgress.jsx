import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  LinearProgress,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCustomTheme } from "../../contexts/ThemeContext";

const CourseProgress = ({
  title = "Course Progress",
  progress = 0,
  total = 1,
}) => {
  const { theme } = useCustomTheme();
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
              },
            }}
          />
        </Box>
        <Typography variant="h6" gutterBottom>
          {percentage}% Complete
        </Typography>
        <Typography color="text.secondary">
          {progress} of {total} lessons completed
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CourseProgress;
