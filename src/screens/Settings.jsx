import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { useCustomTheme } from "../contexts/ThemeContext";
import LandingPageSettings from "./settings/LandingPageSettings";

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Settings = () => {
  const { mode, toggleTheme } = useCustomTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Customize your application preferences and manage content
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="settings sections"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          "& .MuiTabs-scrollButtons": {
            "&.Mui-disabled": { opacity: 0.3 },
          },
        }}
      >
        <Tab label="General" />
        <Tab label="Profile" />
        <Tab label="Landing Page" />
        <Tab label="Notifications" />
      </Tabs>

      {/* General Settings */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appearance
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === "dark"}
                      onChange={toggleTheme}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Storage Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your storage preferences
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Profile Settings */}
      <TabPanel value={activeTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Settings
            </Typography>
            <TextField
              fullWidth
              label="Display Name"
              margin="normal"
              defaultValue="John Doe"
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              defaultValue="john@example.com"
            />
            <Button variant="contained" sx={{ mt: 2 }}>
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Landing Page Settings */}
      <TabPanel value={activeTab} index={2}>
        <LandingPageSettings />
      </TabPanel>

      {/* Notifications Settings */}
      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email Notifications"
            />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Course Updates"
            />
            <Divider sx={{ my: 2 }} />
            <FormControlLabel control={<Switch />} label="Marketing Emails" />
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default Settings;
