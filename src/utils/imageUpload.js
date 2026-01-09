import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads an image file to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path in Firebase Storage (e.g., 'courses', 'instructors')
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadImage = async (file, folder = 'course-thumbnails') => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB');
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomId}-${file.name}`;
    
    // Create reference to storage location
    const fileRef = ref(storage, `${folder}/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(fileRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Deletes an image from Firebase Storage using its URL
 * @param {string} imageUrl - The Firebase Storage download URL
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error('No image URL provided');
  }

  try {
    // Extract the file path from the download URL
    const urlParams = new URL(imageUrl).searchParams;
    const filePath = decodeURIComponent(urlParams.get('alt') || '');
    
    if (!filePath) {
      // If extraction fails, try another method
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      if (imageUrl.includes(baseUrl)) {
        const pathStart = imageUrl.indexOf('/o/') + 3;
        const pathEnd = imageUrl.indexOf('?');
        const encodedPath = imageUrl.substring(pathStart, pathEnd);
        const decodedPath = decodeURIComponent(encodedPath);
        
        const fileRef = ref(storage, decodedPath);
        await deleteObject(fileRef);
        console.log('Image deleted successfully');
        return;
      }
    }

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Uploads multiple images to Firebase Storage
 * @param {File[]} files - Array of image files
 * @param {string} folder - The folder path in Firebase Storage
 * @returns {Promise<string[]>} - Array of download URLs
 */
export const uploadMultipleImages = async (files, folder = 'course-thumbnails') => {
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Uploads an image and returns metadata
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder path in Firebase Storage
 * @returns {Promise<Object>} - Object containing URL and metadata
 */
export const uploadImageWithMetadata = async (file, folder = 'course-thumbnails') => {
  const url = await uploadImage(file, folder);

  return {
    url,
    filename: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
};
