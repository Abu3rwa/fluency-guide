import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for managing image upload functionality
 * Handles file validation, upload state, and error management
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onUploadSuccess - Callback when upload succeeds
 * @param {Function} options.onUploadError - Callback when upload fails
 * @param {number} options.maxSizeBytes - Maximum file size in bytes (default: 5MB)
 * @param {Array<string>} options.allowedTypes - Allowed MIME types (default: image/*)
 * @returns {Object} Image upload state and handlers
 */
export const useImageUpload = (options = {}) => {
  const { t } = useTranslation();
  
  const {
    onUploadSuccess,
    onUploadError,
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  // State management
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // File input reference
  const fileInputRef = useRef(null);

  // File validation
  const validateFile = (file) => {
    if (!file) {
      return { isValid: false, error: t('imageUpload.validation.noFileSelected', 'No file selected') };
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return { 
        isValid: false, 
        error: t('imageUpload.validation.invalidFileType', 'Please select a valid image file') 
      };
    }

    // Check specific allowed types if specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: t('imageUpload.validation.unsupportedFormat', 'Unsupported image format') 
      };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return { 
        isValid: false, 
        error: t('imageUpload.validation.fileTooLarge', `File size must be less than ${maxSizeMB}MB`) 
      };
    }

    return { isValid: true, error: null };
  };

  // Handle file selection and upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      setUploadError(validation.error);
      if (onUploadError) {
        onUploadError(validation.error);
      }
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress(0);

    try {
      // Create preview URL for immediate display
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 90);
        });
      }, 200);

      // In a real implementation, this would upload to Firebase Storage
      // For now, simulate upload with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Simulate getting the final URL from storage
      const uploadedUrl = objectUrl; // In real implementation, this would be the Firebase Storage URL
      
      if (onUploadSuccess) {
        onUploadSuccess(uploadedUrl, file);
      }
      
      console.log('Image uploaded successfully:', file.name);
      
    } catch (error) {
      console.error('Failed to upload image:', error);
      const errorMessage = t('imageUpload.messages.uploadFailed', 'Failed to upload image. Please try again.');
      setUploadError(errorMessage);
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after delay
    }
  };

  // Trigger file input
  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear upload state
  const clearUpload = () => {
    setUploadError('');
    setUploadProgress(0);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset error state
  const clearError = () => {
    setUploadError('');
  };

  return {
    // State
    uploading,
    uploadError,
    uploadProgress,
    previewUrl,
    fileInputRef,
    
    // Actions
    handleFileUpload,
    triggerUpload,
    clearUpload,
    clearError,
    validateFile
  };
};

export default useImageUpload;