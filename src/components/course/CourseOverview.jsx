import React from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { useCustomTheme } from "../../contexts/ThemeContext";
import {
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from "@mui/icons-material";

const CourseOverview = ({ course }) => {
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (!course) {
    return null;
  }

  const progress = course.progress || 0;
  const enrollmentCount = course.enrollments?.length || 0;
  const completionRate = course.completionRate || 85;

  return (
    <Card 
      sx={{ 
        height: "100%",
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: mode === "dark"
            ? `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
            : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SchoolIcon /> Course Overview
            </Typography>
            
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={`${enrollmentCount} Students`}
                color="primary"
                size="small"
                icon={<PersonIcon />}
                sx={{ borderRadius: 2 }}
              />
              <Chip
                label={`${completionRate}% Success`}
                color="success"
                size="small"
                icon={<TrendingUpIcon />}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Box>
          
          {/* Course Progress */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Course Completion
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: mode === "dark" ? theme.palette.grey[700] : theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: mode === "dark"
                    ? `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
                    : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                }
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}
          >
            Description
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.7,
              color: theme.palette.text.secondary,
              textAlign: 'justify'
            }}
          >
            {course.description || "No description available for this course."}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Course Details Grid */}
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          Course Details
        </Typography>
        
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: mode === "dark" ? theme.palette.grey[700] : theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: mode === "dark" ? theme.palette.grey[600] : theme.palette.action.selected,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Instructor
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {course.instructor || "Not assigned"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: mode === "dark" ? theme.palette.grey[700] : theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: mode === "dark" ? theme.palette.grey[600] : theme.palette.action.selected,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.secondary.main,
                    width: 40,
                    height: 40
                  }}
                >
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {course.duration ? `${course.duration} hours` : "Not specified"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: mode === "dark" ? theme.palette.grey[700] : theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: mode === "dark" ? theme.palette.grey[600] : theme.palette.action.selected,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.success.main,
                    width: 40,
                    height: 40
                  }}
                >
                  <LanguageIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Language
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {course.language || "Not specified"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box 
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: mode === "dark" ? theme.palette.grey[700] : theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: mode === "dark" ? theme.palette.grey[600] : theme.palette.action.selected,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.warning.main,
                    width: 40,
                    height: 40
                  }}
                >
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {course.category || "Not specified"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Stats */}
        {(course.rating || course.totalLessons) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              {course.rating && (
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                      <StarIcon sx={{ color: theme.palette.warning.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {course.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Grid>
              )}
              {course.totalLessons && (
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                      <TimelineIcon sx={{ color: theme.palette.info.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {course.totalLessons}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Lessons
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseOverview;
