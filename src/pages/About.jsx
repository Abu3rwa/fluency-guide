import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Container, Avatar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import maleTeamImage from '../assets/male_team.png';

function About() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const stats = [
    { number: '50+', label: isArabic ? 'طالب' : t('about.students'), icon: <GroupsIcon sx={{ fontSize: 40 }} /> },
    { number: '20+', label: isArabic ? 'دورة' : t('about.coursesCount'), icon: <SchoolIcon sx={{ fontSize: 40 }} /> },
    { number: '1', label: isArabic ? 'خبير' : t('about.experts'), icon: <PublicIcon sx={{ fontSize: 40 }} /> },
    { number: '4.9', label: isArabic ? 'تقييم' : t('about.rating'), icon: <EmojiEventsIcon sx={{ fontSize: 40 }} /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        paddingTop: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3, md: 0 },
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: 'text.primary',
              mb: 3,
              background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('about.heroTitle')}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              color: 'text.secondary',
              lineHeight: 1.8,
            }}
          >
            {t('about.heroDescription')}
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <CardContent sx={{ py: 4 }}>
                  <Box sx={{ color: 'secondary.main', mb: 2 }}>{stat.icon}</Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      fontFamily: "'Montserrat', sans-serif",
                      mb: 1,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'text.secondary',
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    }}
                  >
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Mission & Vision */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={maleTeamImage}
              alt="Team collaboration"
              sx={{
                width: '100%',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  color: 'primary.main',
                }}
              >
                {t('about.vision')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                }}
              >
                {t('about.visionDescription')}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  color: 'secondary.main',
                }}
              >
                {t('about.mission')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                }}
              >
                {t('about.missionDescription')}\n              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default About;
