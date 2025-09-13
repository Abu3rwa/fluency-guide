import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TermsAgreement from '../shared/TermsAgreement';

/**
 * Example component demonstrating TermsAgreement usage
 * Shows how to integrate the component with different configurations
 */
const TermsAgreementExample = () => {
  const { t, i18n } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [termsType, setTermsType] = useState('private-sessions');
  const [showAdminControls, setShowAdminControls] = useState(true);

  const handleSubmit = () => {
    if (agreed) {
      alert('Form submitted successfully!');
    } else {
      alert('Please agree to the terms to continue.');
    }
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Enhanced TermsAgreement Component Demo
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This demonstrates the enhanced TermsAgreement component with admin controls,
        bilingual support, and clean architecture.
      </Typography>

      {/* Language Switcher */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="subtitle2">Language:</Typography>
        <Button 
          variant={i18n.language === 'en' ? 'contained' : 'outlined'}
          onClick={() => handleLanguageChange('en')}
          size="small"
        >
          English
        </Button>
        <Button 
          variant={i18n.language === 'ar' ? 'contained' : 'outlined'}
          onClick={() => handleLanguageChange('ar')}
          size="small"
        >
          العربية
        </Button>
      </Box>

      {/* Configuration Controls */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Configuration Options
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Terms Type</InputLabel>
            <Select
              value={termsType}
              onChange={(e) => setTermsType(e.target.value)}
              label="Terms Type"
            >
              <MenuItem value="private-sessions">Private Sessions</MenuItem>
              <MenuItem value="general">General Terms</MenuItem>
              <MenuItem value="privacy-policy">Privacy Policy</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showAdminControls}
                onChange={(e) => setShowAdminControls(e.target.checked)}
              />
            }
            label="Show Admin Controls (if user is admin)"
          />
        </Box>
      </Paper>

      {/* Demo Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sample Booking Form
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          This simulates a booking form where terms agreement is required:
        </Typography>

        {/* Enhanced TermsAgreement Component */}
        <TermsAgreement
          checked={agreed}
          onChange={setAgreed}
          required={true}
          termsType={termsType}
          showAdminControls={showAdminControls}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!agreed}
            size="large"
          >
            Submit Booking
          </Button>
        </Box>
      </Paper>

      {/* Features List */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Key Features:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body2">
              <strong>Bilingual Support:</strong> Automatically switches between English and Arabic based on user language preference
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Admin Controls:</strong> Admins can edit terms content directly from the component
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Clean Architecture:</strong> Modular design with separated concerns (Viewer, Editor, Service)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Real-time Content:</strong> Terms are loaded from Firestore with fallback to default content
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>RTL Support:</strong> Proper right-to-left layout for Arabic content
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Markdown Support:</strong> Basic markdown rendering for formatted content
            </Typography>
          </li>
        </Box>
      </Box>
    </Box>
  );
};

export default TermsAgreementExample;