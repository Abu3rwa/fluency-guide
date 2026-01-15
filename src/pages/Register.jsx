import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Register() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError(t('errors.requiredFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setLocalError(t('auth.weakPassword'));
      return;
    }

    try {
      // All new users are registered as 'student' - instructors must be promoted by admin
      await register(formData.email, formData.password, formData.name, 'student');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || t('auth.registerError');

      // Format Firebase error messages
      let displayError = errorMessage;
      if (errorMessage.includes('email-already-in-use')) {
        displayError = t('auth.emailInUse');
      } else if (errorMessage.includes('invalid-email')) {
        displayError = t('auth.invalidEmail');
      } else if (errorMessage.includes('weak-password')) {
        displayError = t('auth.weakPassword');
      }

      setLocalError(displayError);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: { xs: 2, md: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                </Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                  }}
                >
                  {t('auth.createAccount')}
                </Typography>
                <Typography color="textSecondary">
                  {t('auth.joinUs')}
                </Typography>
              </Box>

              {/* Error Messages */}
              {(localError || error) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {localError || error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label={t('auth.fullName')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  required
                  disabled={loading}
                  placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  type="email"
                  label={t('auth.email')}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  required
                  disabled={loading}
                  placeholder="you@example.com"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  type="password"
                  label={t('auth.password')}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  required
                  disabled={loading}
                  helperText={t('auth.minChars')}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  type="password"
                  label={t('auth.confirmPassword')}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    },
                  }}
                />

                {/* Note: Role selection removed for security - all users register as students */}
                {/* Instructors must be promoted by an administrator */}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '16px',
                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    boxShadow: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} /> : null}
                  {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                </Button>
              </form>

              {/* Sign In Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="body2">
                  {t('auth.haveAccount')}
                  <Link
                    to="/login"
                    style={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {t('auth.signIn')}
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}

export default Register;
