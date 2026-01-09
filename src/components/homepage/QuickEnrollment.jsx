import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../common/StyledComponents';

function QuickEnrollment() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <Box
      sx={{
        padding: { xs: 6, md: 10 },
        background: 'linear-gradient(135deg, #D4A574 0%, #F4C430 50%, #B8860B 100%)',
        color: 'primary.contrastText',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Typography
        variant="h3"
        component="h2"
        sx={{
          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: { xs: '2rem', md: '3rem' },
          mb: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {t('homepage.enrollment.title')}
      </Typography>

      <Typography
        variant="h6"
        sx={{
          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
          mb: 5,
          opacity: 0.95,
          fontSize: { xs: '1rem', md: '1.25rem' },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {t('homepage.enrollment.subtitle')}
      </Typography>

      <PrimaryButton
        size="large"
        sx={{
          fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
          backgroundColor: 'secondary.main',
          color: 'secondary.contrastText',
          padding: '18px 40px',
          fontSize: '18px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'secondary.main',
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.5)',
          },
        }}
      >
        {t('homepage.enrollment.cta')}
      </PrimaryButton>
    </Box>
  );
}

export default QuickEnrollment;

