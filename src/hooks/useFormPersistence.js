import { useState, useEffect, useCallback, useRef } from "react";
import { useFormPersistence as useFormPersistenceContext } from "../contexts/FormPersistenceContext";

/**
 * Custom hook for form persistence with auto-save functionality
 * @param {string} formType - Type of form (multipleChoice, trueFalse, fillInBlanks)
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} initialFormData - Initial form data structure
 * @param {Object} options - Configuration options
 * @returns {Object} Form persistence utilities and state
 */
export const useFormPersistence = (
  formType,
  courseId,
  lessonId,
  initialFormData,
  options = {}
) => {
  const {
    autoSaveDelay = 500, // Debounce delay in milliseconds
    userId = "anonymous",
    enableAutoSave = true,
    onDraftLoaded = null,
    onAutoSave = null,
    onError = null,
  } = options;

  // Memoize callbacks to prevent unnecessary re-renders
  const memoizedOnDraftLoaded = useCallback(onDraftLoaded, []);
  const memoizedOnAutoSave = useCallback(onAutoSave, []);
  const memoizedOnError = useCallback(onError, []);

  const persistenceContext = useFormPersistenceContext();
  const {
    saveDraft,
    loadDraft,
    removeDraft,
    hasDraft,
    getDraftInfo,
    getAutoSaveStatus,
    clearRecoveryNotification,
    cleanupCourseLessonDrafts,
  } = persistenceContext;

  // Form state
  const [formData, setFormData] = useState(initialFormData);
  const [isInitialized, setIsInitialized] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Auto-save state
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isAutoSavingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Get current auto-save status
  const autoSaveStatus = getAutoSaveStatus(
    formType,
    courseId,
    lessonId,
    userId
  );
  const draftInfo = getDraftInfo(formType, courseId, lessonId, userId);

  // Initialize form data on mount
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }

    const initializeForm = async () => {
      try {
        // Check if there's a saved draft
        const draftResult = loadDraft(formType, courseId, lessonId, userId);

        if (draftResult.success && draftResult.data) {
          // Merge draft data with initial data to handle any new fields
          const mergedData = {
            ...initialFormData,
            ...draftResult.data,
            // Ensure courseId and lessonId are current
            courseId,
            lessonId,
          };

          setFormData(mergedData);
          setDraftLoaded(true);
          lastSavedDataRef.current = JSON.stringify(mergedData);

          // Call callback if provided
          if (memoizedOnDraftLoaded) {
            memoizedOnDraftLoaded(mergedData, draftResult.timestamp);
          }
        } else {
          // No draft found, use initial data
          const initialData = {
            ...initialFormData,
            courseId,
            lessonId,
          };
          setFormData(initialData);
          lastSavedDataRef.current = JSON.stringify(initialData);
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        const initialData = {
          ...initialFormData,
          courseId,
          lessonId,
        };
        setFormData(initialData);
        lastSavedDataRef.current = JSON.stringify(initialData);

        if (memoizedOnError) {
          memoizedOnError(error, "initialization");
        }
      } finally {
        setIsInitialized(true);
        isInitializedRef.current = true;
      }
    };

    if (formType && courseId && lessonId) {
      initializeForm();
    }
  }, [formType, courseId, lessonId, userId]);

  // Auto-save function with debouncing
  const performAutoSave = useCallback(
    async (dataToSave) => {
      if (!enableAutoSave || isAutoSavingRef.current) {
        return;
      }

      // Check if data has actually changed
      const currentDataString = JSON.stringify(dataToSave);
      if (currentDataString === lastSavedDataRef.current) {
        return;
      }

      try {
        isAutoSavingRef.current = true;

        const result = await saveDraft(
          formType,
          courseId,
          lessonId,
          dataToSave,
          userId
        );

        if (result.success) {
          lastSavedDataRef.current = currentDataString;

          if (memoizedOnAutoSave) {
            memoizedOnAutoSave(dataToSave, result.timestamp);
          }
        } else {
          console.warn("Auto-save failed:", result.error);

          if (memoizedOnError) {
            memoizedOnError(new Error(result.error), "autosave");
          }
        }
      } catch (error) {
        console.error("Auto-save error:", error);

        if (memoizedOnError) {
          memoizedOnError(error, "autosave");
        }
      } finally {
        isAutoSavingRef.current = false;
      }
    },
    [
      enableAutoSave,
      saveDraft,
      formType,
      courseId,
      lessonId,
      userId,
      memoizedOnAutoSave,
      memoizedOnError,
    ]
  );

  // Debounced auto-save effect
  useEffect(() => {
    if (!isInitialized || !enableAutoSave) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave(formData);
    }, autoSaveDelay);

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, isInitialized, enableAutoSave, autoSaveDelay, performAutoSave]);

  // Update form data with auto-save
  const updateFormData = useCallback((updates) => {
    setFormData((prevData) => {
      if (typeof updates === "function") {
        return updates(prevData);
      }
      return { ...prevData, ...updates };
    });
  }, []);

  // Manual save function
  const saveManually = useCallback(async () => {
    try {
      const result = await saveDraft(
        formType,
        courseId,
        lessonId,
        formData,
        userId
      );

      if (result.success) {
        lastSavedDataRef.current = JSON.stringify(formData);
        return { success: true, timestamp: result.timestamp };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Manual save error:", error);
      return { success: false, error: error.message };
    }
  }, [saveDraft, formType, courseId, lessonId, formData, userId]);

  // Clear draft function
  const clearDraft = useCallback(async () => {
    try {
      const success = removeDraft(formType, courseId, lessonId, userId);

      if (success) {
        lastSavedDataRef.current = null;
        setDraftLoaded(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error clearing draft:", error);
      return false;
    }
  }, [removeDraft, formType, courseId, lessonId, userId]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    lastSavedDataRef.current = JSON.stringify(initialFormData);
    setDraftLoaded(false);
  }, []);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const currentDataString = JSON.stringify(formData);
    return currentDataString !== lastSavedDataRef.current;
  }, [formData]);

  // Get form validation status
  const getValidationStatus = useCallback(() => {
    // Basic validation - can be extended based on form type
    const hasTitle = formData.title && formData.title.trim().length > 0;
    const hasQuestions = formData.questions && formData.questions.length > 0;
    const hasValidQuestions = formData.questions?.every((q) => {
      if (!q.text || !q.text.trim()) return false;

      switch (formType) {
        case "multipleChoice":
          return (
            q.options &&
            q.options.length >= 2 &&
            q.options.some((opt) => opt.isCorrect)
          );
        case "trueFalse":
          return typeof q.correctAnswer === "boolean";
        case "fillInBlanks":
          return (
            q.blanks &&
            q.blanks.length > 0 &&
            q.blanks.every((blank) => blank.answer)
          );
        default:
          return true;
      }
    });

    return {
      isValid: hasTitle && hasQuestions && hasValidQuestions,
      hasTitle,
      hasQuestions,
      hasValidQuestions,
      questionCount: formData.questions?.length || 0,
    };
  }, [formData, formType]);

  // Cleanup drafts after successful submission
  const cleanupAfterSubmission = useCallback(() => {
    return cleanupCourseLessonDrafts(courseId, lessonId, userId);
  }, [cleanupCourseLessonDrafts, courseId, lessonId, userId]);

  // Dismiss recovery notification
  const dismissRecoveryNotification = useCallback(() => {
    clearRecoveryNotification();
  }, [clearRecoveryNotification]);

  return {
    // Form data and state
    formData,
    updateFormData,
    isInitialized,
    draftLoaded,

    // Auto-save status
    autoSaveStatus,
    draftInfo,
    hasUnsavedChanges: hasUnsavedChanges(),
    validationStatus: getValidationStatus(),

    // Actions
    saveManually,
    clearDraft,
    resetForm,
    cleanupAfterSubmission,
    dismissRecoveryNotification,

    // Utilities
    hasDraft: hasDraft(formType, courseId, lessonId, userId),

    // Context state
    recoveryNotification: persistenceContext.recoveryNotification,
    storageError: persistenceContext.storageError,
  };
};

export default useFormPersistence;
