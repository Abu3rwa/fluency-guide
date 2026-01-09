import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCourses } from '../contexts/CourseContext';

import CourseCard from '../components/common/CourseCard';



function Courses() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { courses, loading, fetchCourses } = useCourses();
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter(course => {
    const courseTitle = typeof course.title === 'object' ? course.title[isArabic ? 'ar' : 'en'] : course.title;
    const courseCategory = typeof course.category === 'object' ? course.category[isArabic ? 'ar' : 'en'] : course.category;
    const courseLevel = typeof course.level === 'object' ? course.level[isArabic ? 'ar' : 'en'] : course.level;

    return (
      (!filterCategory || courseCategory === filterCategory) &&
      (!filterLevel || courseLevel === filterLevel) &&
      (!searchQuery || courseTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Hero Header with Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00897B 0%, #00695C 50%, #D4A574 100%)',
          pt: 6,
          pb: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              color: '#FFFFFF',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            {isArabic ? 'استكشف دوراتنا' : 'Explore Our Courses'}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 400,
              maxWidth: '600px',
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            {isArabic
              ? 'اختر من مجموعة واسعة من الدورات المصممة لتطوير مهاراتك'
              : 'Choose from a wide range of courses designed to enhance your skills'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4, pb: 6, position: 'relative', zIndex: 2 }}>
        {/* Filters */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                placeholder={isArabic ? 'ابحث عن الدورات...' : 'Search courses...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#00897B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00897B',
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel>{isArabic ? 'الفئة' : 'Category'}</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label={isArabic ? 'الفئة' : 'Category'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00897B',
                    },
                  }}
                >
                  <MenuItem value="">{isArabic ? 'جميع الفئات' : 'All Categories'}</MenuItem>
                  <MenuItem value="english">{isArabic ? 'إنجليزي' : 'English'}</MenuItem>
                  <MenuItem value="business">{isArabic ? 'أعمال' : 'Business'}</MenuItem>
                  <MenuItem value="conversational">{isArabic ? 'محادثة' : 'Conversational'}</MenuItem>
                  <MenuItem value="grammar">{isArabic ? 'قواعد' : 'Grammar'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel>{isArabic ? 'المستوى' : 'Level'}</InputLabel>
                <Select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  label={isArabic ? 'المستوى' : 'Level'}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00897B',
                    },
                  }}
                >
                  <MenuItem value="">{isArabic ? 'جميع المستويات' : 'All Levels'}</MenuItem>
                  <MenuItem value="beginner">{isArabic ? 'مبتدئ' : 'Beginner'}</MenuItem>
                  <MenuItem value="intermediate">{isArabic ? 'متوسط' : 'Intermediate'}</MenuItem>
                  <MenuItem value="advanced">{isArabic ? 'متقدم' : 'Advanced'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Courses Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#00897B' }} />
          </Box>
        ) : filteredCourses.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              borderRadius: 3,
              fontSize: '1rem',
            }}
          >
            {isArabic ? 'لا توجد دورات متاحة' : 'No courses available'}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard course={course} isArabic={isArabic} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

    </Box>
  );
}

export default Courses;
