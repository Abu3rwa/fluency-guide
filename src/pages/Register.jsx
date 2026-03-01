import React, { useState, useEffect } from 'react';
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
  Divider,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';

function Register() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    selectedCourseId: '',
  });
  const [localError, setLocalError] = useState('');
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  // Fetch available courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, 'courses');
        const coursesQuery = query(coursesRef, where('status', '==', 'published'));
        const snapshot = await getDocs(coursesQuery);
        const coursesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesList);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

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
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
      setLocalError(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    // Phone number validation (basic)
    const phoneRegex = /^[\d\s+()-]{8,}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setLocalError(isArabic ? 'رقم الهاتف غير صالح' : 'Invalid phone number');
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
      // Register the user
      const userCredential = await register(formData.email, formData.password, formData.name, 'student', formData.phoneNumber);

      // If a course was selected, create enrollment
      if (formData.selectedCourseId && userCredential?.user) {
        const selectedCourse = courses.find(c => c.id === formData.selectedCourseId);

        await addDoc(collection(db, 'enrollments'), {
          courseId: formData.selectedCourseId,
          courseName: selectedCourse?.title || '',
          roundId: selectedCourse?.currentRoundId || null,
          roundNumber: selectedCourse?.totalRounds || 1,
          firstName: formData.name.split(' ')[0] || formData.name,
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          userId: userCredential.user.uid,
          status: 'pending',
          enrolledAt: Timestamp.now(),
          createdAt: Timestamp.now(),
        });

        setEnrollmentSuccess(true);
      }

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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
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
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              overflow: 'visible',
            }}
          >
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
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(0,137,123,0.3)',
                    }}
                  >
                    <PersonAddIcon sx={{ fontSize: 36, color: '#FFFFFF' }} />
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                    color: '#1a1a2e',
                  }}
                >
                  {t('auth.createAccount')}
                </Typography>
                <Typography color="textSecondary">
                  {isArabic ? 'سجل الآن وابدأ رحلة التعلم' : 'Register now and start your learning journey'}
                </Typography>
              </Box>

              {/* Error Messages */}
              {(localError || error) && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {localError || error}
                </Alert>
              )}

              {/* Enrollment Success */}
              {enrollmentSuccess && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {isArabic ? 'تم التسجيل في الدورة بنجاح!' : 'Successfully enrolled in course!'}
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label={isArabic ? 'رقم الهاتف' : 'Phone Number'}
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                  required
                  disabled={loading}
                  placeholder={isArabic ? '+249 XX XXX XXXX' : '+249 XX XXX XXXX'}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Course Selection Divider */}
                <Box sx={{ my: 3 }}>
                  <Divider>
                    <Chip
                      icon={<SchoolIcon />}
                      label={isArabic ? 'التسجيل في دورة (اختياري)' : 'Enroll in a Course (Optional)'}
                      color="primary"
                      variant="outlined"
                    />
                  </Divider>
                </Box>

                {/* Course Selection Dropdown */}
                <FormControl fullWidth margin="normal">
                  <InputLabel>{isArabic ? 'اختر دورة' : 'Select a Course'}</InputLabel>
                  <Select
                    name="selectedCourseId"
                    value={formData.selectedCourseId}
                    onChange={handleChange}
                    label={isArabic ? 'اختر دورة' : 'Select a Course'}
                    disabled={loading || loadingCourses}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="">
                      <em>{isArabic ? 'لا شكراً، سأختار لاحقاً' : "No thanks, I'll choose later"}</em>
                    </MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <Typography>
                            {typeof course.title === 'object'
                              ? course.title[isArabic ? 'ar' : 'en']
                              : course.title}
                          </Typography>
                          {course.price && (
                            <Chip
                              label={`$${course.price}`}
                              size="small"
                              color="success"
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingCourses && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {isArabic ? 'جاري تحميل الدورات...' : 'Loading courses...'}
                      </Typography>
                    </Box>
                  )}
                </FormControl>

                {/* Selected Course Info */}
                {formData.selectedCourseId && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      {isArabic
                        ? '✨ سيتم تسجيلك في الدورة المختارة وستتلقى تأكيداً قريباً'
                        : '✨ You will be enrolled in the selected course and receive confirmation soon'}
                    </Typography>
                  </Alert>
                )}

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
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                    boxShadow: '0 4px 15px rgba(0,137,123,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(0,137,123,0.4)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} /> : null}
                  {loading
                    ? t('auth.creatingAccount')
                    : formData.selectedCourseId
                      ? (isArabic ? 'إنشاء حساب والتسجيل في الدورة' : 'Create Account & Enroll')
                      : t('auth.createAccount')
                  }
                </Button>
              </form>

              {/* Sign In Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="body2">
                  {t('auth.haveAccount')}{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#00897B',
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
