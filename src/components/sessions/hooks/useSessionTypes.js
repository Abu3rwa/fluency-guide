import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { sessionTypeService } from '../../../services/sessionService';
import { getInstructors } from '../../../services/userService';

/**
 * Custom hook for managing session types
 * Handles loading, filtering, and CRUD operations for session types
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoLoad - Whether to auto-load data on mount
 * @param {boolean} options.includeInstructorInfo - Whether to include instructor information
 * @returns {Object} Session types state and handlers
 */
export const useSessionTypes = (options = {}) => {
  const { t } = useTranslation();
  const { autoLoad = true, includeInstructorInfo = true } = options;

  // State management
  const [sessionTypes, setSessionTypes] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    active: null, // null = all, true = active only, false = inactive only
    instructorId: null,
    priceRange: { min: 0, max: 1000 },
    duration: null
  });

  // Load session types data
  const loadSessionTypes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const promises = [sessionTypeService.getAll()];
      
      if (includeInstructorInfo) {
        promises.push(getInstructors());
      }
      
      const results = await Promise.all(promises);
      const [sessionTypesData, instructorsData = []] = results;
      
      // Process session types with instructor information
      const processedSessionTypes = sessionTypesData.map(sessionType => {
        const instructor = instructorsData.find(inst => 
          inst.id === sessionType.instructorId || inst.id === sessionType.createdBy
        );
        
        return {
          ...sessionType,
          instructorName: instructor?.displayName || t('sessions.types.unknownInstructor', 'Unknown Instructor'),
          instructorAvatar: instructor?.photoURL || '',
          instructorRating: instructor?.instructorProfile?.rating?.average || 0,
          instructorEmail: instructor?.email || ''
        };
      });
      
      setSessionTypes(processedSessionTypes);
      if (includeInstructorInfo) {
        setInstructors(instructorsData);
      }
      
    } catch (err) {
      console.error('Error loading session types:', err);
      setError(t('sessions.types.messages.loadError', 'Failed to load session types'));
    } finally {
      setLoading(false);
    }
  };

  // Load public/active session types only
  const loadPublicSessionTypes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const promises = [sessionTypeService.getPublicActive()];
      
      if (includeInstructorInfo) {
        promises.push(getInstructors());
      }
      
      const results = await Promise.all(promises);
      const [sessionTypesData, instructorsData = []] = results;
      
      const processedSessionTypes = sessionTypesData.map(sessionType => {
        const instructor = instructorsData.find(inst => 
          inst.id === sessionType.instructorId || inst.id === sessionType.createdBy
        );
        
        return {
          ...sessionType,
          instructorName: instructor?.displayName || t('sessions.types.unknownInstructor', 'Unknown Instructor'),
          instructorAvatar: instructor?.photoURL || '',
          instructorRating: instructor?.instructorProfile?.rating?.average || 0,
          instructorEmail: instructor?.email || ''
        };
      });
      
      setSessionTypes(processedSessionTypes);
      if (includeInstructorInfo) {
        setInstructors(instructorsData);
      }
      
    } catch (err) {
      console.error('Error loading public session types:', err);
      setError(t('sessions.types.messages.loadError', 'Failed to load session types'));
    } finally {
      setLoading(false);
    }
  };

  // Create new session type
  const createSessionType = async (sessionTypeData) => {
    try {
      setLoading(true);
      
      const newSessionType = await sessionTypeService.create(sessionTypeData);
      
      // Add to current list
      setSessionTypes(prev => [...prev, {
        ...newSessionType,
        instructorName: sessionTypeData.instructorName || t('sessions.types.unknownInstructor', 'Unknown Instructor'),
        instructorAvatar: sessionTypeData.instructorAvatar || '',
        instructorRating: sessionTypeData.instructorRating || 0
      }]);
      
      return { success: true, data: newSessionType };
    } catch (err) {
      console.error('Error creating session type:', err);
      const errorMessage = t('sessions.types.messages.createError', 'Failed to create session type');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update session type
  const updateSessionType = async (id, updates) => {
    try {
      setLoading(true);
      
      const updatedSessionType = await sessionTypeService.update(id, updates);
      
      // Update in current list
      setSessionTypes(prev => prev.map(st => 
        st.id === id ? { ...st, ...updatedSessionType } : st
      ));
      
      return { success: true, data: updatedSessionType };
    } catch (err) {
      console.error('Error updating session type:', err);
      const errorMessage = t('sessions.types.messages.updateError', 'Failed to update session type');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete session type
  const deleteSessionType = async (id) => {
    try {
      setLoading(true);
      
      await sessionTypeService.delete(id);
      
      // Remove from current list
      setSessionTypes(prev => prev.filter(st => st.id !== id));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting session type:', err);
      const errorMessage = t('sessions.types.messages.deleteError', 'Failed to delete session type');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Filter session types
  const getFilteredSessionTypes = () => {
    return sessionTypes.filter(sessionType => {
      // Active filter
      if (filters.active !== null && sessionType.active !== filters.active) {
        return false;
      }
      
      // Instructor filter
      if (filters.instructorId && sessionType.instructorId !== filters.instructorId) {
        return false;
      }
      
      // Price range filter
      if (sessionType.price < filters.priceRange.min || sessionType.price > filters.priceRange.max) {
        return false;
      }
      
      // Duration filter
      if (filters.duration && sessionType.duration !== filters.duration) {
        return false;
      }
      
      return true;
    });
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      active: null,
      instructorId: null,
      priceRange: { min: 0, max: 1000 },
      duration: null
    });
  };

  // Get session types by instructor
  const getSessionTypesByInstructor = (instructorId) => {
    return sessionTypes.filter(st => st.instructorId === instructorId);
  };

  // Get unique instructors from session types
  const getUniqueInstructors = () => {
    const instructorMap = new Map();
    
    sessionTypes.forEach(sessionType => {
      if (!instructorMap.has(sessionType.instructorId)) {
        instructorMap.set(sessionType.instructorId, {
          id: sessionType.instructorId,
          name: sessionType.instructorName,
          avatar: sessionType.instructorAvatar,
          rating: sessionType.instructorRating,
          email: sessionType.instructorEmail
        });
      }
    });
    
    return Array.from(instructorMap.values());
  };

  // Auto-load data on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadSessionTypes();
    }
  }, [autoLoad]);

  return {
    // State
    sessionTypes,
    instructors,
    loading,
    error,
    filters,
    
    // Computed
    filteredSessionTypes: getFilteredSessionTypes(),
    uniqueInstructors: getUniqueInstructors(),
    
    // Actions
    loadSessionTypes,
    loadPublicSessionTypes,
    createSessionType,
    updateSessionType,
    deleteSessionType,
    updateFilters,
    clearFilters,
    getSessionTypesByInstructor,
    
    // Utility
    setError
  };
};

export default useSessionTypes;