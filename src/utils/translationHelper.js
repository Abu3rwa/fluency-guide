// Translation Helper Utility
// This utility helps manage translations and prevent missing keys

import i18n from "i18next";

/**
 * Check if a translation key exists in the current language
 * @param {string} key - The translation key to check
 * @returns {boolean} - True if the key exists, false otherwise
 */
export const hasTranslation = (key) => {
  try {
    const translation = i18n.t(key);
    return translation !== key; // If the key is returned as-is, it means it doesn't exist
  } catch (error) {
    console.warn(`Translation key check failed for: ${key}`, error);
    return false;
  }
};

/**
 * Get a translation with fallback
 * @param {string} key - The translation key
 * @param {string} fallback - Fallback text if key doesn't exist
 * @param {object} options - i18next options
 * @returns {string} - The translation or fallback
 */
export const getTranslationWithFallback = (
  key,
  fallback = "",
  options = {}
) => {
  try {
    const translation = i18n.t(key, options);
    if (translation === key) {
      console.warn(`Missing translation key: ${key}`);
      return fallback || key;
    }
    return translation;
  } catch (error) {
    console.warn(`Translation failed for key: ${key}`, error);
    return fallback || key;
  }
};

/**
 * Log all missing translation keys in the current language
 * @param {object} keys - Object containing all expected translation keys
 */
export const logMissingTranslations = (keys) => {
  const missingKeys = [];

  const checkKeys = (obj, prefix = "") => {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object") {
        checkKeys(obj[key], fullKey);
      } else {
        if (!hasTranslation(fullKey)) {
          missingKeys.push(fullKey);
        }
      }
    });
  };

  checkKeys(keys);

  if (missingKeys.length > 0) {
    console.warn("Missing translation keys:", missingKeys);
  }

  return missingKeys;
};

/**
 * Common translation keys that should exist in all languages
 */
export const COMMON_KEYS = {
  studentCourseDetails: {
    page: {
      viewMaterials: "View Materials",
      supportFaq: "Support & FAQ",
      fetchReviewsError: "Error loading reviews",
      loadDetailsError: "Error loading course details",
      lessonUndone: "Lesson completion undone",
    },
    header: {
      introAriaLabel: "Course introduction video",
      role: "Role",
      enrollNow: "Enroll Now",
      startLearning: "Start Learning",
    },
    moduleList: {
      title: "Course Modules",
      showAll: "Show All Modules",
    },
    overview: {
      title: "Course Overview",
      objectives: "Learning Objectives",
      whatYouWillLearn: "What You Will Learn",
      viewMore: "View More",
    },
    progressStats: {
      title: "Your Progress",
      lessons: "Lessons Completed",
    },
    contentOutline: {
      ariaLabel: "Course content outline",
      title: "Course Content",
      markAsCompleted: "Mark as Completed",
      lessonCompleted: "Lesson completed successfully",
      undo: "Undo",
    },
    reviews: {
      title: "Course Reviews",
      noReviews: "No reviews yet. Be the first to review this course!",
      addEdit: "Add/Edit Review",
      submitTitle: "Submit Your Review",
      yourReview: "Your Review",
      cancel: "Cancel",
      submit: "Submit Review",
    },
    materialsDialog: {
      title: "Course Materials",
      close: "Close",
    },
    instructorInfo: {
      title: "Instructor Information",
      support: "Instructor Support",
      email: "Email",
      hours: "Support Hours",
      responseTime: "Response Time",
    },
    supportDialog: {
      title: "Course Support",
      contactSupport: "Contact Support",
      email: "Support Email",
      hours: "Support Hours",
      responseTime: "Average Response Time",
      close: "Close",
    },
  },
};

// Log missing translations on development
if (process.env.NODE_ENV === "development") {
  setTimeout(() => {
    logMissingTranslations(COMMON_KEYS);
  }, 1000);
}

export default {
  hasTranslation,
  getTranslationWithFallback,
  logMissingTranslations,
  COMMON_KEYS,
};
