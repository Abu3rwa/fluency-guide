import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Link,
  useTheme,
  useMediaQuery,
  Paper,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import {
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Devices as DevicesIcon,
  Support as SupportIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  GetApp as GetAppIcon,
  Star as StarIcon,
  PhoneAndroid as PhoneIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
  PlayCircle as PlayCircleIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  ExpandMore as ExpandMoreIcon,
  Language as LanguageIcon,
  HeadsetMic as HeadsetMicIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  MenuBook as MenuBookIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Timeline as TimelineIcon,
  Translate as TranslateIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "./landing.css";
import MessageButton from "../components/MessageButton";
import { useTranslation } from "react-i18next";
import LandingHeader from "../components/LandingHeader/LandingHeader.jsx";
import { useTheme as useAppTheme } from "../theme/ThemeContext";
import CustomSpinner from "../components/CustomSpinner";
import contactService from "../services/contactService";

// Styled components
const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
}));

const FeatureCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  textAlign: "center",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    background: alpha(theme.palette.background.paper, 0.9),
  },
}));

const TestimonialCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    background: alpha(theme.palette.background.paper, 0.9),
  },
}));

const BenefitCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    background: alpha(theme.palette.background.paper, 0.9),
  },
}));

const StatBox = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    background: alpha(theme.palette.background.paper, 0.9),
  },
}));

const ContactForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const AppFeatureCard = styled(motion.div)(({ theme }) => ({
  position: "relative",
  borderRadius: "24px",
  overflow: "hidden",
  padding: theme.spacing(4),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  textAlign: "center",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    background: alpha(theme.palette.background.paper, 0.9),
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
}));

const FAQAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: "8px !important",
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  "&:before": {
    display: "none",
  },
  "& .MuiAccordionSummary-root": {
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    },
  },
}));

