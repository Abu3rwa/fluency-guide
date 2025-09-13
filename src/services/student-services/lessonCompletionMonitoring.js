import { db } from "../../firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment 
} from "firebase/firestore";
import studentTaskService from "./studentTaskService";
import studentVocabularyService from "./studentVocabularyService";
import studentVocabularyProgressService from "./studentVocabularyProgressService";

const MONITORING_COLLECTION = "lessonCompletionMonitoring";
const LESSONS_COLLECTION = "lessons";
const TASKS_COLLECTION = "tasks";
const COMMON_WORDS_COLLECTION = "commonWords";

/**
 * Enhanced lesson completion monitoring with task-based validation
 * and vocabulary integration
 */

/**
 * Checks if a student has completed all required tasks for a lesson
 * @param {string} userId - The student's ID
 * @param {string} lessonId - The lesson ID
 * @returns {Promise<Object>} Completion status and details
 */
export const checkLessonTaskCompletion = async (userId, lessonId) => {
  try {
    // Get all tasks for the lesson
    const tasks = await studentTaskService.getTasksByLesson(lessonId);
    
    if (tasks.length === 0) {
      return {
        isComplete: true,
        tasksRequired: 0,
        tasksCompleted: 0,
        tasksPassed: 0,
        allTasksPassed: true,
        taskDetails: [],
        message: "No tasks required for this lesson"
      };
    }

    const taskDetails = [];
    let tasksCompleted = 0;
    let tasksPassed = 0;

    // Check completion status for each task
    for (const task of tasks) {
      const attempts = await studentTaskService.getTaskAttempts(userId, task.id);
      const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
      
      const taskStatus = {
        taskId: task.id,
        taskType: task.type,
        taskTitle: task.title || `Task ${task.id}`,
        isCompleted: latestAttempt !== null,
        isPassed: latestAttempt?.isPassed || false,
        score: latestAttempt?.score || 0,
        passingScore: task.passingScore || 70,
        attempts: attempts.length,
        lastAttemptDate: latestAttempt?.createdAt || null
      };

      taskDetails.push(taskStatus);

      if (taskStatus.isCompleted) {
        tasksCompleted++;
        if (taskStatus.isPassed) {
          tasksPassed++;
        }
      }
    }

    const allTasksPassed = tasksPassed === tasks.length;
    const isComplete = allTasksPassed;

    return {
      isComplete,
      tasksRequired: tasks.length,
      tasksCompleted,
      tasksPassed,
      allTasksPassed,
      taskDetails,
      completionPercentage: Math.round((tasksPassed / tasks.length) * 100),
      message: isComplete 
        ? "All lesson tasks completed and passed" 
        : `${tasksPassed}/${tasks.length} tasks passed`
    };

  } catch (error) {
    console.error("Error checking lesson task completion:", error);
    return {
      isComplete: false,
      tasksRequired: 0,
      tasksCompleted: 0,
      tasksPassed: 0,
      allTasksPassed: false,
      taskDetails: [],
      error: error.message
    };
  }
};

/**
 * Processes vocabulary words from a lesson and integrates with commonWords collection
 * @param {string} lessonId - The lesson ID
 * @param {string} userId - The student's ID
 * @returns {Promise<Object>} Vocabulary processing results
 */
export const processLessonVocabulary = async (lessonId, userId) => {
  try {
    // Get lesson data
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    const lessonDoc = await getDoc(lessonRef);
    
    if (!lessonDoc.exists()) {
      throw new Error("Lesson not found");
    }

    const lessonData = lessonDoc.data();
    const vocabularyArray = lessonData.vocabulary || [];

    if (vocabularyArray.length === 0) {
      return {
        vocabularyCount: 0,
        wordsProcessed: 0,
        wordsFound: [],
        wordsNotFound: [],
        message: "No vocabulary words in this lesson"
      };
    }

    const wordsFound = [];
    const wordsNotFound = [];

    // Process each vocabulary word
    for (const word of vocabularyArray) {
      const normalizedWord = word.toLowerCase().trim();
      
      // Query commonWords collection for this word
      const wordsQuery = query(
        collection(db, COMMON_WORDS_COLLECTION),
        where("word_lowercase", "==", normalizedWord)
      );
      
      const wordsSnapshot = await getDocs(wordsQuery);
      
      if (!wordsSnapshot.empty) {
        const wordDoc = wordsSnapshot.docs[0];
        const wordData = {
          id: wordDoc.id,
          ...wordDoc.data(),
          originalWord: word
        };
        
        wordsFound.push(wordData);
        
        // Add to student's vocabulary progress if not already exists
        await studentVocabularyProgressService.addWordToProgress(
          userId, 
          wordDoc.id, 
          {
            source: 'lesson',
            lessonId: lessonId,
            addedAt: new Date().toISOString()
          }
        );
      } else {
        wordsNotFound.push(word);
      }
    }

    return {
      vocabularyCount: vocabularyArray.length,
      wordsProcessed: vocabularyArray.length,
      wordsFound,
      wordsNotFound,
      foundCount: wordsFound.length,
      notFoundCount: wordsNotFound.length,
      message: `Processed ${wordsFound.length}/${vocabularyArray.length} vocabulary words`
    };

  } catch (error) {
    console.error("Error processing lesson vocabulary:", error);
    return {
      vocabularyCount: 0,
      wordsProcessed: 0,
      wordsFound: [],
      wordsNotFound: [],
      error: error.message
    };
  }
};

/**
 * Marks a lesson as complete only if all tasks are passed
 * @param {string} userId - The student's ID
 * @param {string} lessonId - The lesson ID
 * @returns {Promise<Object>} Completion result
 */
