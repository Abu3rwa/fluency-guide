import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Navigation as NavigationIcon,
  AdminPanelSettings as AdminIcon,
  Language as LanguageIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes/constants';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Demo component showing the complete Terms Management integration
 * Demonstrates navigation, admin controls, and bilingual support
 */
const TermsIntegrationDemo = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const handleNavigateToTerms = () => {
    navigate(ROUTES.ADMIN_TERMS_MANAGEMENT);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const features = [
    {
      icon: <NavigationIcon color="primary" />,
      title: 'Navigation Integration',
      description: 'Terms Management added to admin user menu',
      status: 'complete'
    },
    {
      icon: <AdminIcon color="primary" />,
      title: 'Admin Route Protection',
      description: 'Route protected for admin users only',
      status: 'complete'
    },
    {
      icon: <LanguageIcon color="primary" />,
      title: 'Bilingual Support',
      description: 'Navigation labels in English and Arabic',
      status: 'complete'
    },
    {
      icon: <ArticleIcon color="primary" />,
      title: 'Full CRUD Operations',
      description: 'Create, read, update, delete terms content',
      status: 'complete'
    }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Terms Management Integration Demo
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        This demonstrates the complete integration of Terms Management functionality
        into the navigation system with proper admin controls and bilingual support.
      </Typography>

      {/* Status Alert */}
      <Alert severity="success" sx={{ mb: 3 }}>
        ✅ Terms Management has been successfully integrated into the user navigation!
      </Alert>

      {/* Language Demo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Language Support Demo
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant={i18n.language === 'en' ? 'contained' : 'outlined'}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </Button>
          <Button 
            variant={i18n.language === 'ar' ? 'contained' : 'outlined'}
            onClick={() => handleLanguageChange('ar')}
          >
            العربية
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Navigation Label: "{t('navigation.termsManagement')}"
        </Typography>
      </Paper>

      {/* Features List */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Integration Features
        </Typography>
        <List>
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  {feature.icon}
                </ListItemIcon>
                <ListItemText
                  primary={feature.title}
                  secondary={feature.description}
                />
                <CheckIcon color="success" />
              </ListItem>
              {index < features.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Admin Access */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Admin Access
        </Typography>
        {userData?.isAdmin ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              You have admin access! You can now manage terms content.
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArticleIcon />}
              onClick={handleNavigateToTerms}
            >
              Go to Terms Management
            </Button>
          </>
        ) : (
          <Alert severity="info">
            Admin access required to manage terms content.
            The Terms Management option will appear in the user menu for admin users.
          </Alert>
        )}
      </Paper>

      {/* Implementation Details */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          What Was Added
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="1. Route Constant"
              secondary="Added ADMIN_TERMS_MANAGEMENT to routes/constants.js"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="2. Navigation Menu Item"
              secondary="Added Terms Management to UserMenu.jsx for admin users"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="3. Route Configuration"
              secondary="Added protected admin route in routes/index.jsx"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="4. Translation Keys"
              secondary="Added navigation.termsManagement to EN/AR translation files"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default TermsIntegrationDemo;