import React from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";
import { useCustomTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

const PricingTier = ({ title, price, features, isPopular, onSelect }) => {
  const { theme } = useCustomTheme();
  const navigate = useNavigate();

  const handleSelect = () => {
    if (onSelect) {
      onSelect();
    } else {
      navigate("/auth");
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
        },
        ...(isPopular && {
          border: `2px solid ${theme.palette.primary.main}`,
        }),
      }}
    >
      {isPopular && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: theme.palette.primary.main,
            color: "white",
            padding: "4px 16px",
            borderBottomLeftRadius: theme.shape.borderRadius,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            Most Popular
          </Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          {title}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            component="div"
            sx={{ color: theme.palette.text.primary }}
          >
            ${price}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            per month
          </Typography>
        </Box>
        <List>
          {features.map((feature, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {feature.included ? (
                  <CheckIcon sx={{ color: theme.palette.success.main }} />
                ) : (
                  <CloseIcon sx={{ color: theme.palette.error.main }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      color: feature.included
                        ? theme.palette.text.primary
                        : theme.palette.text.disabled,
                    }}
                  >
                    {feature.text}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSelect}
          sx={{
            backgroundColor: isPopular
              ? theme.palette.primary.main
              : theme.palette.background.paper,
            color: isPopular ? "white" : theme.palette.primary.main,
            border: `2px solid ${theme.palette.primary.main}`,
            "&:hover": {
              backgroundColor: isPopular
                ? theme.palette.primary.dark
                : theme.palette.primary.light,
              color: "white",
            },
          }}
        >
          Get Started
        </Button>
      </Box>
    </Card>
  );
};

const Pricing = () => {
  const { theme } = useCustomTheme();

  const tiers = [
    {
      title: "Basic",
      price: "9",
      features: [
        { text: "Access to basic courses", included: true },
        { text: "Community forum access", included: true },
        { text: "Basic support", included: true },
        { text: "Certificate of completion", included: false },
        { text: "1-on-1 mentoring", included: false },
      ],
    },
    {
      title: "Pro",
      price: "29",
      features: [
        { text: "Access to all courses", included: true },
        { text: "Community forum access", included: true },
        { text: "Priority support", included: true },
        { text: "Certificate of completion", included: true },
        { text: "1-on-1 mentoring", included: false },
      ],
      isPopular: true,
    },
    {
      title: "Enterprise",
      price: "99",
      features: [
        { text: "Access to all courses", included: true },
        { text: "Community forum access", included: true },
        { text: "24/7 priority support", included: true },
        { text: "Certificate of completion", included: true },
        { text: "1-on-1 mentoring", included: true },
      ],
    },
  ];

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ color: theme.palette.text.primary }}
          >
            Choose Your Plan
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Select the perfect plan for your learning journey. All plans include
            a 14-day free trial.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {tiers.map((tier) => (
            <Grid item key={tier.title} xs={12} md={4}>
              <PricingTier {...tier} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Need a custom plan?
          </Typography>
          <Button
            variant="outlined"
            size="large"
            sx={{
              mt: 2,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": {
                borderColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.primary.light,
                color: "white",
              },
            }}
          >
            Contact Sales
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing;
