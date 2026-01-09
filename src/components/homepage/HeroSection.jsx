import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import heroImage from '../../assets/course_placeholder.png';

function HeroSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #00897B 0%, #00695C 50%, #D4A574 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 8, md: 12 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* Text Content */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                color: '#FFFFFF',
                mb: 3,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                lineHeight: 1.2,
              }}
            >
              {t('homepage.hero.title')}
            </Typography>

            <Typography
              variant="h5"
              component="p"
              sx={{
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                color: 'rgba(255,255,255,0.95)',
                mb: 5,
                maxWidth: '600px',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              {t('homepage.hero.subtitle')}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Button
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: '#FFFFFF',
                  color: '#00897B',
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: '#F5F5F5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(255,255,255,0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('homepage.hero.cta_primary')}
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/courses')}
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  border: '2px solid #FFFFFF',
                  borderRadius: 3,
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: '#FFFFFF',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('homepage.hero.cta_secondary')}
              </Button>
            </Box>
          </Box>

          {/* Hero Image Section */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <Box
              component="img"
              src={heroImage}
              alt="Sudanglish Students"
              sx={{
                width: '100%',
                maxWidth: { xs: '350px', md: '500px' },
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.3))',
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                animation: 'fadeIn 1s ease-out, morph 8s ease-in-out infinite alternate',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
                '@keyframes morph': {
                  '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
                  '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
                  '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
                },
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HeroSection;
