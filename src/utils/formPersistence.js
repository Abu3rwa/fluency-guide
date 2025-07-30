/**
 * Form Persistence Utilities
 * Handles localStorage operations with error handling and data validation
 */

const STORAGE_PREFIX = "task_form_draft_";
const STORAGE_VERSION = "1.0";
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

/**
 * Generate a unique storage key for form data
 */
export const generateStorageKey = (
  formType,
  courseId,
  lessonId,
  userId = "anonymous"
) => {
  return `${STORAGE_PREFIX}${formType}_${courseId}_${lessonId}_${userId}`;
};

/**
 * Check if localStorage is available and has space
 */
export const isStorageAvailable = () => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn("localStorage is not available:", e);
    return false;
  }
};

/**
 * Get current localStorage usage
 */
export const getStorageUsage = () => {
  if (!isStorageAvailable()) return 0;

  let total = 0;
  const keys = Object.keys(localStorage);
  for (let key of keys) {
    total += localStorage[key].length + key.length;
  }
  return total;
};

/**
 * Check if we can store data without exceeding quota
 */
export const canStoreData = (dataSize) => {
  const currentUsage = getStorageUsage();
  return currentUsage + dataSize < MAX_STORAGE_SIZE;
};

/**
 * Safely save form data to localStorage
 */
export const saveFormData = (key, data) => {
  if (!isStorageAvailable()) {
    console.warn("Cannot save form data: localStorage not available");
    return false;
  }

  try {
    const payload = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data: data,
    };

    const serializedData = JSON.stringify(payload);

    if (!canStoreData(serializedData.length)) {
      console.warn("Cannot save form data: Storage quota would be exceeded");
      // Try to clean up old drafts
      cleanupOldDrafts();

      // Try again after cleanup
      if (!canStoreData(serializedData.length)) {
        return false;
      }
    }

    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error("Error saving form data:", error);
    return false;
  }
};

/**
 * Safely load form data from localStorage
 */
export const loadFormData = (key) => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const serializedData = localStorage.getItem(key);
    if (!serializedData) {
      return null;
    }

    const payload = JSON.parse(serializedData);

    // Validate payload structure
    if (!payload.version || !payload.timestamp || !payload.data) {
      console.warn("Invalid form data structure, removing corrupted data");
      localStorage.removeItem(key);
      return null;
    }

    // Check if data is too old (older than 7 days)
    const dataAge = Date.now() - new Date(payload.timestamp).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (dataAge > maxAge) {
      console.info("Form data is too old, removing expired draft");
      localStorage.removeItem(key);
      return null;
    }

    return {
      data: payload.data,
      timestamp: payload.timestamp,
      version: payload.version,
    };
  } catch (error) {
    console.error("Error loading form data:", error);
    // Remove corrupted data
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Remove form data from localStorage
 */
export const removeFormData = (key) => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error removing form data:", error);
    return false;
  }
};

/**
 * Get all form draft keys for a specific user/course/lesson
 */
export const getFormDraftKeys = (courseId, lessonId, userId = "anonymous") => {
  if (!isStorageAvailable()) {
    return [];
  }

  const pattern = `${STORAGE_PREFIX}.*_${courseId}_${lessonId}_${userId}`;
  const regex = new RegExp(pattern);

  return Object.keys(localStorage).filter((key) => regex.test(key));
};

/**
 * Clean up old or expired drafts
 */
export const cleanupOldDrafts = () => {
  if (!isStorageAvailable()) {
    return 0;
  }

  let cleanedCount = 0;
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(STORAGE_PREFIX)) {
      try {
        const data = localStorage.getItem(key);
        const payload = JSON.parse(data);

        if (payload.timestamp) {
          const age = now - new Date(payload.timestamp).getTime();
          if (age > maxAge) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }
  });

  if (cleanedCount > 0) {
    console.info(`Cleaned up ${cleanedCount} old form drafts`);
  }

  return cleanedCount;
};

/**
 * Get draft metadata for display purposes
 */
export const getDraftMetadata = (key) => {
  const draftData = loadFormData(key);
  if (!draftData) {
    return null;
  }

  return {
    timestamp: draftData.timestamp,
    version: draftData.version,
    age: Date.now() - new Date(draftData.timestamp).getTime(),
    formType: key.split("_")[3], // Extract form type from key
  };
};

/**
 * Validate form data structure based on form type
 */
export const validateFormData = (formType, data) => {
  if (!data || typeof data !== "object") {
    return false;
  }

  // Common required fields
  const requiredFields = ["title", "type", "questions", "courseId", "lessonId"];

  for (const field of requiredFields) {
    if (!(field in data)) {
      return false;
    }
  }

  // Type-specific validation
  switch (formType) {
    case "multipleChoice":
      return validateMultipleChoiceData(data);
    case "trueFalse":
      return validateTrueFalseData(data);
    case "fillInBlanks":
      return validateFillInBlanksData(data);
    default:
      return true; // Unknown type, assume valid
  }
};

/**
 * Validate multiple choice form data
 */
const validateMultipleChoiceData = (data) => {
  if (!Array.isArray(data.questions)) {
    return false;
  }

  return data.questions.every((question) => {
    return (
      question.id &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      question.options.every(
        (option) => option.id && typeof option.isCorrect === "boolean"
      )
    );
  });
};

/**
 * Validate true/false form data
 */
const validateTrueFalseData = (data) => {
  if (!Array.isArray(data.questions)) {
    return false;
  }

  return data.questions.every((question) => {
    return question.id && typeof question.correctAnswer === "boolean";
  });
};

/**
 * Validate fill-in-blanks form data
 */
const validateFillInBlanksData = (data) => {
  if (!Array.isArray(data.questions)) {
    return false;
  }

  return data.questions.every((question) => {
    return (
      question.id &&
      Array.isArray(question.blanks) &&
      question.blanks.length >= 1 &&
      question.blanks.every((blank) => blank.id)
    );
  });
};
