import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../contexts/ThemeContext";
import { useRTL } from "../utils/rtlUtils";
import { LandingPageProvider } from "../contexts/LandingPageContext";
import { useMetaTags } from "../hooks/useMetaTags";
import CustomSpinner from "../components/CustomSpinner";

// Temporarily disable lazy loading to debug webpack issue
import HeroSection from "./landing/HeroSection";
import StatisticsBanner from "./landing/StatisticsBanner";
import FeaturesSection from "./landing/FeaturesSection";
import CoursesSection from "./landing/components/CoursesSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import ContactSection from "./landing/ContactSection";
import BlogSection from "./landing/BlogSection"; // Import the new BlogSection

// Loading fallback component
const SectionLoader = ({ message = "Loading..." }) => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
    <CustomSpinner 
      message={message} 
      size={40} 
      showMessage={false} 
      overlay={false} 
    />
  </Box>
);

function Landing() {
  const navigate = useNavigate();
  // Use multiple namespaces for different landing page sections
  const { t } = useTranslation(); // Default namespace for common translations
  const { t: tAuth } = useTranslation('auth'); // Auth namespace for authentication related content
  const { t: tCourses } = useTranslation('courses'); // Courses namespace for course related content
  const { i18n } = useTranslation();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const isRTL = useRTL();
  
  // Update meta tags for landing page
  useMetaTags();

  return (
    <LandingPageProvider>
      <Box 
        sx={{ 
          width: "100%", 
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        {/* Hero Section - Auth related (login/signup buttons) */}
        <HeroSection
          isRTL={isRTL}
          t={t}
          tAuth={tAuth}
          navigate={navigate}
          theme={theme}
        />

        {/* Statistics Banner */}
        {/* <StatisticsBanner t={t} /> */}

        {/* Features Section */}
        <FeaturesSection t={t} isRTL={isRTL} />

        {/* Courses Section */}
        <CoursesSection />

        {/* Blog Section - Show latest blog posts */}
        <BlogSection />

        {/* Testimonials Section */}
        {/* <TestimonialsSection t={t} isRTL={isRTL} /> */}

        {/* Contact Section */}
        <ContactSection t={t} isRTL={isRTL} />
      </Box>
    </LandingPageProvider>
  );
}

export default Landing;