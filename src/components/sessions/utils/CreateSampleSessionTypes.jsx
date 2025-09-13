import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { sessionTypeService } from '../../../services/sessionService';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const CreateSampleSessionTypes = ({ onSessionTypesCreated = () => {} }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sampleSessionTypes = [
    {
      name: 'Mathematics Tutoring',
      description: 'Personalized math sessions covering algebra, calculus, geometry, and problem-solving techniques',
      duration: 60,
      price: 30,
      currency: 'USD',
      active: true,
      category: 'mathematics'
    },
    {
      name: 'Physics Fundamentals',
      description: 'Comprehensive physics tutoring including mechanics, thermodynamics, and electromagnetism',
      duration: 75,
      price: 35,
      currency: 'USD',
      active: true,
      category: 'physics'
    },
    {
      name: 'Language Learning',
      description: 'Improve your speaking, reading, and writing skills through interactive conversation practice',
      duration: 45,
      price: 25,
      currency: 'USD',
      active: true,
      category: 'languages'
    },
    {
      name: 'Chemistry Lab Support',
      description: 'Master chemical concepts, reactions, and laboratory techniques with expert guidance',
      duration: 90,
      price: 40,
      currency: 'USD',
      active: true,
      category: 'chemistry'
    },
    {
      name: 'Computer Programming',
      description: 'Learn programming languages, algorithms, and software development best practices',
      duration: 60,
      price: 45,
      currency: 'USD',
      active: true,
      category: 'programming'
    },
    {
      name: 'Test Preparation',
      description: 'Comprehensive exam preparation for standardized tests, university entrance, and professional certifications',
      duration: 90,
      price: 50,
      currency: 'USD',
      active: true,
      category: 'test_prep'
    }
  ];

  const handleCreateSampleSessionTypes = async () => {
    if (!currentUser?.uid) {
      setError(t('sessions.utils.createSample.loginRequired', 'You must be logged in to create session types'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const createdTypes = [];
      for (const sessionType of sampleSessionTypes) {
        const id = await sessionTypeService.create(sessionType, currentUser.uid);
        createdTypes.push({ id, ...sessionType });
      }

      setMessage(t('sessions.utils.createSample.successMessage', 'Successfully created {{count}} sample session types!', { count: createdTypes.length }));
      onSessionTypesCreated(createdTypes);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
      
    } catch (err) {
      console.error('Error creating sample session types:', err);
      setError(t('sessions.utils.createSample.errorMessage', 'Failed to create sample session types. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('sessions.utils.createSample.title', 'Quick Setup: Create Sample Session Types')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('sessions.utils.createSample.description', 'No session types found. Create sample session types for various subjects to get started with bookings.')}
        </Typography>

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {t('sessions.utils.createSample.loading', 'Creating sample session types...')}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Typography variant="subtitle2">{t('sessions.utils.createSample.sampleInclude', 'Sample session types include:')}</Typography>
          {sampleSessionTypes.map((type, index) => (
            <Typography key={index} variant="body2" color="text.secondary">
              • {type.name} ({type.duration} min) - {type.currency}{type.price}
            </Typography>
          ))}
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSampleSessionTypes}
          disabled={loading}
          fullWidth
        >
          {t('sessions.utils.createSample.create', 'Create Sample Session Types')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateSampleSessionTypes;