import React, { useRef, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Paper,
  Avatar,
  Divider,
  Chip,
  Alert,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useInstructorProfile, useImageUpload } from '../hooks';
import { availabilityService } from '../../../services/sessionService';
import { useAuth } from '../../../contexts/AuthContext';
import InstructorAvailabilityManager from './InstructorAvailabilityManager';

const InstructorProfileManager = ({ 
  instructor = {}, 
  onSave = () => {}
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // Tab management
  const [activeTab, setActiveTab] = useState(0);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  
  // Use custom hooks for logic separation
  const {
    isEditing,
    formData,
    setIsEditing,
    handleChange,
    handleArrayChange,
    handleAddField,
    handleRemoveField,
    updateProfileImage,
    saveProfile,
    cancelEdit
  } = useInstructorProfile(instructor);
  
  const {
    uploading: imageUploading,
    uploadError,
    uploadProgress,
    previewUrl,
    fileInputRef,
    handleFileUpload,
    triggerUpload,
    clearError
  } = useImageUpload({
    onUploadSuccess: (imageUrl) => {
      updateProfileImage(imageUrl);
    },
    onUploadError: (error) => {
      console.error('Image upload error:', error);
    }
  });

  // Handle saving with validation
  const handleSave = () => {
    const result = saveProfile(onSave);
    if (!result.success && result.errors) {
      console.error('Validation errors:', result.errors);
      // Could show validation errors in UI here
    }
  };
  
  // Handle cancel editing
  const handleCancel = () => {
    cancelEdit();
    clearError(); // Clear any upload errors
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle availability save
  const handleAvailabilitySave = async (availabilityData) => {
    if (!currentUser?.uid) {
      setAvailabilityError('User not authenticated');
      return;
    }

    try {
      setAvailabilitySaving(true);
      setAvailabilityError(null);
      
      // Process each availability slot
      const promises = availabilityData.map(async (slot) => {
        const availabilitySlot = {
          instructorId: currentUser.uid,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isRecurring: slot.isRecurring || false,
          timeZone: slot.timeZone || 'Africa/Tripoli',
          isPattern: slot.isPattern || false,
          patternType: slot.patternType || null,
          daysOfWeek: slot.daysOfWeek || [],
          startDate: slot.startDate || slot.date
        };
        
        if (slot.id && slot.id.startsWith('existing-')) {
          // Update existing slot
          const existingId = slot.id.replace('existing-', '');
          return availabilityService.update(existingId, availabilitySlot);
        } else {
          // Create new slot
          return availabilityService.create(availabilitySlot);
        }
      });
      
      await Promise.all(promises);
      
      // Also update the instructor's profile with availability summary
      onSave({ 
        ...instructor, 
        availability: {
          ...instructor.availability,
          lastUpdated: new Date(),
          slotsCount: availabilityData.length
        }
      });
      
      console.log('Availability saved successfully');
    } catch (error) {
      console.error('Error saving availability:', error);
      setAvailabilityError(t('instructor.profile.availability.errorSaving', 'Failed to save availability. Please try again.'));
    } finally {
      setAvailabilitySaving(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {t('instructor.profile.title', 'Instructor Profile')}
        </Typography>
        
        {!isEditing && (
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => setIsEditing(true)}
          >
            {t('instructor.profile.editProfile', 'Edit Profile')}
          </Button>
        )}
      </Box>
      
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="instructor profile tabs">
          <Tab 
            icon={<PersonIcon />} 
            label={t('instructor.profile.tabs.profile', 'Profile')} 
            iconPosition="start"
          />
          <Tab 
            icon={<ScheduleIcon />} 
            label={t('instructor.profile.tabs.availability', 'Availability')} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {isEditing ? (
        <Box>
          {/* Profile Image Upload Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('instructor.profile.profileImage', 'Profile Image')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar 
                src={previewUrl || formData.profileImage || instructor.photoURL} 
                alt={instructor.displayName}
                sx={{ 
                  width: 80, 
                  height: 80,
                  border: `2px solid ${theme.palette.primary.main}` // Vibrant Purple border
                }}
              />
              
              <Box>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={imageUploading ? <CloudUploadIcon /> : <PhotoCameraIcon />}
                  onClick={triggerUpload}
                  disabled={imageUploading}
                  sx={{ mb: 1 }}
                >
                  {imageUploading 
                    ? t('instructor.profile.uploading', 'Uploading...') 
                    : t('instructor.profile.changePhoto', 'Change Photo')
                  }
                </Button>
                
                {imageUploading && (
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ mt: 1, width: '200px' }} 
                  />
                )}
                
                <Typography variant="caption" display="block" color="text.secondary">
                  {t('instructor.profile.imageRequirements', 'Max 5MB, JPG/PNG format')}
                </Typography>
              </Box>
            </Box>
            
            {uploadError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadError}
              </Alert>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <TextField
            label={t('instructor.profile.bio', 'Bio')}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.qualifications', 'Qualifications')}
          </Typography>
          
          {formData.qualifications.map((qual, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label={t('instructor.profile.qualificationNumber', 'Qualification {{number}}', { number: index + 1 })}
                value={qual}
                onChange={(e) => handleArrayChange(e, index, 'qualifications')}
                fullWidth
              />
              <Button 
                onClick={() => handleRemoveField('qualifications', index)}
                color="error"
                sx={{ minWidth: 'auto' }}
              >
                {t('common.remove', 'Remove')}
              </Button>
            </Box>
          ))}
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => handleAddField('qualifications')}
            sx={{ mb: 2 }}
          >
            {t('instructor.profile.addQualification', 'Add Qualification')}
          </Button>
          
          <Divider sx={{ my: 2 }} />
          
          <TextField
            label={t('instructor.profile.experience', 'Teaching Experience')}
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            placeholder={t('instructor.profile.experiencePlaceholder', 'Describe your teaching experience, years of practice, and notable achievements...')}
            sx={{ mb: 2 }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label={t('instructor.profile.hourlyRate', 'Hourly Rate')}
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              type="number"
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
            
            <TextField
              label={t('instructor.profile.currency', 'Currency')}
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              fullWidth
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.subjectsTaught', 'Subjects Taught')}
          </Typography>
          
          {formData.subjects.map((subject, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label={t('instructor.profile.subjectNumber', 'Subject {{number}}', { number: index + 1 })}
                value={subject}
                onChange={(e) => handleArrayChange(e, index, 'subjects')}
                fullWidth
                placeholder={t('instructor.profile.subjectPlaceholder', 'e.g., Mathematics, Physics, English')}
              />
              <Button 
                onClick={() => handleRemoveField('subjects', index)}
                color="error"
                sx={{ minWidth: 'auto' }}
              >
                {t('common.remove', 'Remove')}
              </Button>
            </Box>
          ))}
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => handleAddField('subjects')}
            sx={{ mb: 2 }}
          >
            {t('instructor.profile.addSubject', 'Add Subject')}
          </Button>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.teachingSpecialties', 'Teaching Specialties')}
          </Typography>
          
          {formData.specialties.map((specialty, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label={t('instructor.profile.specialtyNumber', 'Specialty {{number}}', { number: index + 1 })}
                value={specialty}
                onChange={(e) => handleArrayChange(e, index, 'specialties')}
                fullWidth
                placeholder={t('instructor.profile.specialtyPlaceholder', 'e.g., Advanced Topics, Exam Preparation')}
              />
              <Button 
                onClick={() => handleRemoveField('specialties', index)}
                color="error"
                sx={{ minWidth: 'auto' }}
              >
                {t('common.remove', 'Remove')}
              </Button>
            </Box>
          ))}
          
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => handleAddField('specialties')}
            sx={{ mb: 2 }}
          >
            {t('instructor.profile.addSpecialty', 'Add Specialty')}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSave}
            >
              {t('instructor.profile.saveChanges', 'Save Changes')}
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={handleCancel}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
          </Box>
        </Box>
        ) : (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar 
              src={instructor.photoURL} 
              alt={instructor.displayName}
              sx={{ width: 64, height: 64 }}
            />
            <Box>
              <Typography variant="h6">
                {instructor.displayName}
              </Typography>
              <Typography color="text.secondary">
                {instructor.email}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.bio', 'Bio')}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {instructor.instructorProfile?.bio || t('instructor.profile.noBio', 'No bio provided')}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.experience', 'Teaching Experience')}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {instructor.instructorProfile?.experience || t('instructor.profile.noExperience', 'No experience information provided')}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.qualifications', 'Qualifications')}
          </Typography>
          {instructor.instructorProfile?.qualifications?.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {instructor.instructorProfile.qualifications.map((qual, index) => (
                <Chip 
                  key={index} 
                  label={qual} 
                  color="primary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" gutterBottom>
              {t('instructor.profile.noQualifications', 'No qualifications listed')}
            </Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Typography variant="subtitle1">
              {t('instructor.profile.hourlyRate', 'Hourly Rate')}:
            </Typography>
            <Typography>
              {instructor.instructorProfile?.currency || 'USD'}{instructor.instructorProfile?.hourlyRate || 0}/hr
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.subjectsTaught', 'Subjects Taught')}
          </Typography>
          {(instructor.instructorProfile?.subjects || instructor.instructorProfile?.languages)?.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {(instructor.instructorProfile.subjects || instructor.instructorProfile.languages).map((subject, index) => (
                <Chip 
                  key={index} 
                  label={subject} 
                  color="secondary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" gutterBottom>
              {t('instructor.profile.noSubjects', 'No subjects listed')}
            </Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t('instructor.profile.teachingSpecialties', 'Teaching Specialties')}
          </Typography>
          {instructor.instructorProfile?.specialties?.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {instructor.instructorProfile.specialties.map((specialty, index) => (
                <Chip 
                  key={index} 
                  label={specialty} 
                  color="secondary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" gutterBottom>
              {t('instructor.profile.noSpecialties', 'No specialties listed')}
            </Typography>
          )}
        </Box>
        )}
      </Box>
      )}
      
      {/* Availability Tab Content */}
      {activeTab === 1 && (
        <Box>
          {availabilityError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {availabilityError}
            </Alert>
          )}
          
          <InstructorAvailabilityManager 
            currentAvailability={instructor.availability?.slots || []}
            onSave={handleAvailabilitySave}
            loading={availabilitySaving}
          />
        </Box>
      )}
    </Paper>
  );
};

export default InstructorProfileManager;