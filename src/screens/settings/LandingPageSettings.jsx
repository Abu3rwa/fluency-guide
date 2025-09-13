import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Button,
  Snackbar,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import HistoryIcon from "@mui/icons-material/History";
import { useLandingPage } from "../../contexts/LandingPageContext";
import HeroPanel from "./panels/HeroPanel";
import StatisticsPanel from "./panels/StatisticsPanel";
import FeaturesPanel from "./panels/FeaturesPanel";
import TestimonialsPanel from "./panels/TestimonialsPanel";
import FAQPanel from "./panels/FAQPanel";
import ContactPanel from "./panels/ContactPanel";
import ShowcasePanel from "./panels/ShowcasePanel";

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`landing-tabpanel-${index}`}
    aria-labelledby={`landing-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const LandingPageSettings = () => {
  const { isLoading, error, createNewVersion } = useLandingPage();
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateNewVersion = async () => {
    try {
      await createNewVersion();
      setSnackbar({
        open: true,
        message: "New version created successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to create new version",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Landing Page Content
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and customize your landing page content
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={handleCreateNewVersion}
          >
            Create New Version
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="landing page sections"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
          }}
        >
          <Tab label="Hero Section" />
          <Tab label="Statistics" />
          <Tab label="Features" />
          <Tab label="Testimonials" />
          <Tab label="FAQ" />
          <Tab label="Contact" />
          <Tab label="Showcase" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <HeroPanel />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <StatisticsPanel />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <FeaturesPanel />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <TestimonialsPanel />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <FAQPanel />
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <ContactPanel />
        </TabPanel>

        <TabPanel value={activeTab} index={6}>
          <ShowcasePanel />
        </TabPanel>
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default LandingPageSettings;
