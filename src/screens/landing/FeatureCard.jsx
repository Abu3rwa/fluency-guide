import React from "react";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Box, Typography } from "@mui/material";

// Styled Components
const StyledCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  textAlign: "center",
  transition: "all 0.3s ease-in-out",
  height: "95%",
  position: "relative",
  overflow: "hidden",
  width: "100%", // Ensure full width
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: "opacity 0.3s ease-in-out",
  },
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
    "&::before": {
      opacity: 1,
    },
    "& .feature-icon": {
      transform: "scale(1.1) rotate(5deg)",
      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      "& svg": {
        color: theme.palette.common.white,
      },
    },
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2.5),
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1), // Add bottom margin on mobile
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "64px",
  height: "64px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.background.default,
  marginBottom: theme.spacing(1),
  transition: "all 0.3s ease-in-out",
  // Apply theme icon styling
  ...theme.icon,
  "& svg": {
    fontSize: "32px",
    color: theme.palette.primary.main,
    transition: "all 0.3s ease-in-out",
  },
  [theme.breakpoints.down("sm")]: {
    width: "56px",
    height: "56px",
    "& svg": {
      fontSize: "28px",
    },
  },
}));

const BenefitsList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 1,
  width: "100%",
  marginTop: "auto",
}));

const BenefitItem = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 1,
  "&::before": {
    content: '"•"',
    color: "primary.main",
    fontWeight: "bold",
  },
}));

// Sub-components
const FeatureIcon = ({ icon }) => (
  <IconWrapper className="feature-icon">{icon}</IconWrapper>
);

const FeatureTitle = ({ title }) => (
  <Typography
    variant="h6"
    color="primary"
    sx={{
      fontWeight: 600,
      fontSize: { xs: "1.1rem", md: "1.25rem" },
      mb: 1,
    }}
  >
    {title}
  </Typography>
);

const FeatureDescription = ({ description }) => (
  <Typography
    variant="body1"
    color="text.secondary"
    sx={{
      opacity: 0.9,
      lineHeight: 1.6,
      mb: 2,
      textAlign: "right",
    }}
  >
    {description}
  </Typography>
);

const FeatureBenefits = ({ benefits }) => {
  if (!benefits || benefits.length === 0) return null;

  return (
    <BenefitsList>
      {benefits.map((benefit, index) => (
        <BenefitItem key={index} variant="body2" color="text.primary">
          {benefit}
        </BenefitItem>
      ))}
    </BenefitsList>
  );
};

// Main Component
const FeatureCard = ({ icon, title, description, benefits }) => {
  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <FeatureIcon icon={icon} />
      <FeatureTitle title={title} />
      <FeatureDescription description={description} />
      {/* <FeatureBenefits benefits={benefits} /> */}
    </StyledCard>
  );
};

export default FeatureCard;
