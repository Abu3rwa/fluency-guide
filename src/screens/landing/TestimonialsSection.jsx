import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import StarIcon from "@mui/icons-material/Star";
import { useTheme } from "@mui/material/styles";

const TestimonialCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2, 1, 2, 1),
  borderRadius: "16px",
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
}));

const testimonials = [
  {
    key: "sarah",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    key: "miguel",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    key: "aisha",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const TestimonialsSection = ({ t }) => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 4, md: 8 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          fontFamily={theme.typography.h4.fontFamily}
          color="primary"
          variant="h4"
          align="center"
          sx={{
            mb: { xs: 2, md: 4 },
            fontSize: { xs: "1.3rem", sm: "1.7rem", md: "2.125rem" },
          }}
        >
          {t("landing.testimonials.title")}
        </Typography>
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          justifyContent="center"
          aria-label="Testimonials"
        >
          {testimonials.map((testimonial, idx) => (
            <Grid item xs={12} md={4} key={testimonial.key}>
              <TestimonialCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                aria-label={`Testimonial from ${t(
                  `landing.testimonials.items.${testimonial.key}.name`
                )}`}
              >
                <Avatar
                  src={testimonial.avatar}
                  sx={{ width: 60, height: 60, mx: "auto", mb: 2 }}
                  alt={t(`landing.testimonials.items.${testimonial.key}.name`)}
                />
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    fontFamily: theme.typography.h6.fontFamily,
                  }}
                >
                  {t(`landing.testimonials.items.${testimonial.key}.name`)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, fontFamily: theme.typography.body2.fontFamily }}
                >
                  {t(`landing.testimonials.items.${testimonial.key}.role`)}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, fontFamily: theme.typography.body1.fontFamily }}
                >
                  "{t(`landing.testimonials.items.${testimonial.key}.quote`)}"
                </Typography>
                <Box display="flex" justifyContent="center" gap={0.5}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} color="warning" fontSize="small" />
                  ))}
                </Box>
              </TestimonialCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