const Landing = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    // Simulate loading time for content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const faqs = [
    {
      question: t("faq.question1"),
      answer: t("faq.answer1"),
    },
    {
      question: t("faq.question2"),
      answer: t("faq.answer2"),
    },
    {
      question: t("faq.question3"),
      answer: t("faq.answer3"),
    },
    {
      question: t("faq.question4"),
      answer: t("faq.answer4"),
    },
    {
      question: t("faq.question5"),
      answer: t("faq.answer5"),
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactService.submitContactForm(formData);
      setSuccess("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return <CustomSpinner />;
  }

  return (
    <Box
      sx={{
        mt: 0,
        minHeight: "100vh",
        background: `linear-gradient(45deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
          boxShadow: "none",
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: theme.palette.text.primary,
              fontWeight: 700,
            }}
          >
            {t("app.name")}
          </Typography>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {theme.palette.mode === "dark" ? (
              <LightModeIcon />
            ) : (
              <DarkModeIcon />
            )}
          </IconButton>
          <IconButton
            onClick={() =>
              i18n.changeLanguage(i18n.language === "en" ? "ar" : "en")
            }
            color="inherit"
            sx={{
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <TranslateIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}
      <LandingHeader />
      <Box sx={{ mt: 8 }}>
        <MessageButton />

        {/* Hero Section */}
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(
                theme.palette.primary.dark,
                0.97
              )} 0%, ${alpha(theme.palette.secondary.dark, 0.97)} 100%)`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "url('/path-to-your-pattern.svg')",
              opacity: 0.05,
              animation: "moveBackground 20s linear infinite",
            },
          }}
        >
          <Container maxWidth="lg" sx={{ height: "100%", py: 8 }}>
            <Grid
              container
              spacing={4}
              alignItems="center"
              sx={{ height: "100%" }}
            >
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: "2.5rem", md: "4rem" },
                      mb: 2,
                      fontWeight: 800,
                      color: "white",
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    {t("landing.hero.title")}{" "}
                    <span style={{ color: theme.palette.secondary.light }}>
                      {t("landing.hero.titleHighlight")}
                    </span>
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "white",
                      mb: 4,
                      opacity: 0.95,
                      lineHeight: 1.4,
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      fontWeight: 500,
                    }}
                  >
                    {t("landing.hero.subtitle")}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate("/signup")}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        borderRadius: "30px",
                        background: (theme) =>
                          `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.primary.light} 90%)`,
                        color: "white",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                        "&:hover": {
                          background: (theme) =>
                            `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.secondary.light} 90%)`,
                          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {t("landing.hero.startLearning")}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={isRTL ? null : <PlayCircleOutlineIcon />}
                      endIcon={isRTL ? <PlayCircleOutlineIcon /> : null}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        borderRadius: "30px",
                        borderColor: "white",
                        color: "white",
                        borderWidth: 2,
                        backdropFilter: "blur(10px)",
                        "&:hover": {
                          borderColor: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {t("landing.hero.watchDemo")}
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 2,
                    }}
                  >
                    {[
                      {
                        icon: (
                          <PeopleIcon
                            sx={{ fontSize: 40, color: "secondary.light" }}
                          />
                        ),
                        value: "10,000+",
                        label: t("landing.hero.stats.activeLearners"),
                      },
                      {
                        icon: (
                          <EmojiEventsIcon
                            sx={{ fontSize: 40, color: "secondary.light" }}
                          />
                        ),
                        value: "95%",
                        label: t("landing.hero.stats.successRate"),
                      },
                      {
                        icon: (
                          <AccessTimeIcon
                            sx={{ fontSize: 40, color: "secondary.light" }}
                          />
                        ),
                        value: "24/7",
                        label: t("landing.hero.stats.supportAvailable"),
                      },
                      {
                        icon: (
                          <SchoolIcon
                            sx={{ fontSize: 40, color: "secondary.light" }}
                          />
                        ),
                        value: "100+",
                        label: t("landing.hero.stats.interactiveLessons"),
                      },
                    ].map((stat, index) => (
                      <StatBox
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        sx={{
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.15)",
                            transform: "translateY(-5px)",
                          },
                        }}
                      >
                        {stat.icon}
                        <Typography
                          variant="h4"
                          sx={{ fontWeight: 700, color: "white" }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "white", opacity: 0.9 }}
                        >
                          {stat.label}
                        </Typography>
                      </StatBox>
                    ))}
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 12, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GradientText
                variant="h2"
                align="center"
                sx={{ mb: 8, fontSize: { xs: "2rem", md: "3rem" } }}
              >
                {t("landing.features.title")}
              </GradientText>
            </motion.div>
            <Grid container spacing={4}>
              {[
                {
                  icon: (
                    <LanguageIcon
                      sx={{ fontSize: 48, color: theme.palette.primary.main }}
                    />
                  ),
                  title: t("landing.features.items.interactiveLearning.title"),
                  description: t(
                    "landing.features.items.interactiveLearning.description"
                  ),
                },
                {
                  icon: (
                    <HeadsetMicIcon
                      sx={{ fontSize: 48, color: theme.palette.primary.main }}
                    />
                  ),
                  title: t("landing.features.items.speakingPractice.title"),
                  description: t(
                    "landing.features.items.speakingPractice.description"
                  ),
                },
                {
                  icon: (
                    <SpeedIcon
                      sx={{ fontSize: 48, color: theme.palette.primary.main }}
                    />
                  ),
                  title: t("landing.features.items.fastProgress.title"),
                  description: t(
                    "landing.features.items.fastProgress.description"
                  ),
                },
                {
                  icon: (
                    <PsychologyIcon
                      sx={{ fontSize: 48, color: theme.palette.primary.main }}
                    />
                  ),
                  title: t("landing.features.items.smartLearning.title"),
                  description: t(
                    "landing.features.items.smartLearning.description"
                  ),
                },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {feature.icon}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Box
          sx={{
            py: 12,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.95
              )} 0%, ${alpha(theme.palette.secondary.main, 0.95)} 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h2"
                align="center"
                sx={{
                  mb: 8,
                  color: "white",
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                {t("landing.testimonials.title")}
              </Typography>
            </motion.div>
            <Grid container spacing={4}>
              {[
                {
                  name: "Sarah Johnson",
                  role: "Marketing Professional",
                  image: "/path-to-image.jpg",
                  quote:
                    "This platform transformed my English skills. I can now confidently communicate with international clients.",
                  rating: 5,
                },
                {
                  name: "Miguel Rodriguez",
                  role: "Software Engineer",
                  image: "/path-to-image.jpg",
                  quote:
                    "The interactive lessons and speaking practice helped me land my dream job at a global tech company.",
                  rating: 5,
                },
                {
                  name: "Aisha Patel",
                  role: "Medical Student",
                  image: "/path-to-image.jpg",
                  quote:
                    "Perfect for busy professionals. I can study anytime, anywhere, and track my progress easily.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <TestimonialCard
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={testimonial.image}
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: "warning.main" }} />
                      ))}
                    </Box>
                  </TestimonialCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ py: 12, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GradientText
                variant="h2"
                align="center"
                sx={{ mb: 8, fontSize: { xs: "2rem", md: "3rem" } }}
              >
                {t("landing.benefits.title")}
              </GradientText>
            </motion.div>
            <Grid container spacing={4}>
              {[
                {
                  icon: (
                    <EmojiEventsIcon
                      sx={{ fontSize: 40, color: "primary.main" }}
                    />
                  ),
                  title: t("landing.benefits.items.careerGrowth.title"),
                  description: t(
                    "landing.benefits.items.careerGrowth.description"
                  ),
                },
                {
                  icon: (
                    <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
                  ),
                  title: t("landing.benefits.items.globalConnections.title"),
                  description: t(
                    "landing.benefits.items.globalConnections.description"
                  ),
                },
                {
                  icon: (
                    <DevicesIcon sx={{ fontSize: 40, color: "primary.main" }} />
                  ),
                  title: t("landing.benefits.items.digitalAccess.title"),
                  description: t(
                    "landing.benefits.items.digitalAccess.description"
                  ),
                },
                {
                  icon: (
                    <SecurityIcon
                      sx={{ fontSize: 40, color: "primary.main" }}
                    />
                  ),
                  title: t("landing.benefits.items.confidence.title"),
                  description: t(
                    "landing.benefits.items.confidence.description"
                  ),
                },
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <BenefitCard
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {benefit.icon}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        {benefit.description}
                      </Typography>
                    </Box>
                  </BenefitCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ bgcolor: "background.paper", py: 8 }}>
          <Container>
            <Typography variant="h3" component="h2" align="center" gutterBottom>
              {t("faq.title")}
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="textSecondary"
              paragraph
            >
              {t("faq.subtitle")}
            </Typography>
            <Box sx={{ mt: 4 }}>
              {faqs.map((faq, index) => (
                <FAQAccordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{faq.answer}</Typography>
                  </AccordionDetails>
                </FAQAccordion>
              ))}
            </Box>
          </Container>
        </Box>

        {/* App Showcase Section */}
        <Box sx={{ py: 12, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GradientText
                variant="h2"
                align="center"
                sx={{ mb: 8, fontSize: { xs: "2rem", md: "3rem" } }}
              >
                {t("landing.appShowcase.title")}
              </GradientText>
            </motion.div>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    {t("landing.appShowcase.androidTitle")}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                    {t("landing.appShowcase.androidDescription")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<GetAppIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: "30px",
                        background: (theme) =>
                          `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.primary.light} 90%)`,
                        color: "white",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                        "&:hover": {
                          background: (theme) =>
                            `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.secondary.light} 90%)`,
                          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {t("landing.appShowcase.downloadAndroid")}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PhoneIcon />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: "30px",
                        borderColor: "primary.main",
                        color: "primary.main",
                        "&:hover": {
                          borderColor: "primary.dark",
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {t("landing.appShowcase.viewPlayStore")}
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      mt: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: "warning.main" }} />
                      ))}
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t("landing.appShowcase.rating")}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: "relative" }}>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 2,
                        position: "relative",
                      }}
                    >
                      <AppFeatureCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <MenuBookIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {t("landing.appShowcase.features.lessonScreen.title")}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {t(
                            "landing.appShowcase.features.lessonScreen.description"
                          )}
                        </Typography>
                      </AppFeatureCard>
                      <AppFeatureCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <RecordVoiceOverIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {t(
                            "landing.appShowcase.features.speakingPractice.title"
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {t(
                            "landing.appShowcase.features.speakingPractice.description"
                          )}
                        </Typography>
                      </AppFeatureCard>
                      <AppFeatureCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <TimelineIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {t(
                            "landing.appShowcase.features.progressTracking.title"
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {t(
                            "landing.appShowcase.features.progressTracking.description"
                          )}
                        </Typography>
                      </AppFeatureCard>
                      <AppFeatureCard
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <TranslateIcon
                          sx={{ fontSize: 48, color: "primary.main" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {t(
                            "landing.appShowcase.features.vocabularyPractice.title"
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {t(
                            "landing.appShowcase.features.vocabularyPractice.description"
                          )}
                        </Typography>
                      </AppFeatureCard>
                    </Box>
                  </motion.div>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Final CTA Section */}
        <Box sx={{ py: 12, bgcolor: "background.default" }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  textAlign: "center",
                  maxWidth: 800,
                  mx: "auto",
                  p: 6,
                  borderRadius: 4,
                  background: (theme) =>
                    `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography
                  variant="h2"
                  sx={{ mb: 3, fontSize: { xs: "2rem", md: "3rem" } }}
                >
                  {t("landing.cta.title")}
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.8 }}>
                  {t("landing.cta.description")}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/signup")}
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: "1.2rem",
                    borderRadius: "30px",
                    background: (theme) =>
                      `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.primary.light} 90%)`,
                    color: "white",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                    "&:hover": {
                      background: (theme) =>
                        `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.secondary.light} 90%)`,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("landing.cta.button")}
                </Button>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 8,
            px: 2,
            mt: "auto",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
            color: (theme) =>
              theme.palette.mode === "dark" ? "white" : theme.palette.grey[900],
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 3 }}>
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{ height: "40px", marginBottom: "1rem" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {t("landing.footer.description")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <IconButton
                    component="a"
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? "white"
                          : theme.palette.grey[700],
                      "&:hover": {
                        color: (theme) => theme.palette.primary.main,
                      },
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? "white"
                          : theme.palette.grey[700],
                      "&:hover": {
                        color: (theme) => theme.palette.primary.main,
                      },
                    }}
                  >
                    <TwitterIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: (theme) =>
                        theme.palette.mode === "dark"
                          ? "white"
                          : theme.palette.grey[700],
                      "&:hover": {
                        color: (theme) => theme.palette.primary.main,
                      },
                    }}
                  >
                    <InstagramIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography
                  variant="h6"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "white"
                        : theme.palette.grey[900],
                    mb: 2,
                  }}
                >
                  {t("landing.footer.quickLinks")}
                </Typography>
                <List dense>
                  <ListItem>
                    <Link
                      component={RouterLink}
                      to="/courses"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? "text.secondary"
                            : theme.palette.grey[700],
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {t("landing.footer.links.courses")}
                    </Link>
                  </ListItem>
                  <ListItem>
                    <Link
                      component={RouterLink}
                      to="/pricing"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? "text.secondary"
                            : theme.palette.grey[700],
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {t("landing.footer.links.pricing")}
                    </Link>
                  </ListItem>
                  <ListItem>
                    <Link
                      component={RouterLink}
                      to="/about"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? "text.secondary"
                            : theme.palette.grey[700],
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {t("landing.footer.links.about")}
                    </Link>
                  </ListItem>
                  <ListItem>
                    <Link
                      component={RouterLink}
                      to="/contact"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? "text.secondary"
                            : theme.palette.grey[700],
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {t("landing.footer.links.contact")}
                    </Link>
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography
                  variant="h6"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "white"
                        : theme.palette.grey[900],
                    mb: 2,
                  }}
                >
                  {t("landing.footer.contact")}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon
                        sx={{
                          color: (theme) =>
                            theme.palette.mode === "dark"
                              ? "text.secondary"
                              : theme.palette.grey[700],
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("landing.footer.contactEmail")}
                      primaryTypographyProps={{
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? "text.secondary"
                            : theme.palette.grey[700],
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon
                        sx={{
                          color: (theme) =>
                            theme.palette.mode === "dark"
                              ? "text.secondary"
                              : theme.palette.grey[700],
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("landing.footer.contactPhone")}
                      primaryTypographyProps={{
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? "text.secondary"
                            : theme.palette.grey[700],
                      }}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography
                  variant="h6"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "white"
                        : theme.palette.grey[900],
                    mb: 2,
                  }}
                >
                  {t("landing.footer.newsletter")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: (theme) =>
                      theme.palette.mode === "dark"
                        ? "text.secondary"
                        : theme.palette.grey[700],
                  }}
                >
                  {t("landing.footer.newsletterDescription")}
                </Typography>
                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Handle newsletter subscription
                  }}
                  sx={{ display: "flex", gap: 1 }}
                >
                  <TextField
                    size="small"
                    placeholder={t("landing.footer.emailPlaceholder")}
                    sx={{
                      flexGrow: 1,
                      "& .MuiOutlinedInput-root": {
                        color: (theme) =>
                          theme.palette.mode === "dark"
                            ? "white"
                            : theme.palette.grey[900],
                        "& fieldset": {
                          borderColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.23)"
                              : "rgba(0, 0, 0, 0.23)",
                        },
                        "&:hover fieldset": {
                          borderColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.5)"
                              : "rgba(0, 0, 0, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      px: 3,
                      background: (theme) =>
                        `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.primary.light} 90%)`,
                      "&:hover": {
                        background: (theme) =>
                          `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.secondary.light} 90%)`,
                      },
                    }}
                  >
                    {t("landing.footer.subscribe")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Box
              sx={{
                mt: 6,
                pt: 3,
                borderTop: "1px solid",
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(0, 0, 0, 0.12)",
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark"
                      ? "text.secondary"
                      : theme.palette.grey[700],
                }}
              >
                {t("landing.footer.copyright", {
                  year: new Date().getFullYear(),
                })}
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
