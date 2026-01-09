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
import LoginIcon from '@mui/icons-material/Login';

function Login() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email || !formData.password) {
      setLocalError(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || (isArabic ? 'فشل تسجيل الدخول' : 'Login failed'));
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
                    '& svg': { fontSize: 48, color: 'primary.main' },
                  }}
                >
                  <LoginIcon sx={{ fontSize: 48, color: 'primary.main' }} />
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
                  {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                </Typography>
                <Typography color="textSecondary">
                  {isArabic
                    ? 'أدخل بيانات اعتمادك للوصول إلى حسابك'
                    : 'Enter your credentials to access your account'}
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
                  type="email"
                  label={isArabic ? 'البريد الإلكتروني' : 'Email'}
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
                  label={isArabic ? 'كلمة المرور' : 'Password'}
                  name="password"
                  value={formData.password}
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
                  {loading ? (isArabic ? 'جاري الدخول...' : 'Signing in...') : (isArabic ? 'دخول' : 'Sign In')}
                </Button>
              </form>

              {/* Divider */}
              <Box sx={{ my: 2, textAlign: 'center' }}>
                <Typography color="textSecondary" variant="body2">
                  {isArabic ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
                  <Link
                    to="/register"
                    style={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {isArabic ? 'إنشاء حساب جديد' : 'Create one'}
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

export default Login;
