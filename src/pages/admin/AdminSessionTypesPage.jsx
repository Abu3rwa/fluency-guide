import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SessionTypeManagement from '../../components/sessions/admin/SessionTypeManagement';
import { sessionTypeService } from '../../services/sessionService';
import { useAuth } from '../../contexts/AuthContext';

const AdminSessionTypesPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [sessionTypes, setSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load session types
  useEffect(() => {
    if (currentUser) {
      loadSessionTypes();
    }
  }, [currentUser]);

  const loadSessionTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await sessionTypeService.getAll(currentUser);
      setSessionTypes(types);
    } catch (err) {
      console.error('Error loading session types:', err);
      setError(t('sessions.admin.loadError', 'Failed to load session types. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSessionTypeCreate = async (formData) => {
    try {
      const newTypeId = await sessionTypeService.create(formData, currentUser.uid);
      await loadSessionTypes(); // Reload the list
      console.log('Session type created:', newTypeId);
    } catch (err) {
      console.error('Error creating session type:', err);
      setError(t('sessions.admin.createError', 'Failed to create session type. Please try again.'));
    }
  };

  const handleSessionTypeUpdate = async (typeId, formData) => {
    try {
      await sessionTypeService.update(typeId, formData);
      await loadSessionTypes(); // Reload the list
      console.log('Session type updated:', typeId);
    } catch (err) {
      console.error('Error updating session type:', err);
      setError(t('sessions.admin.updateError', 'Failed to update session type. Please try again.'));
    }
  };

  const handleSessionTypeDelete = async (typeId) => {
    try {
      await sessionTypeService.delete(typeId);
      await loadSessionTypes(); // Reload the list
      console.log('Session type deleted:', typeId);
    } catch (err) {
      console.error('Error deleting session type:', err);
      setError(t('sessions.admin.deleteError', 'Failed to delete session type. Please try again.'));
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>{t('common.loading', 'Loading...')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('sessions.admin.sessionTypeManagement', 'Session Type Management')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('sessions.admin.sessionTypeDescription', 'Manage different types of private sessions offered by instructors. Define pricing, duration, and availability for each session type.')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <SessionTypeManagement
        sessionTypes={sessionTypes}
        onSessionTypeCreate={handleSessionTypeCreate}
        onSessionTypeUpdate={handleSessionTypeUpdate}
        onSessionTypeDelete={handleSessionTypeDelete}
      />
    </Box>
  );
};

export default AdminSessionTypesPage;