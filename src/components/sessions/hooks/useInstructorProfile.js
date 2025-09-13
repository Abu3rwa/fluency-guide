import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for managing instructor profile state and operations
 * Separates profile management logic from UI components
 * 
 * @param {Object} instructor - Initial instructor data
 * @returns {Object} Profile management state and handlers
 */
export const useInstructorProfile = (instructor = {}) => {
  const { t } = useTranslation();
  
  // Form state management
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    qualifications: [],
    hourlyRate: 0,
    currency: 'USD',
    subjects: [],
    specialties: [],
    experience: '',
    profileImage: ''
  });

  // Initialize form data when instructor prop changes
  useEffect(() => {
    if (instructor && instructor.instructorProfile) {
      setFormData({
        bio: instructor.instructorProfile.bio || '',
        qualifications: instructor.instructorProfile.qualifications || [],
        hourlyRate: instructor.instructorProfile.hourlyRate || 0,
        currency: instructor.instructorProfile.currency || 'USD',
        subjects: instructor.instructorProfile.subjects || instructor.instructorProfile.languages || [],
        specialties: instructor.instructorProfile.specialties || [],
        experience: instructor.instructorProfile.experience || '',
        profileImage: instructor.photoURL || ''
      });
    }
  }, [instructor]);

  // Form field handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, index, field) => {
    const values = [...formData[field]];
    values[index] = e.target.value;
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleAddField = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleRemoveField = (field, index) => {
    const values = [...formData[field]];
    values.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  // Profile image update handler
  const updateProfileImage = (imageUrl) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  // Validation logic
  const validateForm = () => {
    const errors = {};
    
    if (!formData.bio.trim()) {
      errors.bio = t('instructor.profile.validation.bioRequired', 'Bio is required');
    }
    
    if (formData.hourlyRate <= 0) {
      errors.hourlyRate = t('instructor.profile.validation.hourlyRateRequired', 'Please set a valid hourly rate');
    }
    
    if (formData.subjects.length === 0 || formData.subjects.every(subject => !subject.trim())) {
      errors.subjects = t('instructor.profile.validation.subjectsRequired', 'At least one subject is required');
    }
    
    return errors;
  };

  // Save profile data
  const saveProfile = (onSave) => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      return { success: false, errors: validationErrors };
    }
    
    // Clean up empty array entries
    const cleanedData = {
      ...formData,
      qualifications: formData.qualifications.filter(qual => qual.trim()),
      subjects: formData.subjects.filter(subject => subject.trim()),
      specialties: formData.specialties.filter(specialty => specialty.trim()),
      hourlyRate: parseFloat(formData.hourlyRate)
    };
    
    if (onSave) {
      onSave(cleanedData);
    }
    
    setIsEditing(false);
    return { success: true, data: cleanedData };
  };

  // Cancel editing
  const cancelEdit = () => {
    // Reset form data to original instructor data
    if (instructor && instructor.instructorProfile) {
      setFormData({
        bio: instructor.instructorProfile.bio || '',
        qualifications: instructor.instructorProfile.qualifications || [],
        hourlyRate: instructor.instructorProfile.hourlyRate || 0,
        currency: instructor.instructorProfile.currency || 'USD',
        subjects: instructor.instructorProfile.subjects || instructor.instructorProfile.languages || [],
        specialties: instructor.instructorProfile.specialties || [],
        experience: instructor.instructorProfile.experience || '',
        profileImage: instructor.photoURL || ''
      });
    }
    setIsEditing(false);
  };

  return {
    // State
    isEditing,
    formData,
    
    // Actions
    setIsEditing,
    handleChange,
    handleArrayChange,
    handleAddField,
    handleRemoveField,
    updateProfileImage,
    saveProfile,
    cancelEdit,
    validateForm
  };
};

export default useInstructorProfile;