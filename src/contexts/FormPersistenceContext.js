import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import {
  generateStorageKey,
  saveFormData,
  loadFormData,
  removeFormData,
  getFormDraftKeys,
  cleanupOldDrafts,
  getDraftMetadata,
  validateFormData,
} from "../utils/formPersistence";

// Action types
const ACTIONS = {
  SET_DRAFT_STATUS: "SET_DRAFT_STATUS",
  SET_AUTO_SAVE_STATUS: "SET_AUTO_SAVE_STATUS",
  SET_RECOVERY_NOTIFICATION: "SET_RECOVERY_NOTIFICATION",
  CLEAR_RECOVERY_NOTIFICATION: "CLEAR_RECOVERY_NOTIFICATION",
  SET_STORAGE_ERROR: "SET_STORAGE_ERROR",
  CLEAR_STORAGE_ERROR: "CLEAR_STORAGE_ERROR",
  UPDATE_DRAFT_METADATA: "UPDATE_DRAFT_METADATA",
  REMOVE_DRAFT_METADATA: "REMOVE_DRAFT_METADATA",
};

// Initial state
const initialState = {
  drafts: {}, // { formKey: { timestamp, version, formType, hasData } }
  autoSaveStatus: {}, // { formKey: { saving: false, lastSaved: null, error: null } }
  recoveryNotification: null, // { formKey, timestamp, formType, show: true }
  storageError: null, // { message, type, timestamp }
};

// Reducer
const formPersistenceReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_DRAFT_STATUS:
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.payload.key]: action.payload.metadata,
        },
      };

    case ACTIONS.SET_AUTO_SAVE_STATUS:
      return {
        ...state,
        autoSaveStatus: {
          ...state.autoSaveStatus,
          [action.payload.key]: {
            ...state.autoSaveStatus[action.payload.key],
            ...action.payload.status,
          },
        },
      };

    case ACTIONS.SET_RECOVERY_NOTIFICATION:
      return {
        ...state,
        recoveryNotification: action.payload,
      };

    case ACTIONS.CLEAR_RECOVERY_NOTIFICATION:
      return {
        ...state,
        recoveryNotification: null,
      };

    case ACTIONS.SET_STORAGE_ERROR:
      return {
        ...state,
        storageError: action.payload,
      };

    case ACTIONS.CLEAR_STORAGE_ERROR:
      return {
        ...state,
        storageError: null,
      };

    case ACTIONS.UPDATE_DRAFT_METADATA:
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.payload.key]: action.payload.metadata,
        },
      };

    case ACTIONS.REMOVE_DRAFT_METADATA: {
      const { [action.payload.key]: removed, ...remainingDrafts } =
        state.drafts;
      const { [action.payload.key]: removedAutoSave, ...remainingAutoSave } =
        state.autoSaveStatus;

      return {
        ...state,
        drafts: remainingDrafts,
        autoSaveStatus: remainingAutoSave,
      };
    }

    default:
      return state;
  }
};

// Context
const FormPersistenceContext = createContext();