export const completeLessonWithValidation = async (userId, lessonId) => {
  try {
    // Check task completion first
    const taskCompletion = await checkLessonTaskCompletion(userId, lessonId);
    
    if (!taskCompletion.isComplete) {
      await trackValidationFailure(userId, lessonId, {
        reason: "tasks_not_completed",
        taskDetails: taskCompletion.taskDetails,
        tasksCompleted: taskCompletion.tasksCompleted,
        tasksRequired: taskCompletion.tasksRequired
      });
      
      return {
        success: false,
        reason: "TASKS_NOT_COMPLETED",
        message: taskCompletion.message,
        taskCompletion,
        requirementsNotMet: true
      };
    }

    // Process vocabulary for this lesson
    const vocabularyResult = await processLessonVocabulary(lessonId, userId);

    // Create lesson completion record
    const completionData = {
      userId,
      lessonId,
      completedAt: serverTimestamp(),
      method: "task_based_validation",
      taskCompletion,
      vocabularyProcessing: vocabularyResult,
      isValid: true
    };

    // Save to lessonCompletionMonitoring collection
    const completionRef = doc(
      db, 
      MONITORING_COLLECTION, 
      `${userId}_${lessonId}_${Date.now()}`
    );
    await setDoc(completionRef, completionData);

    // Update user's lesson progress
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const completedLessons = userData.completedLessons || [];
      
      if (!completedLessons.includes(lessonId)) {
        await updateDoc(userRef, {
          completedLessons: [...completedLessons, lessonId],
          lastLessonCompleted: lessonId,
          lastActivityAt: serverTimestamp()
        });
      }
    }

    // Track successful completion
    await trackLessonCompletionAttempt(
      userId, 
      lessonId, 
      true, 
      "task_based_validation", 
      {
        taskCompletion,
        vocabularyProcessing: vocabularyResult
      }
    );

    return {
      success: true,
      message: "Lesson completed successfully",
      taskCompletion,
      vocabularyProcessing: vocabularyResult,
      completionId: completionRef.id
    };

  } catch (error) {
    console.error("Error completing lesson:", error);
    
    await trackLessonCompletionAttempt(
      userId, 
      lessonId, 
      false, 
      "task_based_validation", 
      { error: error.message }
    );

    return {
      success: false,
      reason: "SYSTEM_ERROR",
      message: error.message,
      error: error.message
    };
  }
};

/**
 * Tracks usage of lesson completion features
 * @param {string} featureName - The name of the feature being tracked
 * @param {Object} data - Additional data to track
 */
export const trackFeatureUsage = async (featureName, data = {}) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const monitoringRef = doc(
      db,
      MONITORING_COLLECTION,
      `${featureName}_${today}`
    );

    await setDoc(
      monitoringRef,
      {
        featureName,
        date: today,
        usageCount: increment(1),
        lastUpdated: new Date().toISOString(),
        ...data,
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error tracking feature usage:", error);
    // Don't throw - monitoring should not break main functionality
  }
};

/**
 * Tracks lesson completion attempts
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @param {boolean} success - Whether the completion was successful
 * @param {string} method - The method used ("legacy" or "requirements")
 * @param {Object} requirements - Requirements data if applicable
 */
export const trackLessonCompletionAttempt = async (
  userId,
  lessonId,
  success,
  method = "legacy",
  requirements = {}
) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const trackingRef = doc(db, MONITORING_COLLECTION, `completion_${today}`);

    await setDoc(
      trackingRef,
      {
        date: today,
        totalAttempts: increment(1),
        successfulCompletions: increment(success ? 1 : 0),
        legacyMethodCount: increment(method === "legacy" ? 1 : 0),
        requirementsMethodCount: increment(method === "requirements" ? 1 : 0),
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    // Track individual attempt
    const attemptRef = doc(
      db,
      MONITORING_COLLECTION,
      `attempt_${userId}_${lessonId}_${Date.now()}`
    );
    await setDoc(attemptRef, {
      userId,
      lessonId,
      success,
      method,
      requirements,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error tracking lesson completion attempt:", error);
    // Don't throw - monitoring should not break main functionality
  }
};

/**
 * Tracks validation failures
 * @param {string} userId - The ID of the student
 * @param {string} lessonId - The ID of the lesson
 * @param {Object} missingRequirements - Requirements that were not met
 */
export const trackValidationFailure = async (
  userId,
  lessonId,
  missingRequirements = {}
) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const failureRef = doc(
      db,
      MONITORING_COLLECTION,
      `validation_failures_${today}`
    );

    await setDoc(
      failureRef,
      {
        date: today,
        failureCount: increment(1),
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    // Track specific failure
    const specificFailureRef = doc(
      db,
      MONITORING_COLLECTION,
      `failure_${userId}_${lessonId}_${Date.now()}`
    );
    await setDoc(specificFailureRef, {
      userId,
      lessonId,
      missingRequirements,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error tracking validation failure:", error);
    // Don't throw - monitoring should not break main functionality
  }
};

/**
 * Gets monitoring data for a specific date
 * @param {string} date - The date in YYYY-MM-DD format
 * @returns {Promise<Object>} - Monitoring data for the date
 */
export const getMonitoringData = async (date) => {
  try {
    const monitoringRef = doc(db, MONITORING_COLLECTION, `completion_${date}`);
    const monitoringDoc = await getDoc(monitoringRef);

    return monitoringDoc.exists() ? monitoringDoc.data() : {};
  } catch (error) {
    console.error("Error getting monitoring data:", error);
    return {};
  }
};
