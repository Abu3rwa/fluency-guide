import { useMemo, useCallback } from 'react';
import { 
  FILTER_CATEGORIES, 
  SORT_OPTIONS, 
  DURATION_FILTERS 
} from '../constants';

/**
 * Custom hook for filtering and sorting courses
 * Provides reusable logic for course filtering across different components
 */
export const useCourseFiltering = (courses, filters, sortBy, bookmarkedCourses = []) => {
  // Filter courses based on active filters
  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    return courses.filter(course => {
      // Bookmarked filter (special case)
      if (filters.category === FILTER_CATEGORIES.BOOKMARKED) {
        return bookmarkedCourses.includes(course.id);
      }
      
      // Search filter - case insensitive search across multiple fields
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        const searchableText = [
          course.title,
          course.description,
          course.shortDescription,
          course.instructorName,
          ...(course.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      // Category filter
      if (filters.category && course.category !== filters.category) return false;
      
      // Level filter
      if (filters.level && course.level !== filters.level) return false;
      
      // Language filter
      if (filters.language && course.language !== filters.language) return false;
      
      // Price filter
      if (filters.price) {
        const coursePrice = course.price || 0;
        switch (filters.price) {
          case 'free':
            if (coursePrice > 0) return false;
            break;
          case 'paid':
            if (coursePrice === 0) return false;
            break;
          case 'under_50':
            if (coursePrice >= 50) return false;
            break;
          case 'under_100':
            if (coursePrice >= 100) return false;
            break;
          default:
            break;
        }
      }
      
      // Duration filter
      if (filters.duration) {
        const duration = course.duration || 0;
        switch (filters.duration) {
          case DURATION_FILTERS.SHORT:
            if (duration >= 5) return false;
            break;
          case DURATION_FILTERS.MEDIUM:
            if (duration < 5 || duration > 20) return false;
            break;
          case DURATION_FILTERS.LONG:
            if (duration <= 20 || duration > 50) return false;
            break;
          case DURATION_FILTERS.EXTENDED:
            if (duration <= 50) return false;
            break;
          default:
            break;
        }
      }
      
      // Rating filter
      if (filters.rating) {
        const courseRating = course.rating || 0;
        const minRating = parseFloat(filters.rating);
        if (courseRating < minRating) return false;
      }
      
      // Additional filters can be added here
      
      return true;
    });
  }, [courses, filters, bookmarkedCourses]);

  // Sort filtered courses
  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    
    sorted.sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.RATING:
          return (b.rating || 0) - (a.rating || 0);
          
        case SORT_OPTIONS.PRICE:
          return (a.price || 0) - (b.price || 0);
          
        case SORT_OPTIONS.NEWEST:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          
        case SORT_OPTIONS.ALPHABETICAL:
          return (a.title || '').localeCompare(b.title || '');
          
        case SORT_OPTIONS.FEATURED:
        default:
          // Featured courses first, then by rating
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.rating || 0) - (a.rating || 0);
      }
    });
    
    return sorted;
  }, [filteredCourses, sortBy]);

  // Pagination logic
  const getPaginatedCourses = useCallback((page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    return sortedCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCourses]);

  const getTotalPages = useCallback((itemsPerPage) => {
    return Math.ceil(sortedCourses.length / itemsPerPage);
  }, [sortedCourses]);

  // Get filter statistics
  const getFilterStats = useCallback(() => {
    return {
      total: courses.length,
      filtered: sortedCourses.length,
      bookmarked: bookmarkedCourses.length,
      free: sortedCourses.filter(course => (course.price || 0) === 0).length,
      paid: sortedCourses.filter(course => (course.price || 0) > 0).length
    };
  }, [courses.length, sortedCourses, bookmarkedCourses.length]);

  return {
    filteredCourses: sortedCourses,
    getPaginatedCourses,
    getTotalPages,
    getFilterStats
  };
};

/**
 * Hook for managing course bookmarks with localStorage persistence
 */
export const useCourseBookmarks = (userId) => {
  const getBookmarks = useCallback(() => {
    try {
      const key = `bookmarked_courses_${userId || 'guest'}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }, [userId]);

  const saveBookmarks = useCallback((bookmarks) => {
    try {
      const key = `bookmarked_courses_${userId || 'guest'}`;
      localStorage.setItem(key, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }, [userId]);

  const toggleBookmark = useCallback((courseId, currentBookmarks, onSuccess, onError) => {
    try {
      const isBookmarked = currentBookmarks.includes(courseId);
      const newBookmarks = isBookmarked
        ? currentBookmarks.filter(id => id !== courseId)
        : [...currentBookmarks, courseId];
      
      saveBookmarks(newBookmarks);
      onSuccess?.(newBookmarks, !isBookmarked);
      
      return newBookmarks;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      onError?.(error);
      return currentBookmarks;
    }
  }, [saveBookmarks]);

  return {
    getBookmarks,
    saveBookmarks,
    toggleBookmark
  };
};

/**
 * Hook for responsive design breakpoints and course grid layout
 */
export const useCourseLayout = () => {
  const getCoursesPerPage = useCallback((isMobile, isTablet) => {
    if (isMobile) return 6;
    if (isTablet) return 9;
    return 12;
  }, []);

  const getGridColumns = useCallback((viewMode, isMobile, isTablet) => {
    if (viewMode === 'list') {
      return { xs: 12 };
    }
    
    if (isMobile) {
      return { xs: 12, sm: 6 };
    }
    
    if (isTablet) {
      return { xs: 12, sm: 6, md: 4 };
    }
    
    return { xs: 12, sm: 6, md: 4, lg: 4 };
  }, []);

  return {
    getCoursesPerPage,
    getGridColumns
  };
};