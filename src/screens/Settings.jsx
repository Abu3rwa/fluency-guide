import React from "react";
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
} from "@mui/material";
import { useCustomTheme } from "../contexts/ThemeContext";

const Settings = () => {
  const { mode, toggleTheme } = useCustomTheme();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Customize your application preferences
      </Typography>

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
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Settings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
