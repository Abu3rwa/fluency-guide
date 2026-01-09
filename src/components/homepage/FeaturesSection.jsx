import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Custom branded icons
import iconLiveSessions from '../../assets/icons/icon_live_sessions.png';
import iconProfile from '../../assets/icons/icon_profile.png';
import iconCourses from '../../assets/icons/icon_courses.png';
import iconBlog from '../../assets/icons/icon_blog.png';
import iconSupport from '../../assets/icons/icon_support.png';
import iconAssignments from '../../assets/icons/icon_assignments.png';

function FeaturesSection() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const features = [
    {
      key: 'live_sessions',
      icon: iconLiveSessions,
    },
    {
      key: 'expert_instructors',
      icon: iconProfile,
    },
    {
      key: 'esp_courses',
      icon: iconCourses,
    },
    {
      key: 'pdf_guides',
      icon: iconBlog,
    },
    {
      key: 'discussion_forums',
      icon: iconSupport,
    },
    {
      key: 'assignments',
      icon: iconAssignments,
    },
  ];

  return (
    <Box
      sx={{
        padding: { xs: 4, md: 8 },
        backgroundColor: '#f5f7fa',
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
        {t('homepage.features.title')}
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {features.map((feature) => (
          <Grid item xs={6} sm={4} md={2} key={feature.key}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                backgroundColor: '#fff',
                textAlign: 'center',
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1, md: 2 }, '&:last-child': { pb: { xs: 1, md: 2 } } }}>
                <Box sx={{ mb: { xs: 1.5, md: 2 }, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    component="img"
                    src={feature.icon}
                    backgroundColor="default"
                    alt=""
                    sx={{
                      width: { xs: 58, sm: 66, md: 74 },
                      height: { xs: 58, sm: 66, md: 74 },
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                <Typography
                  variant="subtitle1"
                  component="h5"
                  sx={{
                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    // fontWeight: 600,
                    mb: 0.5,
                    color: 'text.primary',
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                    lineHeight: 1.3,
                  }}
                >
                  {t(`homepage.features.items.${feature.key}.title`)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    color: 'text.secondary',
                    lineHeight: 1.5,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {t(`homepage.features.items.${feature.key}.description`)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default FeaturesSection;

