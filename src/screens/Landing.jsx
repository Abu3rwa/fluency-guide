import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../contexts/ThemeContext";
import CustomSpinner from "../components/CustomSpinner";
import LandingHeader from "../components/LandingHeader/LandingHeader.jsx";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import ShowcaseTabsSection from "./landing/ShowcaseTabsSection";
import TestimonialsSection from "./landing/TestimonialsSection";
import FAQSection from "./landing/FAQSection";
import ContactSection from "./landing/ContactSection";
import LandingFooter from "./landing/LandingFooter";
// css styles imports
import "./landing/styles/heroSection.css";

const Landing = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CustomSpinner />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      <HeroSection t={t} />
      <FeaturesSection t={t} />
      <ShowcaseTabsSection t={t} />
      <TestimonialsSection t={t} />
      <FAQSection t={t} />
      <ContactSection t={t} />
      <LandingFooter t={t} />
    </Box>
  );
};

export default Landing;
