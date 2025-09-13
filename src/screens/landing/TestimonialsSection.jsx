import React from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useTheme } from "@mui/material/styles";

const TestimonialCard = ({ testimonial, t }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: theme.shadows[2],
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
        },
        transition: "all 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Avatar
          src={testimonial.avatar}
          sx={{
            width: 56,
            height: 56,
            border: 2,
            borderColor: "primary.main",
          }}
          alt={
            testimonial.name ||
            t(`landing.testimonials.items.${testimonial.key}.name`)
          }
        />
        <Box>
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontWeight: 600,
            }}
          >
            {testimonial.name ||
              t(`landing.testimonials.items.${testimonial.key}.name`)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {testimonial.role ||
              t(`landing.testimonials.items.${testimonial.key}.role`)}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 2,
          flex: 1,
          fontStyle: "italic",
          lineHeight: 1.6,
        }}
      >
        "{testimonial.quote ||
          t(`landing.testimonials.items.${testimonial.key}.quote`)}"
      </Typography>

      <Box display="flex" alignItems="center" gap={0.5}>
        {[...Array(testimonial.rating)].map((_, i) => (
          <StarIcon
            key={i}
            color="warning"
            fontSize="small"
          />
        ))}
      </Box>
    </Paper>
  );
};

// Simplified fallback testimonials - reduced to 3 high-quality testimonials
const fallbackTestimonials = [
  {
    key: "sarah",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    key: "miguel",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    key: "aisha",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
  },
];

const TestimonialsSection = React.memo(({ t, testimonials = [] }) => {
  TestimonialsSection.displayName = "TestimonialsSection";
  const theme = useTheme();

  // Use dynamic testimonials if available, otherwise use fallback
  const displayTestimonials =
    testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          align="center"
          color="primary"
          sx={{
            mb: { xs: 4, md: 6 },
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            fontWeight: 700,
          }}
        >
          {t("landing.testimonials.title")}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            gap: { xs: 3, md: 4 },
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          {displayTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.key || index}
              testimonial={testimonial}
              t={t}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
});

export default TestimonialsSection;
