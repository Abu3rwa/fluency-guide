import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';

const EnrollmentForm = ({ courseId, courseName, roundId, roundNumber, onClose, open }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    nationality: '',
    currentCountry: '',
    gender: '',
    educationLevel: '',
    age: '',
    courseId: courseId || '',
    courseName: courseName || '',
    roundId: roundId || '',
    roundNumber: roundNumber || 1,
    message: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = isArabic ? 'الاسم الأول مطلوب' : 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = isArabic ? 'الاسم الأخير مطلوب' : 'Last name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = isArabic ? 'البريد الإلكتروني غير صحيح' : 'Invalid email';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = isArabic ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    if (!formData.whatsappNumber.trim()) newErrors.whatsappNumber = isArabic ? 'رقم WhatsApp مطلوب' : 'WhatsApp number is required';
    if (!formData.nationality) newErrors.nationality = isArabic ? 'الجنسية مطلوبة' : 'Nationality is required';
    if (!formData.currentCountry) newErrors.currentCountry = isArabic ? 'الدولة الحالية مطلوبة' : 'Current country is required';
    if (!formData.gender) newErrors.gender = isArabic ? 'الجنس مطلوب' : 'Gender is required';
    if (!formData.educationLevel) newErrors.educationLevel = isArabic ? 'مستوى التعليم مطلوب' : 'Education level is required';
    if (!formData.age) newErrors.age = isArabic ? 'العمر مطلوب' : 'Age is required';
    if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) newErrors.age = isArabic ? 'العمر يجب أن يكون بين 13 و 120' : 'Age must be between 13 and 120';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'enrollments'), {
        ...formData,
        age: parseInt(formData.age),
        enrolledAt: Timestamp.now(),
        status: 'pending',
      });

      setSuccessMessage(isArabic ? 'تم استقبال طلب الالتحاق بنجاح! سيتم التواصل معك قريباً.' : 'Enrollment request received successfully! We will contact you soon.');

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        whatsappNumber: '',
        nationality: '',
        currentCountry: '',
        gender: '',
        educationLevel: '',
        age: '',
        courseId: courseId || '',
        courseName: courseName || '',
        roundId: roundId || '',
        roundNumber: roundNumber || 1,
        message: '',
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error('Enrollment error:', error);
      setErrorMessage(isArabic ? 'حدث خطأ أثناء المعالجة. يرجى المحاولة مجدداً.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <Card sx={{ m: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto', flex: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isArabic ? 'نموذج الالتحاق' : 'Enrollment Form'}
            </Typography>
          </Box>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Course Display */}
          {courseName && (
            <Box sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {isArabic ? 'الدورة' : 'Course'}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {courseName}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isArabic ? 'الاسم الأول' : 'First Name'}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  size="small"
                  disabled={loading}
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isArabic ? 'الاسم الأخير' : 'Last Name'}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  size="small"
                  disabled={loading}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isArabic ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  size="small"
                  disabled={loading}
                />
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isArabic ? 'رقم الهاتف' : 'Phone Number'}
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  size="small"
                  disabled={loading}
                  placeholder="+966..."
                />
              </Grid>

              {/* WhatsApp Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isArabic ? 'رقم WhatsApp' : 'WhatsApp Number'}
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  error={!!errors.whatsappNumber}
                  helperText={errors.whatsappNumber}
                  size="small"
                  disabled={loading}
                  placeholder="+966..."
                />
              </Grid>

              {/* Nationality */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isArabic ? 'الجنسية (اختيارية)' : 'Nationality (Optional)'}
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  error={!!errors.nationality}
                  helperText={errors.nationality}
                  size="small"
                  disabled={loading}
                />
              </Grid>

              {/* Current Country */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isArabic ? 'الدولة الحالية' : 'Current Country'}
                  name="currentCountry"
                  value={formData.currentCountry}
                  onChange={handleInputChange}
                  error={!!errors.currentCountry}
                  helperText={errors.currentCountry}
                  size="small"
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.gender}>
                  <InputLabel>{isArabic ? 'الجنس' : 'Gender'}</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label={isArabic ? 'الجنس' : 'Gender'}
                    disabled={loading}
                  >
                    <MenuItem value="male">{isArabic ? 'ذكر' : 'Male'}</MenuItem>
                    <MenuItem value="female">{isArabic ? 'أنثى' : 'Female'}</MenuItem>
                    <MenuItem value="other">{isArabic ? 'آخر' : 'Other'}</MenuItem>
                  </Select>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Age */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isArabic ? 'العمر' : 'Age'}
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  error={!!errors.age}
                  helperText={errors.age}
                  size="small"
                  disabled={loading}
                  inputProps={{ min: 13, max: 120 }}
                />
              </Grid>

              {/* Education Level */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" error={!!errors.educationLevel}>
                  <InputLabel>{isArabic ? 'مستوى التعليم' : 'Education Level'}</InputLabel>
                  <Select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    label={isArabic ? 'مستوى التعليم' : 'Education Level'}
                    disabled={loading}
                  >
                    <MenuItem value="high_school">{isArabic ? 'الثانوية العامة' : 'High School'}</MenuItem>
                    <MenuItem value="diploma">{isArabic ? 'دبلوم' : 'Diploma'}</MenuItem>
                    <MenuItem value="bachelor">{isArabic ? 'بكالوريوس' : 'Bachelor'}</MenuItem>
                    <MenuItem value="master">{isArabic ? 'ماجستير' : 'Master'}</MenuItem>
                    <MenuItem value="phd">{isArabic ? 'دكتوراه' : 'PhD'}</MenuItem>
                  </Select>
                  {errors.educationLevel && <FormHelperText>{errors.educationLevel}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Message */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isArabic ? 'ملاحظات إضافية (اختياري)' : 'Additional Message (Optional)'}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  size="small"
                  multiline
                  rows={3}
                  disabled={loading}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? (isArabic ? 'جاري المعالجة...' : 'Processing...') : (isArabic ? 'التحق الآن' : 'Enroll Now')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Dialog>
  );
};

export default EnrollmentForm;