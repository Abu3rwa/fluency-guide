import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import heroImage from '../../assets/course_placeholder.png';

function HeroSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';

  // Stats data
  const stats = [
    { icon: <GroupsRoundedIcon />, value: '500+', label: isArabic ? 'طالب' : 'Students' },
    { icon: <SchoolRoundedIcon />, value: '20+', label: isArabic ? 'دورة' : 'Courses' },
    { icon: <StarRoundedIcon />, value: '4.9', label: isArabic ? 'تقييم' : 'Rating' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 'auto', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #004D40 0%, #00695C 30%, #00897B 60%, #26A69A 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(212, 165, 116, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 40% 40%, rgba(0, 150, 136, 0.2) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Floating Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: { xs: 60, md: 100 },
          height: { xs: 60, md: 100 },
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(10deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: { xs: 80, md: 140 },
          height: { xs: 80, md: 140 },
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'rgba(212, 165, 116, 0.15)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          width: { xs: 40, md: 60 },
          height: { xs: 40, md: 60 },
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          animation: 'float 5s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          left: '15%',
          width: { xs: 30, md: 50 },
          height: { xs: 30, md: 50 },
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)',
          animation: 'float 7s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 0 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: isArabic ? 'row-reverse' : 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 6, md: 8 },
          }}
        >
          {/* Text Content */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: isArabic ? 'flex-end' : 'flex-start' },
              textAlign: { xs: 'center', md: isArabic ? 'right' : 'left' },
              animation: 'slideIn 0.8s ease-out',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateX(-30px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50px',
                px: 2.5,
                py: 1,
                mb: 3,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#4CAF50',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.7, transform: 'scale(1.2)' },
                  },
                }}
              />
              <Typography
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.5px',
                }}
              >
                {isArabic ? '🎓 التعلم أصبح سهلاً' : '🎓 Learning Made Easy'}
              </Typography>
            </Box>

            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                color: '#FFFFFF',
                mb: 3,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 30px rgba(0,0,0,0.2)',
              }}
            >
              {t('homepage.hero.title')}
            </Typography>

            <Typography
              variant="h5"
              component="p"
              sx={{
                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'rgba(255,255,255,0.9)',
                mb: 4,
                maxWidth: '550px',
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              {t('homepage.hero.subtitle')}
            </Typography>

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 5, width: { xs: '100%', sm: 'auto' } }}
            >
              <Button
                size="large"
                onClick={() => navigate('/register')}
                startIcon={!isArabic && <PlayArrowRoundedIcon />}
                endIcon={isArabic && <PlayArrowRoundedIcon />}
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  padding: '14px 32px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                  color: '#00695C',
                  borderRadius: '12px',
                  textTransform: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {t('homepage.hero.cta_primary')}
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/courses')}
                sx={{
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  padding: '14px 32px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.8)',
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {t('homepage.hero.cta_secondary')}
              </Button>
            </Stack>

            {/* Stats */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 3, md: 5 },
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: isArabic ? 'flex-end' : 'flex-start' },
              }}
            >
              {stats.map((stat, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    animation: 'fadeUp 0.6s ease-out',
                    animationDelay: `${0.2 + index * 0.1}s`,
                    animationFillMode: 'both',
                    '@keyframes fadeUp': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                      '& svg': { fontSize: '1.3rem' },
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        color: '#FFFFFF',
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.7)',
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
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
              animation: 'slideInRight 0.8s ease-out',
              animationDelay: '0.2s',
              animationFillMode: 'both',
              '@keyframes slideInRight': {
                from: { opacity: 0, transform: 'translateX(30px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            {/* Glassmorphism Card */}
            <Box
              sx={{
                position: 'relative',
                padding: { xs: 2, md: 3 },
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(212,165,116,0.3) 100%)',
                  borderRadius: '26px',
                  zIndex: -1,
                },
              }}
            >
              <Box
                component="img"
                src={heroImage}
                alt="Sudanglish Students Learning"
                sx={{
                  width: '100%',
                  maxWidth: { xs: '280px', sm: '350px', md: '420px' },
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  display: 'block',
                }}
              />

              {/* Floating Badge on Image */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: -10, md: -15 },
                  left: { xs: '50%', md: -20 },
                  transform: { xs: 'translateX(-50%)', md: 'none' },
                  background: 'linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  boxShadow: '0 10px 30px rgba(212,165,116,0.4)',
                  animation: 'bounce 3s ease-in-out infinite',
                  '@keyframes bounce': {
                    '0%, 100%': { transform: 'translateX(-50%) translateY(0)', md: { transform: 'translateY(0)' } },
                    '50%': { transform: 'translateX(-50%) translateY(-5px)', md: { transform: 'translateY(-5px)' } },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarRoundedIcon sx={{ color: '#FFFFFF', fontSize: '1.3rem' }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#FFFFFF',
                      lineHeight: 1.2,
                    }}
                  >
                    {isArabic ? 'موثوق' : 'Trusted'}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {isArabic ? 'بواسطة المئات' : 'by hundreds'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HeroSection;
