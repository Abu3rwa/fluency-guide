import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SessionTypeManagement from '../components/sessions/instructor/SessionTypeManagement';
import { useAuth } from '../contexts/AuthContext';

const SessionTypesPage = () => {
  const { t } = useTranslation();
  const { currentUser, userData } = useAuth();
  
  // Determine if user is admin or instructor
  const isAdmin = userData?.isAdmin;
  const isInstructor = userData?.role === 'instructor' || userData?.isInstructor;

  // Access control
  if (!currentUser || !userData || (!isAdmin && !isInstructor)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          {t('sessions.accessDenied', 'Access denied. You need instructor or admin privileges to manage session types.')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isAdmin 
          ? t('sessions.admin.sessionTypeManagement', 'Session Type Management')
          : t('sessions.instructor.sessionTypeManagement', 'Manage Session Types')
        }
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {isAdmin 
          ? t('sessions.admin.sessionTypeDescription', 'Manage different types of private sessions offered by instructors. Define pricing, duration, and availability for each session type.')
          : t('sessions.instructor.sessionTypeDescription', 'Create and manage your private session types. Define pricing, duration, and availability for your sessions.')
        }
      </Typography>

      <SessionTypeManagement />
    </Box>
  );
};

export default SessionTypesPage;