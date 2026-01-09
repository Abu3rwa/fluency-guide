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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Header from '../components/common/Header';
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
    role: 'student',
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
      setLocalError(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError(isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError(isArabic ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, formData.role);
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || (isArabic ? 'فشل التسجيل' : 'Registration failed');

      // Format Firebase error messages
      let displayError = errorMessage;
      if (errorMessage.includes('email-already-in-use')) {
        displayError = isArabic ? 'البريد الإلكتروني قيد الاستخدام بالفعل' : 'Email is already in use';
      } else if (errorMessage.includes('invalid-email')) {
        displayError = isArabic ? 'البريد الإلكتروني غير صالح' : 'Invalid email format';
      } else if (errorMessage.includes('weak-password')) {
        displayError = isArabic ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak';
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
      <Header />
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
                  {isArabic ? 'إنشاء حساب' : 'Create Account'}
                </Typography>
                <Typography color="textSecondary">
                  {isArabic
                    ? 'انضم إلينا وابدأ رحلتك التعليمية'
                    : 'Join us and start your learning journey'}
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
                  label={isArabic ? 'الاسم الكامل' : 'Full Name'}
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
                  helperText={isArabic ? '6 أحرف على الأقل' : 'Minimum 6 characters'}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  type="password"
                  label={isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
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

                <FormControl fullWidth margin="normal">
                  <InputLabel>{isArabic ? 'نوع الحساب' : 'Account Type'}</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label={isArabic ? 'نوع الحساب' : 'Account Type'}
                    disabled={loading}
                  >
                    <MenuItem value="student">
                      {isArabic ? 'طالب' : 'Student'}
                    </MenuItem>
                    <MenuItem value="instructor">
                      {isArabic ? 'معلم' : 'Instructor'}
                    </MenuItem>
                  </Select>
                </FormControl>

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
                  {loading ? (isArabic ? 'جاري الإنشاء...' : 'Creating account...') : (isArabic ? 'إنشاء حساب' : 'Create Account')}
                </Button>
              </form>

              {/* Sign In Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="body2">
                  {isArabic ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                  <Link
                    to="/login"
                    style={{
                      color: '#1976d2',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {isArabic ? 'تسجيل الدخول' : 'Sign in'}
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
