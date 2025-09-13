// Session Hooks - Centralized Logic for Session Components
// This file exports all session-related custom hooks for easy importing

export { useInstructorProfile } from './useInstructorProfile';
export { useImageUpload } from './useImageUpload';
export { useAvailabilityManager } from './useAvailabilityManager';
export { useSessionBooking } from './useSessionBooking';
export { useSessionTypes } from './useSessionTypes';

// Re-export as default for compatibility
export default {
  useInstructorProfile: require('./useInstructorProfile').useInstructorProfile,
  useImageUpload: require('./useImageUpload').useImageUpload,
  useAvailabilityManager: require('./useAvailabilityManager').useAvailabilityManager,
  useSessionBooking: require('./useSessionBooking').useSessionBooking,
  useSessionTypes: require('./useSessionTypes').useSessionTypes,
};