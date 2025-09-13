import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  Skeleton,
  Fade,
} from "@mui/material";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import { useLandingPage } from "../../contexts/LandingPageContext";

// Simplified Statistic Item Component
const StatisticItem = ({
  value,
  label,
  suffix = "+",
  duration = 2,
  icon,
}) => {
  const theme = useTheme();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <Box
      ref={ref}
      sx={{
        position: "relative",
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 3,
        boxShadow: theme.shadows[2],
        textAlign: "center",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {/* Icon */}
      {icon && (
        <Box
          sx={{
            fontSize: "2rem",
            mb: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      )}

      {/* Number */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: "primary.main",
          mb: 1,
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        {inView ? (
          <CountUp
            end={value}
            duration={duration}
            suffix={suffix}
            separator=","
          />
        ) : (
          `0${suffix}`
        )}
      </Typography>

      {/* Label */}
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// Loading skeleton component
const StatisticSkeleton = ({ delay }) => (
  <Box
    sx={{
      bgcolor: "background.paper",
      borderRadius: 3,
      p: 3,
      boxShadow: 2,
      border: 1,
      borderColor: "divider",
    }}
    style={{ animationDelay: `${delay}ms` }}
  >
    <Box sx={{ textAlign: "center" }}>
      <Skeleton
        variant="text"
        width="80%"
        height={48}
        sx={{ mx: "auto", mb: 2 }}
      />
      <Skeleton
        variant="text"
        width={32}
        height={8}
        sx={{ mx: "auto", mb: 2 }}
      />
      <Skeleton variant="text" width="60%" height={20} sx={{ mx: "auto" }} />
    </Box>
  </Box>
);

const StatisticsBanner = React.memo(({ t, statistics = [] }) => {
  StatisticsBanner.displayName = "StatisticsBanner";
  const theme = useTheme();
  const { getLandingPageStats } = useLandingPage();
  const [realStats, setRealStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Fetch real statistics
  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        setIsLoading(true);
        const stats = await getLandingPageStats();
        setRealStats(stats);
      } catch (error) {
        console.error("Error fetching real statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealStats();
  }, [getLandingPageStats]);

  // Updated fallback statistics to match platform features
  const fallbackStats = [
    {
      value: 150,
      label: t("landing.stats.activeStudents"),
      suffix: "+",
      icon: "👨‍🎓",
    },
    {
      value: 5,
      label: t("landing.stats.expertInstructors"),
      suffix: "+",
      icon: "👩‍🏫",
    },
    {
      value: 8,
      label: t("landing.stats.sessionTypes"),
      suffix: "+",
      icon: "📚",
    },
    {
      value: 98,
      label: t("landing.stats.satisfaction"),
      suffix: "%",
      icon: "⭐",
    },
  ];

  // Use real statistics if available, then provided statistics, then fallback
  const displayStats =
    realStats.length > 0
      ? realStats.map((stat, index) => {
          // Map backend data to translated labels
          const labelMapping = {
            totalStudents: t("landing.stats.activeStudents"),
            activeInstructors: t("landing.stats.expertInstructors"),
            sessionTypes: t("landing.stats.sessionTypes"),
            totalCourses: t("landing.stats.courses"),
            satisfactionRate: t("landing.stats.satisfaction"),
            totalGraduates: t("landing.stats.graduates"),
            supportHours: t("landing.stats.hoursSupport"),
            successRate: t("landing.stats.successRate"),
            // Fallback for any other keys
            [stat.label]: stat.label,
          };

          return {
            ...stat,
            label:
              labelMapping[stat.id] || labelMapping[stat.label] || stat.label,
            icon: fallbackStats[index]?.icon || "📊",
          };
        })
      : statistics.length > 0
      ? statistics.map((stat, index) => ({
          ...stat,
          icon: fallbackStats[index]?.icon || "📊",
        }))
      : fallbackStats;

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 6, md: 8 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Fade in={inView} timeout={800}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "white",
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              {t("landing.stats.impactTitle")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                maxWidth: 600,
                mx: "auto",
              }}
            >
              {t("landing.stats.impactSubtitle")}
            </Typography>
          </Box>
        </Fade>

        {/* Statistics Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(4, 1fr)",
            },
            gap: { xs: 2, md: 3 },
          }}
        >
          {isLoading
            ? [...Array(4)].map((_, index) => (
                <StatisticSkeleton key={index} delay={index * 100} />
              ))
            : displayStats.slice(0, 4).map((stat, index) => (
                <StatisticItem
                  key={stat.id || index}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix || "+"}
                  duration={2 + index * 0.2}
                  icon={stat.icon}
                />
              ))}
        </Box>
      </Container>
    </Box>
  );
});

export default StatisticsBanner;
