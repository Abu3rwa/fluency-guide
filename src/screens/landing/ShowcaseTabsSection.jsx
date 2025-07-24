import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Divider,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import "./styles/showcaseTabsSection.css";
const ShowcaseTabsSection = ({ t }) => {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{ py: { xs: 4, md: 8 }, bgcolor: "background.paper", width: "100%" }}
    >
      <Container maxWidth="md" sx={{ maxWidth: "100vw", px: { xs: 0, sm: 2 } }}>
        <Typography
          variant="h4"
          align="center"
          color="primary"
          sx={{
            mb: { xs: 2, md: 4 },
            fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.125rem" },
          }}
        >
          {t("landing.tabs.title")}
        </Typography>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%", px: { xs: 1, sm: 4 } }}
        >
          <Tabs
            className="showcase-tabs"
            value={tabValue}
            onChange={handleTabChange}
            centered
            variant="standard"
            scrollButtons={false}
            aria-label="Showcase Tabs"
            sx={{
              minHeight: { xs: 36, sm: 48 },
              width: "auto",
              maxWidth: "100%",
              ".MuiTab-root": {
                fontSize: { xs: "0.95rem", sm: "1rem" },
                minHeight: { xs: 36, sm: 48 },
                px: { xs: 1, sm: 2 },
                minWidth: 80,
                maxWidth: "100vw",
              },
            }}
          >
            <Tab label={t("landing.tabs.overview")} />
            <Tab label={t("landing.tabs.benefits")} />
            <Tab label={t("landing.tabs.howItWorks")} />
          </Tabs>
        </Box>
        <Divider sx={{ my: { xs: 2, md: 3 } }} />
        {tabValue === 0 && (
          <Typography
            align="center"
            color="textSecondary"
            padding={2}
            sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
          >
            {t("landing.tabs.overviewText")}
          </Typography>
        )}
        {tabValue === 1 && (
          <Box
            display="flex"
            justifyContent="center"
            gap={2}
            flexWrap="wrap"
            sx={{ mt: { xs: 1, md: 2 } }}
          >
            <Chip
              label={t("landing.tabs.flexible")}
              color="primary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, minWidth: 0 }}
            />
            <Chip
              label={t("landing.tabs.accessible")}
              color="secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, minWidth: 0 }}
            />
            <Chip
              label={t("landing.tabs.engaging")}
              color="success"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, minWidth: 0 }}
            />
            <Chip
              label={t("landing.tabs.personalized")}
              color="info"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, minWidth: 0 }}
            />
          </Box>
        )}
        {tabValue === 2 && (
          <Typography
            align="center"
            color="textSecondary"
            sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
          >
            {t("landing.tabs.howItWorksText")}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default ShowcaseTabsSection;
