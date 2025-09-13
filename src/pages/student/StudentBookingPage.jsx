import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import StudentBookingInterface from '../../components/sessions/booking/StudentBookingInterface';

const StudentBookingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('student.sessions.booking.title', 'Book a Private Session')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('student.sessions.booking.pageDescription', 'Choose from our qualified instructors and book a personalized English learning session that fits your schedule.')}
      </Typography>

      <StudentBookingInterface />
    </Box>
  );
};

export default StudentBookingPage;