import { db } from "../../firebase";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  trackLessonCompletionAttempt,
  trackValidationFailure,
} from "./lessonCompletionMonitoring";

const LESSON_PROGRESS_COLLECTION = "lessonProgress";
const LESSON_REQUIREMENTS_COLLECTION = "lessonRequirements"; // NEW: Optional collection

// NEW: Custom error for completion requirements
export class CompletionRequirementsError extends Error {
  constructor(message, requirements = {}) {
    super(message);
    this.name = "CompletionRequirementsError";
    this.requirements = requirements;
  }
}

/**
 * Updates the completion status of a lesson for a student
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @param {boolean} isCompleted - Whether the lesson is completed
 * @returns {Promise<void>}
 */
export const updateLessonCompletion = async (userId, lessonId, isCompleted) => {
  try {
    const progressRef = doc(
      db,
      LESSON_PROGRESS_COLLECTION,
      `${userId}_${lessonId}`
    );

    await setDoc(
      progressRef,
      {
        userId,
        lessonId,
        completed: isCompleted,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    // Track completion attempt (monitoring)
    await trackLessonCompletionAttempt(userId, lessonId, true, "legacy");

    return true;
  } catch (error) {
    console.error("Error updating lesson completion:", error);
    // Track failed attempt
    await trackLessonCompletionAttempt(userId, lessonId, false, "legacy");
    throw error;
  }
};

/**
 * Gets the completion status of lessons for a student
 * @param {string} userId - The ID of the student
 * @param {string[]} lessonIds - Array of lesson IDs to check
 * @returns {Promise<Object>} - Object mapping lesson IDs to completion status
 */
export const getLessonCompletionStatus = async (userId, lessonIds) => {
  try {
    const completionStatus = {};

    // Query all progress documents for this user and these lessons
    const q = query(
      collection(db, LESSON_PROGRESS_COLLECTION),
      where("userId", "==", userId),
      where("lessonId", "in", lessonIds)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      completionStatus[data.lessonId] = data.completed;
    });

    return completionStatus;
  } catch (error) {
    console.error("Error getting lesson completion status:", error);
    throw error;
  }
};

/**
 * Gets the completion status of a single lesson for a student
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<boolean>} - Whether the lesson is completed
 */
export const getSingleLessonCompletionStatus = async (userId, lessonId) => {
  try {
    const progressRef = doc(
      db,
      LESSON_PROGRESS_COLLECTION,
      `${userId}_${lessonId}`
    );
    const progressDoc = await getDoc(progressRef);

    return progressDoc.exists() ? progressDoc.data().completed : false;
  } catch (error) {
    console.error("Error getting lesson completion status:", error);
    throw error;
  }
};

// NEW: Enhanced functions for lesson requirements (backward compatible)

/**
 * Gets lesson requirements for a specific lesson
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<Object>} - Lesson requirements or { enabled: false } if none
 */
export const getLessonRequirements = async (lessonId) => {
  try {
    const requirementsRef = doc(db, LESSON_REQUIREMENTS_COLLECTION, lessonId);
    const requirementsDoc = await getDoc(requirementsRef);

    if (!requirementsDoc.exists()) {
      return { enabled: false }; // Backward compatible - no requirements
    }

    return requirementsDoc.data();
  } catch (error) {
    console.error("Error getting lesson requirements:", error);
    return { enabled: false }; // Fail gracefully for backward compatibility
  }
};

/**
 * Validates if a student can complete a lesson based on requirements
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<Object>} - Validation result
 */
export const validateLessonCompletion = async (userId, lessonId) => {
  try {
    const requirements = await getLessonRequirements(lessonId);

    if (!requirements.enabled) {
      return { allowed: true, method: "legacy" }; // Backward compatible
    }

    // Enhanced validation logic (placeholder for now)
    // This will be expanded in Phase 2 with actual task/content validation
    const taskProgress = await getTaskProgressForLesson(userId, lessonId);
    const contentProgress = await getContentProgressForLesson(userId, lessonId);

    return validateRequirements(taskProgress, contentProgress, requirements);
  } catch (error) {
    console.error("Error validating lesson completion:", error);
    return { allowed: true, method: "legacy" }; // Fail gracefully
  }
};

/**
 * Enhanced completion function with requirements validation
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @param {boolean} isCompleted - Whether the lesson is completed
 * @param {Object} options - Options for completion
 * @returns {Promise<void>}
 */
export const updateLessonCompletionWithRequirements = async (
  userId,
  lessonId,
  isCompleted,
  options = { enforceRequirements: false }
) => {
  try {
    if (!options.enforceRequirements) {
      // Use existing logic for backward compatibility
      return updateLessonCompletion(userId, lessonId, isCompleted);
    }

    const validation = await validateLessonCompletion(userId, lessonId);

    if (!validation.allowed) {
      // Track validation failure
      await trackValidationFailure(
        userId,
        lessonId,
        validation.missingRequirements
      );

      throw new CompletionRequirementsError(
        "Completion requirements not met",
        validation.missingRequirements
      );
    }

    // Use existing completion logic
    const result = await updateLessonCompletion(userId, lessonId, isCompleted);

    // Track successful requirements-based completion
    await trackLessonCompletionAttempt(
      userId,
      lessonId,
      true,
      "requirements",
      validation
    );

    return result;
  } catch (error) {
    console.error("Error updating lesson completion with requirements:", error);

    if (error instanceof CompletionRequirementsError) {
      // Already tracked above
      throw error;
    }

    // Track failed attempt
    await trackLessonCompletionAttempt(userId, lessonId, false, "requirements");
    throw error;
  }
};

// NEW: Helper functions for enhanced validation (to be implemented in Phase 2)

/**
 * Gets task progress for a lesson (placeholder)
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<Object>} - Task progress data
 */
const getTaskProgressForLesson = async (userId, lessonId) => {
  // Placeholder - will be implemented in Phase 2
  return {};
};

/**
 * Gets content progress for a lesson (placeholder)
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<Object>} - Content progress data
 */
const getContentProgressForLesson = async (userId, lessonId) => {
  // Placeholder - will be implemented in Phase 2
  return {};
};

/**
 * Validates requirements against progress (placeholder)
 * @param {Object} taskProgress - Task progress data
 * @param {Object} contentProgress - Content progress data
 * @param {Object} requirements - Lesson requirements
 * @returns {Promise<Object>} - Validation result
 */
const validateRequirements = async (
  taskProgress,
  contentProgress,
  requirements
) => {
  // Placeholder - will be implemented in Phase 2
  return { allowed: true, method: "requirements" };
};
