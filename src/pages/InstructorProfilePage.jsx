import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import InstructorProfileManager from '../components/sessions/instructor/InstructorProfileManager';

const InstructorProfilePage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');

  // Load instructor profile data
  useEffect(() => {
    const loadInstructorProfile = async () => {
      if (!currentUser?.uid) {
        setError('No user found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get current user's full profile
        const userData = await userService.getUserById(currentUser.uid);
        setInstructor(userData);
        
      } catch (err) {
        console.error('Error loading instructor profile:', err);
        setError(t('instructor.profile.errorLoading', 'Error loading instructor profile'));
      } finally {
        setLoading(false);
      }
    };

    loadInstructorProfile();
  }, [currentUser?.uid, t]);

  const handleSaveProfile = async (profileData) => {
    try {
      setError(null);
      setUpdateMessage('');
      
      // Update instructor profile
      await userService.updateUserProfile(currentUser.uid, {
        instructorProfile: {
          ...instructor.instructorProfile,
          ...profileData,
          isActive: true
        }
      });
      
      // Reload the data
      const updatedUserData = await userService.getUserById(currentUser.uid);
      setInstructor(updatedUserData);
      
      setUpdateMessage(t('instructor.profile.updateSuccess', 'Profile updated successfully!'));
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating instructor profile:', err);
      setError(t('instructor.profile.errorUpdating', 'Error updating profile'));
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Page Header */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {t('instructor.profile.title', 'Instructor Profile')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          {t('instructor.profile.subtitle', 'Manage your instructor profile and teaching information')}
        </Typography>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {updateMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {updateMessage}
        </Alert>
      )}

      {/* Profile Manager */}
      {instructor && (
        <InstructorProfileManager 
          instructor={instructor}
          onSave={handleSaveProfile}
        />
      )}

      {/* Help Text */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('instructor.profile.helpTitle', 'Profile Tips')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('instructor.profile.helpText', 
            'Complete your profile to attract more students. Include your qualifications, teaching experience, and specialties to help students find the perfect match for their learning needs.'
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default InstructorProfilePage;