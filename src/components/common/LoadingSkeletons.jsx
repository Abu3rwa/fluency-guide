import React from "react";
import {
  Box,
  Skeleton,
  Grid,
  Card,
  CardContent,
  Container,
} from "@mui/material";

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <Box
    sx={{
      minHeight: "600px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "background.default",
    }}
    role="status"
    aria-label="Loading hero section"
    aria-live="polite"
  >
    <Box sx={{ textAlign: "center", width: "100%", maxWidth: "800px", px: 2 }}>
      <Skeleton
        variant="text"
        width="60%"
        height={60}
        sx={{ mx: "auto", mb: 2 }}
      />
      <Skeleton
        variant="text"
        width="80%"
        height={40}
        sx={{ mx: "auto", mb: 3 }}
      />
      <Skeleton
        variant="text"
        width="40%"
        height={30}
        sx={{ mx: "auto", mb: 4 }}
      />
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Skeleton variant="rectangular" width={150} height={50} />
        <Skeleton variant="rectangular" width={150} height={50} />
      </Box>
    </Box>
  </Box>
);

// Statistics Banner Skeleton
export const StatisticsSkeleton = () => (
  <Box
    sx={{ py: 4, bgcolor: "background.paper" }}
    role="status"
    aria-label="Loading statistics"
    aria-live="polite"
  >
    <Container maxWidth="lg">
      <Grid container spacing={3} justifyContent="center">
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={6} sm={3} key={item}>
            <Box sx={{ textAlign: "center" }}>
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                sx={{ mx: "auto", mb: 1 }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                sx={{ mx: "auto" }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Features Section Skeleton
export const FeaturesSkeleton = () => (
  <Box
    sx={{ py: 6, bgcolor: "background.default" }}
    role="status"
    aria-label="Loading features"
    aria-live="polite"
  >
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Skeleton
          variant="text"
          width="40%"
          height={50}
          sx={{ mx: "auto", mb: 2 }}
        />
        <Skeleton variant="text" width="60%" height={30} sx={{ mx: "auto" }} />
      </Box>

      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card sx={{ height: "100%", p: 2 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Skeleton
                  variant="circular"
                  width={64}
                  height={64}
                  sx={{ mx: "auto", mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={30}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="100%"
                  height={20}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="90%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Testimonials Section Skeleton
export const TestimonialsSkeleton = () => (
  <Box
    sx={{ py: 6, bgcolor: "background.paper" }}
    role="status"
    aria-label="Loading testimonials"
    aria-live="polite"
  >
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Skeleton
          variant="text"
          width="40%"
          height={50}
          sx={{ mx: "auto", mb: 2 }}
        />
        <Skeleton variant="text" width="60%" height={30} sx={{ mx: "auto" }} />
      </Box>

      <Box sx={{ maxWidth: "800px", mx: "auto" }}>
        <Card sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Skeleton
              variant="circular"
              width={60}
              height={60}
              sx={{ mr: 2 }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={25} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="30%" height={20} />
            </Box>
          </Box>
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={20} />
        </Card>
      </Box>
    </Container>
  </Box>
);

// FAQ Section Skeleton
export const FAQSkeleton = () => (
  <Box
    sx={{ py: 6, bgcolor: "background.default" }}
    role="status"
    aria-label="Loading frequently asked questions"
    aria-live="polite"
  >
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Skeleton
          variant="text"
          width="40%"
          height={50}
          sx={{ mx: "auto", mb: 2 }}
        />
        <Skeleton variant="text" width="60%" height={30} sx={{ mx: "auto" }} />
      </Box>

      <Box sx={{ maxWidth: "800px", mx: "auto" }}>
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={30} sx={{ mb: 1 }} />
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ mb: 1 }}
              />
              <Skeleton variant="text" width="90%" height={20} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  </Box>
);

// Contact Section Skeleton
export const ContactSkeleton = () => (
  <Box
    sx={{ py: 6, bgcolor: "background.paper" }}
    role="status"
    aria-label="Loading contact section"
    aria-live="polite"
  >
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Skeleton
          variant="text"
          width="40%"
          height={50}
          sx={{ mx: "auto", mb: 2 }}
        />
        <Skeleton variant="text" width="60%" height={30} sx={{ mx: "auto" }} />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={50} />
            <Skeleton variant="rectangular" width="100%" height={50} />
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Skeleton variant="rectangular" width={150} height={50} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

// Generic Section Skeleton
export const SectionSkeleton = ({
  height = 400,
  ariaLabel = "Loading content",
}) => (
  <Box
    sx={{ py: 4, minHeight: height }}
    role="status"
    aria-label={ariaLabel}
    aria-live="polite"
  >
    <Skeleton variant="rectangular" width="100%" height="100%" />
  </Box>
);

export default {
  HeroSkeleton,
  StatisticsSkeleton,
  FeaturesSkeleton,
  TestimonialsSkeleton,
  FAQSkeleton,
  ContactSkeleton,
  SectionSkeleton,
};