// Provider component
export const FormPersistenceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(formPersistenceReducer, initialState);

  // Initialize drafts on mount
  useEffect(() => {
    const initializeDrafts = () => {
      try {
        // Clean up old drafts first
        cleanupOldDrafts();

        // Load existing draft metadata
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("task_form_draft_")) {
            const metadata = getDraftMetadata(key);
            if (metadata) {
              dispatch({
                type: ACTIONS.UPDATE_DRAFT_METADATA,
                payload: { key, metadata: { ...metadata, hasData: true } },
              });
            }
          }
        });
      } catch (error) {
        console.error("Error initializing drafts:", error);
        dispatch({
          type: ACTIONS.SET_STORAGE_ERROR,
          payload: {
            message: "Failed to initialize form drafts",
            type: "initialization",
            timestamp: new Date().toISOString(),
          },
        });
      }
    };

    initializeDrafts();
  }, []);

  // Save form data
  const saveDraft = useCallback(
    async (formType, courseId, lessonId, formData, userId = "anonymous") => {
      const key = generateStorageKey(formType, courseId, lessonId, userId);

      try {
        // Set saving status
        dispatch({
          type: ACTIONS.SET_AUTO_SAVE_STATUS,
          payload: {
            key,
            status: { saving: true, error: null },
          },
        });

        // Validate form data
        if (!validateFormData(formType, formData)) {
          throw new Error("Invalid form data structure");
        }

        // Save to localStorage
        const success = saveFormData(key, formData);

        if (success) {
          const metadata = getDraftMetadata(key);

          dispatch({
            type: ACTIONS.UPDATE_DRAFT_METADATA,
            payload: { key, metadata: { ...metadata, hasData: true } },
          });

          dispatch({
            type: ACTIONS.SET_AUTO_SAVE_STATUS,
            payload: {
              key,
              status: {
                saving: false,
                lastSaved: new Date().toISOString(),
                error: null,
              },
            },
          });

          return { success: true, timestamp: metadata?.timestamp };
        } else {
          throw new Error("Failed to save form data to localStorage");
        }
      } catch (error) {
        console.error("Error saving draft:", error);

        dispatch({
          type: ACTIONS.SET_AUTO_SAVE_STATUS,
          payload: {
            key,
            status: {
              saving: false,
              error: error.message,
              lastSaved: state.autoSaveStatus[key]?.lastSaved || null,
            },
          },
        });

        dispatch({
          type: ACTIONS.SET_STORAGE_ERROR,
          payload: {
            message: error.message,
            type: "save",
            timestamp: new Date().toISOString(),
          },
        });

        return { success: false, error: error.message };
      }
    },
    [state.autoSaveStatus]
  );

  // Load form data
  const loadDraft = useCallback(
    (formType, courseId, lessonId, userId = "anonymous") => {
      const key = generateStorageKey(formType, courseId, lessonId, userId);

      try {
        const draftData = loadFormData(key);

        if (draftData && validateFormData(formType, draftData.data)) {
          // Show recovery notification
          dispatch({
            type: ACTIONS.SET_RECOVERY_NOTIFICATION,
            payload: {
              formKey: key,
              timestamp: draftData.timestamp,
              formType,
              show: true,
            },
          });

          return {
            success: true,
            data: draftData.data,
            timestamp: draftData.timestamp,
            version: draftData.version,
          };
        }

        return { success: false, data: null };
      } catch (error) {
        console.error("Error loading draft:", error);

        dispatch({
          type: ACTIONS.SET_STORAGE_ERROR,
          payload: {
            message: "Failed to load form draft",
            type: "load",
            timestamp: new Date().toISOString(),
          },
        });

        return { success: false, error: error.message };
      }
    },
    []
  );

  // Remove draft
  const removeDraft = useCallback(
    (formType, courseId, lessonId, userId = "anonymous") => {
      const key = generateStorageKey(formType, courseId, lessonId, userId);

      try {
        const success = removeFormData(key);

        if (success) {
          dispatch({
            type: ACTIONS.REMOVE_DRAFT_METADATA,
            payload: { key },
          });
        }

        return success;
      } catch (error) {
        console.error("Error removing draft:", error);
        return false;
      }
    },
    []
  );

  // Check if draft exists
  const hasDraft = useCallback(
    (formType, courseId, lessonId, userId = "anonymous") => {
      const key = generateStorageKey(formType, courseId, lessonId, userId);
      return state.drafts[key]?.hasData || false;
    },
    [state.drafts]
  );

  // Get draft metadata
  const getDraftInfo = useCallback(
    (formType, courseId, lessonId, userId = "anonymous") => {
      const key = generateStorageKey(formType, courseId, lessonId, userId);
      return state.drafts[key] || null;
    },
    [state.drafts]
  );

  // Get auto-save status
  const getAutoSaveStatus = useCallback(
    (formType, courseId, lessonId, userId = "anonymous") => {
      const key = generateStorageKey(formType, courseId, lessonId, userId);
      return (
        state.autoSaveStatus[key] || {
          saving: false,
          lastSaved: null,
          error: null,
        }
      );
    },
    [state.autoSaveStatus]
  );

  // Clear recovery notification
  const clearRecoveryNotification = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_RECOVERY_NOTIFICATION });
  }, []);

  // Clear storage error
  const clearStorageError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_STORAGE_ERROR });
  }, []);

  // Get all drafts for a course/lesson
  const getCourseLessonDrafts = useCallback(
    (courseId, lessonId, userId = "anonymous") => {
      const keys = getFormDraftKeys(courseId, lessonId, userId);
      return keys
        .map((key) => ({
          key,
          ...state.drafts[key],
        }))
        .filter((draft) => draft.hasData);
    },
    [state.drafts]
  );

  // Cleanup all drafts for a course/lesson (after successful submission)
  const cleanupCourseLessonDrafts = useCallback(
    (courseId, lessonId, userId = "anonymous") => {
      const keys = getFormDraftKeys(courseId, lessonId, userId);
      let cleanedCount = 0;

      keys.forEach((key) => {
        if (removeFormData(key)) {
          dispatch({
            type: ACTIONS.REMOVE_DRAFT_METADATA,
            payload: { key },
          });
          cleanedCount++;
        }
      });

      return cleanedCount;
    },
    []
  );

  const value = {
    // State
    drafts: state.drafts,
    autoSaveStatus: state.autoSaveStatus,
    recoveryNotification: state.recoveryNotification,
    storageError: state.storageError,

    // Actions
    saveDraft,
    loadDraft,
    removeDraft,
    hasDraft,
    getDraftInfo,
    getAutoSaveStatus,
    clearRecoveryNotification,
    clearStorageError,
    getCourseLessonDrafts,
    cleanupCourseLessonDrafts,
  };

  return (
    <FormPersistenceContext.Provider value={value}>
      {children}
    </FormPersistenceContext.Provider>
  );
};

// Custom hook to use the context
export const useFormPersistence = () => {
  const context = useContext(FormPersistenceContext);

  if (!context) {
    throw new Error(
      "useFormPersistence must be used within a FormPersistenceProvider"
    );
  }

  return context;
};

export default FormPersistenceContext;
