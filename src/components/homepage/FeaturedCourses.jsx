import React, { useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../common/StyledComponents';
import CourseStatusBadge from '../common/CourseStatusBadge';
import { getCourseStatus, canEnroll, formatDate } from '../../utils/courseStatus';
import { useCourses } from '../../contexts/CourseContext';
import coursePlaceholder from '../../assets/course_placeholder.png';

function FeaturedCourses() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { courses, loading, fetchCourses } = useCourses();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);



  return (
    <Box
      sx={{
        padding: { xs: 5, md: 10 },
        backgroundColor: 'background.default',
        maxWidth: '1200px',
        margin: '0 auto',
        direction: isArabic ? 'rtl' : 'ltr',
      }}
    >
      <Typography
        variant="h2"
        component="h2"
        sx={{
          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: { xs: '2rem', md: '2.5rem' },
          textAlign: 'center',
          mb: 5,
          color: 'text.primary',
        }}
      >
        {t('homepage.courses.title')}
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {loading ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : courses.length === 0 ? (
          <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                color: 'text.secondary',
              }}
            >
              {t('homepage.courses.no_courses')}
            </Typography>
          </Box>
        ) : (
          courses.slice(0, 6).map((course) => {
            const status = getCourseStatus(course);
            const enrollable = canEnroll(status);

            return (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    opacity: status === 'ended' || status === 'cancelled' ? 0.8 : 1,
                    '&:hover': {
                      transform: enrollable ? 'translateY(-8px)' : 'none',
                      boxShadow: enrollable ? '0 12px 32px rgba(212, 165, 116, 0.25)' : 'none',
                      borderColor: enrollable ? 'primary.main' : 'transparent',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: '200px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src={coursePlaceholder}
                      alt={isArabic ? (course.title?.ar || course.title) : (course.title?.en || course.title)}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        '.MuiCard-root:hover &': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(20, 20, 20, 0.9) 0%, rgba(20, 20, 20, 0.5) 60%, transparent 100%)',
                        padding: '24px 16px 16px',
                        display: 'flex',
                        alignItems: 'flex-end',
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{
                          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontSize: '1.25rem',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          lineHeight: 1.3,
                        }}
                      >
                        {isArabic ? (course.title?.ar || course.titleAr || course.title) : (course.title?.en || course.titleEn || course.title)}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, padding: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <CourseStatusBadge status={status} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                        color: 'text.secondary',
                        mb: 1.5,
                      }}
                    >
                      {t('homepage.courses.instructor')}: {course.instructor?.name || (isArabic ? course.instructor?.nameAr : course.instructor?.nameEn)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                        color: 'text.secondary',
                        mb: 1.5,
                      }}
                    >
                      {t('homepage.courses.duration')}: {isArabic ? (course.duration?.ar || course.duration) : (course.duration?.en || course.duration)} {t('common.weeks', { defaultValue: 'weeks' })}
                    </Typography>
                    {course.startDate && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                          color: 'text.secondary',
                          mb: 0.5,
                          fontSize: '0.875rem',
                        }}
                      >
                        {t('homepage.courses.start_date')}: {formatDate(course.startDate, i18n.language)}
                      </Typography>
                    )}
                    {course.endDate && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                        }}
                      >
                        {t('homepage.courses.end_date')}: {formatDate(course.endDate, i18n.language)}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ padding: 3, paddingTop: 0 }}>
                    <PrimaryButton
                      fullWidth
                      disabled={!enrollable}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      sx={{
                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: enrollable ? 'scale(1.02)' : 'none',
                          boxShadow: enrollable ? '0 4px 12px rgba(212, 165, 116, 0.3)' : 'none',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#E5E7EB',
                          color: '#9CA3AF',
                        },
                      }}
                    >
                      {enrollable
                        ? t('homepage.courses.enroll')
                        : (status === 'ended'
                          ? t('homepage.courses.ended')
                          : t('homepage.courses.not_available'))}
                    </PrimaryButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          }))
        }
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 6 }} display='flex' justifyContent="center">
        <Typography
          component="a"
          href="/courses"
          onClick={(e) => { e.preventDefault(); navigate('/courses'); }}
          sx={{
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            color: 'secondary.main',
            textDecoration: 'none',
            fontSize: '1.2rem',
            fontWeight: 600,
            padding: '12px 24px',
            border: '2px solid',
            borderColor: 'secondary.main',
            borderRadius: '5px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            direction: isArabic ? 'rtl' : 'ltr',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'secondary.main',
              color: 'secondary.contrastText',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            },
          }}
        >
          {t('homepage.courses.browse')} {isArabic ? '←' : '→'}
        </Typography>
      </Box>
    </Box >
  );
}

export default FeaturedCourses;

