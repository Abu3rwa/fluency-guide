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
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  Person as PersonIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "./landingPage.css";

// Styled components
const WaveBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  overflow: "hidden",
  lineHeight: 0,
  transform: "rotate(180deg)",
  "& svg": {
    position: "relative",
    display: "block",
    width: "calc(100% + 1.3px)",
    height: "150px",
  },
  "& .shape-fill": {
    fill: theme.palette.primary.main,
  },
}));

const AnimatedCard = styled(motion.div)(({ theme }) => ({
  height: "100%",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease-in-out",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  },
}));

const ContactForm = styled(Box)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  "&::before": {
    content: '""',
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    filter: "blur(80px)",
    zIndex: -1,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    filter: "blur(80px)",
    zIndex: -1,
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}));

const FloatingBadge = styled(motion.div)(({ theme }) => ({
  position: "absolute",
  padding: theme.spacing(1, 2),
  borderRadius: "30px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}));

const Header = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: "rgba(26, 35, 126, 0.95)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease-in-out",
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: "white",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 500,
  padding: theme.spacing(1, 2),
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}));

// Styled components for better section organization
const Section = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: { xs: "2rem", md: "2.5rem" },
  fontWeight: 700,
  textAlign: "center",
  marginBottom: theme.spacing(4),
  background: "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -theme.spacing(2),
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "4px",
    background: "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
    borderRadius: "2px",
  },
}));

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Add scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <>
      {/* Header */}
      <Header
        sx={{
          background: scrolled
            ? "rgba(26, 35, 126, 0.98)"
            : "rgba(26, 35, 126, 0.95)",
          boxShadow: scrolled ? "0 2px 20px rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            width: "100%",
            maxWidth: "100% !important",
            m: 0,
            p: { xs: 1, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: { xs: 60, sm: 70 },
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <SchoolIcon
                sx={{ fontSize: { xs: 28, sm: 32 }, color: "#FFD700" }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                ReapEnglish
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              <NavButton onClick={() => navigate("/courses/all")}>
                Courses
              </NavButton>
              <NavButton onClick={() => navigate("/about")}>About</NavButton>
              <NavButton onClick={() => navigate("/contact")}>
                Contact
              </NavButton>
            </Box>

            {/* Desktop Auth Buttons */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<LoginIcon />}
                onClick={() => navigate("/login")}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonIcon />}
                onClick={() => navigate("/signup")}
                sx={{
                  background:
                    "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #008080 30%, #1a237e 90%)",
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ display: { md: "none" } }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          <Box
            sx={{
              display: { xs: mobileMenuOpen ? "flex" : "none", md: "none" },
              flexDirection: "column",
              gap: 1,
              py: 2,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <NavButton
              fullWidth
              onClick={() => {
                navigate("/courses/all");
                setMobileMenuOpen(false);
              }}
            >
              Courses
            </NavButton>
            <NavButton
              fullWidth
              onClick={() => {
                navigate("/about");
                setMobileMenuOpen(false);
              }}
            >
              About
            </NavButton>
            <NavButton
              fullWidth
              onClick={() => {
                navigate("/contact");
                setMobileMenuOpen(false);
              }}
            >
              Contact
            </NavButton>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PersonIcon />}
                onClick={() => {
                  navigate("/signup");
                  setMobileMenuOpen(false);
                }}
                sx={{
                  background:
                    "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #008080 30%, #1a237e 90%)",
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </Container>
      </Header>

      {/* Spacing for fixed header */}
      <Box sx={{ height: { xs: 60, sm: 70 } }} />

      {/* Hero Section */}
      <Section
        sx={{
          minHeight: "calc(100vh - 70px)",
          background: "linear-gradient(135deg, #1a237e 0%, #008080 100%)",
          display: "flex",
          alignItems: "center",
          pt: { xs: 4, sm: 6, md: 8 },
          pb: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                    fontWeight: 800,
                    color: "white",
                    mb: 2,
                    lineHeight: 1.2,
                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  Master English with{" "}
                  <Box
                    component="span"
                    sx={{
                      background:
                        "linear-gradient(45deg, #FFD700 30%, #FFA500 90%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "inline-block",
                    }}
                  >
                    Confidence
                  </Box>
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    mb: 4,
                    fontSize: { xs: "1.1rem", sm: "1.3rem" },
                    maxWidth: "600px",
                  }}
                >
                  Join thousands of successful students who have transformed
                  their English skills with our expert-led courses
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
                    onClick={() => navigate("/courses/all")}
                    sx={{
                      background:
                        "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #008080 30%, #1a237e 90%)",
                      },
                    }}
                  >
                    Explore Courses
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayCircleOutlineIcon />}
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Watch Demo
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6} sm={12}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Grid container spacing={3}>
                  {/* Left Column */}
                  <Grid item xs={12} sm={4} md={12}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 2,
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            textAlign: "center",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PeopleIcon sx={{ fontSize: 40, color: "#FFD700" }} />
                          <Typography
                            variant="h4"
                            sx={{
                              color: "white",
                              fontWeight: 700,
                              mt: 1,
                              mb: 0.5,
                            }}
                          >
                            10,000+
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                          >
                            Active Students
                          </Typography>
                        </Box>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 2,
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            textAlign: "center",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: 40, color: "#FFD700" }} />
                          <Typography
                            variant="h4"
                            sx={{
                              color: "white",
                              fontWeight: 700,
                              mt: 1,
                              mb: 0.5,
                            }}
                          >
                            50+
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                          >
                            Expert Teachers
                          </Typography>
                        </Box>
                      </motion.div>
                    </Box>
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} sm={4} md={12}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 2,
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            textAlign: "center",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <EmojiEventsIcon
                            sx={{ fontSize: 40, color: "#FFD700" }}
                          />
                          <Typography
                            variant="h4"
                            sx={{
                              color: "white",
                              fontWeight: 700,
                              mt: 1,
                              mb: 0.5,
                            }}
                          >
                            95%
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                          >
                            Success Rate
                          </Typography>
                        </Box>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 2,
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            textAlign: "center",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 40, color: "#FFD700" }}
                          />
                          <Typography
                            variant="h4"
                            sx={{
                              color: "white",
                              fontWeight: 700,
                              mt: 1,
                              mb: 0.5,
                            }}
                          >
                            24/7
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                          >
                            Support Available
                          </Typography>
                        </Box>
                      </motion.div>
                    </Box>
                  </Grid>
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* Features Section */}
      <Section
        sx={{
          py: { xs: 8, md: 12 },
          background: "#f8f9fa",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <SectionTitle>Why Choose Us</SectionTitle>
          <Grid container spacing={4}>
            {[
              {
                icon: <SchoolIcon sx={{ fontSize: 40, color: "#1a237e" }} />,
                title: "Expert Teachers",
                description:
                  "Learn from certified English teachers with years of experience",
              },
              {
                icon: <PeopleIcon sx={{ fontSize: 40, color: "#1a237e" }} />,
                title: "Interactive Learning",
                description:
                  "Engage in live sessions and practice with fellow students",
              },
              {
                icon: (
                  <EmojiEventsIcon sx={{ fontSize: 40, color: "#1a237e" }} />
                ),
                title: "Proven Results",
                description:
                  "Join thousands of successful students who achieved their goals",
              },
              {
                icon: (
                  <AccessTimeIcon sx={{ fontSize: 40, color: "#1a237e" }} />
                ),
                title: "Flexible Schedule",
                description:
                  "Learn at your own pace with 24/7 access to course materials",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      background: "white",
                      borderRadius: 2,
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-5px)",
                      },
                    }}
                  >
                    {feature.icon}
                    <Typography
                      variant="h6"
                      sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary" }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Contact Section */}
      <Section
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(135deg, #1a237e 0%, #008080 100%)",
          color: "white",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <SectionTitle
            sx={{ color: "white", "&::after": { background: "white" } }}
          >
            Get in Touch
          </SectionTitle>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Start Your English Learning Journey Today
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                Have questions about our courses or need help choosing the right
                program? Our team is here to help you achieve your language
                goals.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PhoneIcon />}
                  sx={{
                    background: "white",
                    color: "#1a237e",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                >
                  Call Us
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EmailIcon />}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      background: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Email Us
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <ContactForm>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={<SendIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontSize: "1.1rem",
                        borderRadius: "30px",
                        background:
                          "linear-gradient(45deg, #1a237e 30%, #008080 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #008080 30%, #1a237e 90%)",
                        },
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </ContactForm>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          background: "#1a237e",
          color: "white",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <SchoolIcon sx={{ fontSize: 32, color: "#FFD700" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ReapEnglish
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Empowering students worldwide to achieve their language goals
                through innovative and effective English learning programs.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
                  }}
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { background: "rgba(255, 255, 255, 0.1)" },
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {["Courses", "About", "Contact", "Blog"].map((link) => (
                  <Link
                    key={link}
                    component={RouterLink}
                    to={`/${link.toLowerCase()}`}
                    sx={{
                      color: "white",
                      opacity: 0.8,
                      textDecoration: "none",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Contact Info
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon sx={{ opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    123 Education St, Learning City
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon sx={{ opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon sx={{ opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    info@reapenglish.com
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Newsletter
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                Subscribe to our newsletter for updates and special offers.
              </Typography>
              <Box
                component="form"
                sx={{
                  display: "flex",
                  gap: 1,
                }}
              >
                <TextField
                  size="small"
                  placeholder="Enter your email"
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    background: "white",
                    color: "#1a237e",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 6,
              pt: 3,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © {new Date().getFullYear()} ReapEnglish. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Landing;
