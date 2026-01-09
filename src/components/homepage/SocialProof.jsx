import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';

function SocialProof() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const stats = [
    {
      key: 'students',
      value: '5000+',
      icon: <PeopleIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    },
    {
      key: 'courses',
      value: '50+',
      icon: <MenuBookIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    },
    {
      key: 'instructors',
      value: '20+',
      icon: <SchoolIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
    },
  ];

  return (
    <Box
      sx={{
        padding: { xs: 5, md: 10 },
        backgroundColor: 'background.paper',
      }}
    >
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.key}>
            <Box
              sx={{
                textAlign: 'center',
                padding: 4,
                backgroundColor: 'background.default',
                borderRadius: '12px',
                border: '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(212, 165, 116, 0.15)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>{stat.icon}</Box>
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #D4A574 0%, #F4C430 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {t(`homepage.stats.${stat.key}`)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          textAlign: 'center',
          padding: { xs: 4, md: 6 },
          backgroundColor: 'background.default',
          borderRadius: '16px',
          border: '2px solid',
          borderColor: 'primary.main',
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          '&::before': {
            content: '"\\201C"',
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '80px',
            color: 'primary.main',
            fontFamily: 'serif',
            lineHeight: 1,
          },
        }}
      >
        <Typography
          variant="h4"
          component="h3"
          sx={{
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            fontWeight: 600,
            mb: 2,
            color: 'text.primary',
          }}
        >
          {t('homepage.testimonials.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            color: 'text.secondary',
            fontStyle: 'italic',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.8,
          }}
        >
          {isArabic
            ? '"سودانجليزي ساعدني في تحسين مستواي في اللغة الإنجليزية بشكل كبير. المدرسون محترفون والدروس تفاعلية."'
            : '"Sudanglish helped me improve my English significantly. The instructors are professional and the lessons are interactive."'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
            color: 'text.secondary',
            mt: 2,
          }}
        >
          {isArabic ? '- طالب سعيد' : '- Happy Student'}
        </Typography>
      </Box>
    </Box>
  );
}

export default SocialProof;

