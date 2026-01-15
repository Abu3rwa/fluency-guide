import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import HeroSection from '../components/homepage/HeroSection';
import FeaturesSection from '../components/homepage/FeaturesSection';
import FeaturedCourses from '../components/homepage/FeaturedCourses';
import BlogSection from '../components/homepage/BlogSection';
import SocialProof from '../components/homepage/SocialProof';
import QuickEnrollment from '../components/homepage/QuickEnrollment';

function HomePage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language || 'ar';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f7fa',
      }}
    >

      <Box component="main" sx={{ flexGrow: 1 }}>
        <HeroSection />
        <FeaturesSection />
        <FeaturedCourses />
        <BlogSection />
        <SocialProof />
        <QuickEnrollment />
      </Box>
    </Box>
  );
}

export default HomePage;

