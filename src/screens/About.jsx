import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import {
  School as SchoolIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useTheme } from "../theme/ThemeContext";

const FeatureCard = ({ icon, title, description }) => {
  const { theme } = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        height: "100%",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
        },
      }}
    >
      <CardContent sx={{ textAlign: "center", p: 4 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            backgroundColor: theme.palette.primary.main,
          }}
        >
          {icon}
        </Avatar>
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const TeamMember = ({ name, role, image }) => {
  const { theme } = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        height: "100%",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
        },
      }}
    >
      <CardContent sx={{ textAlign: "center", p: 3 }}>
        <Avatar
          src={image}
          sx={{
            width: 120,
            height: 120,
            margin: "0 auto 16px",
            border: `4px solid ${theme.palette.primary.main}`,
          }}
        />
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          {role}
        </Typography>
      </CardContent>
    </Card>
  );
};

const About = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: <SchoolIcon />,
      title: "Quality Education",
      description:
        "Our courses are designed by industry experts to provide the highest quality education and practical skills.",
    },
    {
      icon: <PeopleIcon />,
      title: "Expert Instructors",
      description:
        "Learn from experienced professionals who are passionate about teaching and sharing their knowledge.",
    },
    {
      icon: <EmojiEventsIcon />,
      title: "Career Growth",
      description:
        "Get the skills and certifications you need to advance your career and achieve your professional goals.",
    },
    {
      icon: <SecurityIcon />,
      title: "Secure Learning",
      description:
        "Your learning journey is protected with state-of-the-art security and privacy measures.",
    },
  ];

  const team = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      image: "https://i.pravatar.cc/300?img=1",
    },
    {
      name: "Jane Smith",
      role: "Head of Education",
      image: "https://i.pravatar.cc/300?img=2",
    },
    {
      name: "Mike Johnson",
      role: "Lead Instructor",
      image: "https://i.pravatar.cc/300?img=3",
    },
    {
      name: "Sarah Williams",
      role: "Student Success Manager",
      image: "https://i.pravatar.cc/300?img=4",
    },
  ];

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ color: theme.palette.text.primary }}
          >
            About Us
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 800,
              mx: "auto",
            }}
          >
            We are dedicated to providing high-quality education and empowering
            students to achieve their goals through innovative learning
            solutions.
          </Typography>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ color: theme.palette.text.primary, mb: 4 }}
          >
            Our Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature) => (
              <Grid item key={feature.title} xs={12} sm={6} md={3}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 8 }} />

        {/* Team Section */}
        <Box>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ color: theme.palette.text.primary, mb: 4 }}
          >
            Our Team
          </Typography>
          <Grid container spacing={4}>
            {team.map((member) => (
              <Grid item key={member.name} xs={12} sm={6} md={3}>
                <TeamMember {...member} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission Section */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ color: theme.palette.text.primary }}
          >
            Our Mission
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 800,
              mx: "auto",
            }}
          >
            To make quality education accessible to everyone and help students
            achieve their full potential through innovative learning solutions
            and personalized support.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
