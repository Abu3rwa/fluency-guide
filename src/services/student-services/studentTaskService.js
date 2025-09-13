// studentTaskService.js
// Ported from migrate/lib/services/task_service.dart
// Handles task logic and Firestore integration for students

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  limit,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import vocabularyReviewIntegrationService from "./vocabularyReviewIntegrationService";
import { updateTodayStats } from "./studentTodayStatsService";
import { createActivityFromTaskAttempt } from "./studentRecentActivityService";

const TASKS_COLLECTION = "tasks";
const TASK_ATTEMPTS_COLLECTION = "taskAttempts";
const USERS_COLLECTION = "users";

// Get all tasks for a lesson
export async function getTasksByLesson(lessonId) {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where("lessonId", "==", lessonId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const taskData = doc.data();
      return {
        ...taskData,
        // Always use Firebase document ID as the task ID
        id: doc.id,
      };
    });
  } catch (e) {
    console.error("Error getting tasks by lesson:", e);
    return [];
  }
}

// Get a single task
export async function getTaskById(taskId) {
  try {
    // Validate taskId
    if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
      console.error("Invalid taskId:", taskId);
      return null;
    }

    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists()) {
      const taskData = taskDoc.data();
      // Always use Firebase document ID as the task ID, regardless of what's in the data
      return {
        ...taskData,
        // Ensure the id field is always the Firebase document ID
        id: taskDoc.id,
      };
    }
    return null;
  } catch (e) {
    console.error("Error getting task by ID:", e);
    return null;
  }
}

// Calculate score for fill-in-blanks task
function calculateFillInBlanksScore(task, userAnswers) {
  let earnedPoints = 0;
  const totalPoints = task.questions.length;
  const questionResults = {};

  task.questions.forEach((question) => {
    const userAnswer = userAnswers[question.id];
    const correctAnswer = question.correctAnswer;
    const isCorrect =
      String(userAnswer || "")
        .toLowerCase()
        .trim() ===
      String(correctAnswer || "")
        .toLowerCase()
        .trim();
    const pointsEarned = isCorrect ? 1 : 0;
    const timeSpent = 0; // This would need to be tracked per question

    questionResults[question.id] = {
      isCorrect,
      pointsEarned,
      timeSpent,
    };

    if (isCorrect) {
      earnedPoints++;
    }
  });

  const score = Math.round((earnedPoints / totalPoints) * 100);
  const isPassed = score >= (task.passingScore || 70);

  return {
    score,
    earnedPoints,
    totalPoints,
    isPassed,
    questionResults,
  };
}

function calculateMultipleChoiceScore(task, userAnswers) {
  let earnedPoints = 0;
  const questionResults = {};

  task.questions.forEach((question) => {
    const userAnswer = userAnswers[question.id];
    
    // For multiple choice, find the correct answer from options array
    let correctAnswer;
    if (question.options && Array.isArray(question.options)) {
      // Find the option that is marked as correct
      const correctOption = question.options.find(option => option.isCorrect);
      correctAnswer = correctOption ? correctOption.text : undefined;
    } else {
      // Fallback to existing correctAnswer property for compatibility
      correctAnswer = question.correctAnswer;
    }
    
    // Robust comparison handling string/number type mismatches and whitespace
    const isCorrect = String(userAnswer || "").trim() === String(correctAnswer || "").trim();
    const pointsEarned = isCorrect ? 1 : 0;
    const timeSpent = 0; // This would need to be tracked per question

    // Debug logging to help identify comparison issues
    console.log(`Question ${question.id}: User="${userAnswer}" (${typeof userAnswer}) vs Correct="${correctAnswer}" (${typeof correctAnswer}) => ${isCorrect}`);

    questionResults[question.id] = {
      isCorrect,
      pointsEarned,
      timeSpent,
    };

    if (isCorrect) {
      earnedPoints++;
    }
  });

  // Use task.totalPoints as definitive source per memory specifications
  // Fall back to questions.length if totalPoints is not set or is 0
  const effectiveTotalPoints = (task.totalPoints && task.totalPoints > 0) 
    ? task.totalPoints 
    : task.questions.length;
  
  const score = Math.round((earnedPoints / task.questions.length) * 100);
  const isPassed = score >= (task.passingScore || 70);

  console.log(`Score calculation: ${earnedPoints} correct out of ${task.questions.length} questions = ${score}%`);
  console.log(`Total points from task: ${task.totalPoints}, Using: ${effectiveTotalPoints}`);

  return {
    score,
    earnedPoints,
    totalPoints: effectiveTotalPoints,
    isPassed,
    questionResults,
  };
}

// Submit a task attempt with comprehensive progress tracking
export async function submitTaskAttempt(
  taskId,
  userAnswers,
  timeSpent,
  finalScore
) {
  console.log('submitTaskAttempt called:', {
    taskId,
    userAnswersCount: Object.keys(userAnswers || {}).length,
    timeSpent,
    finalScore,
    timestamp: new Date().toISOString()
  });
  
  try {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    // Prevent duplicate submissions by checking for recent attempts
    const recentAttemptsQuery = query(
      collection(db, TASK_ATTEMPTS_COLLECTION),
      where("taskId", "==", taskId),
      where("userId", "==", userId),
      orderBy("submittedAt", "desc"),
      limit(1)
    );
    
    const recentAttempts = await getDocs(recentAttemptsQuery);
    if (!recentAttempts.empty) {
      const lastAttempt = recentAttempts.docs[0].data();
      const lastSubmissionTime = lastAttempt.submittedAt?.toDate?.() || new Date(lastAttempt.submittedAt);
      const timeDiff = Date.now() - lastSubmissionTime.getTime();
      
      // Prevent submissions within 30 seconds of each other (increased from 15 seconds)
      if (timeDiff < 30000) {
        console.log(`Duplicate submission prevented - last submission was ${Math.round(timeDiff/1000)} seconds ago`);
        return {
          id: recentAttempts.docs[0].id,
          ...lastAttempt,
          isDuplicate: true
        };
      }
      
      // Additional check: If the answers are identical and submitted within 2 minutes
      if (timeDiff < 120000) {
        const lastAnswersHash = JSON.stringify(lastAttempt.responses?.map(r => r.selectedAnswer).sort() || []);
        const currentAnswersHash = JSON.stringify(Object.values(userAnswers).sort());
        
        if (lastAnswersHash === currentAnswersHash) {
          console.log(`Duplicate submission prevented - identical answers within 2 minutes`);
          return {
            id: recentAttempts.docs[0].id,
            ...lastAttempt,
            isDuplicate: true
          };
        }
      }
    }

    // Get task details
    const task = await getTaskById(taskId);
    if (!task) throw new Error("Task not found");

    // Calculate score based on task type
    let scoreData;
    if (task.type === "multipleChoice") {
      scoreData = calculateMultipleChoiceScore(task, userAnswers);
    } else {
      scoreData = calculateFillInBlanksScore(task, userAnswers);
    }
    const isPassed = scoreData.isPassed;

    // Create detailed responses with individual question data
    const responses = Object.entries(userAnswers).map(
      ([questionId, answers]) => {
        const question = task.questions.find((q) => q.id === questionId);
        const isCorrect =
          scoreData.questionResults?.[questionId]?.isCorrect || false;
        const pointsEarned =
          scoreData.questionResults?.[questionId]?.pointsEarned || 0;
        const questionTimeSpent =
          scoreData.questionResults?.[questionId]?.timeSpent || 0;

        return {
          questionId,
          selectedAnswer: answers,
          isCorrect,
          pointsEarned,
          timeSpent: questionTimeSpent,
        };
      }
    );

    // Create task attempt with all required fields
    const attempt = {
      taskId,
      userId,
      responses,
      score: scoreData.score,
      status: isPassed ? "passed" : "failed",
      submittedAt: serverTimestamp(),
      isPassed,
      correctAnswers: scoreData.earnedPoints, // Add correctAnswers field
      totalQuestions: task.questions.length,
      timeSpent,
    };

    // Save task attempt
    const docRef = await addDoc(
      collection(db, TASK_ATTEMPTS_COLLECTION),
      attempt
    );
    
    console.log('Task attempt saved successfully:', {
      attemptId: docRef.id,
      taskId,
      userId,
      score: scoreData.score,
      correctAnswers: scoreData.earnedPoints,
      totalQuestions: task.questions.length,
      responsesCount: responses.length,
      timeSpent
    });

    // Update user progress
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const progress = userData.progress || {};

      // Update task progress
      progress.taskProgress = progress.taskProgress || {};
      progress.taskProgress[taskId] = {
        lastAttempt: new Date().toISOString(),
        bestScore: scoreData.score,
        attempts: increment(1),
        isPassed,
      };

      // Update completed tasks if passed
      if (isPassed) {
        progress.completedTasks = progress.completedTasks || [];
        if (!progress.completedTasks.includes(taskId)) {
          progress.completedTasks.push(taskId);
        }
      }

      // Update study statistics
      const currentStudyMinutes = progress.totalStudyMinutes || 0;
      const newStudyMinutes = currentStudyMinutes + Math.ceil(timeSpent / 60);
      progress.totalStudyMinutes = newStudyMinutes;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      progress.lastStudyDate = now.toISOString();

      // Update streak logic
      const lastStudyDateStr = progress.lastStudyDate;
      const currentStreak = progress.currentStreak || 0;
      const longestStreak = progress.longestStreak || 0;

      if (lastStudyDateStr) {
        try {
          const lastStudyDate = new Date(lastStudyDateStr);
          const lastStudyDay = new Date(
            lastStudyDate.getFullYear(),
            lastStudyDate.getMonth(),
            lastStudyDate.getDate()
          );
          const daysDifference = Math.floor(
            (today - lastStudyDay) / (1000 * 60 * 60 * 24)
          );

          if (daysDifference === 0) {
            // Same day, don't increment streak
          } else if (daysDifference === 1) {
            // Consecutive day, increment streak
            const newStreak = currentStreak + 1;
            progress.currentStreak = newStreak;
            progress.longestStreak =
              newStreak > longestStreak ? newStreak : longestStreak;
          } else {
            // Break in streak, reset to 1
            progress.currentStreak = 1;
          }
        } catch (e) {
          progress.currentStreak = 1;
        }
      } else {
        // First time studying
        progress.currentStreak = 1;
      }

      // Update user document
      const updateData = {
        progress,
        lastStudyDate: now,
        currentStreak: progress.currentStreak || 0,
        longestStreak: progress.longestStreak || 0,
        totalStudyMinutes: progress.totalStudyMinutes || 0,
        totalPoints: increment(scoreData.earnedPoints),
      };

      await updateDoc(userRef, updateData);

      // Check and award achievements
      await checkAndAwardAchievements(
        userId,
        scoreData.score,
        task.questions.length,
        isPassed
      );

      // INTEGRATION: Create review items from vocabulary tasks
      if (task.isVocabularyReview || task.tags?.includes("vocabulary")) {
        try {
          await vocabularyReviewIntegrationService.createReviewItemsFromVocabularyTask(
            userId,
            taskId,
            {
              isPassed,
              score: scoreData.score,
              timeSpent,
              totalQuestions: task.questions.length,
            }
          );
        } catch (error) {
          console.error("Error creating vocabulary review items:", error);
          // Don't throw error here as it shouldn't break the task completion
        }
      }

      // Create activity for study time tracking
      try {
        // Import time utilities for standardized conversion
        const { secondsToMinutes } = await import("../../utils/timeUtils");
        const durationInMinutes = secondsToMinutes(timeSpent);

        await updateTodayStats(userId, {
          type: "quiz_completed",
          duration: durationInMinutes,
          taskId,
          score: scoreData.score,
          isPassed,
          totalQuestions: task.questions.length,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating today stats:", error);
        // Don't throw error here as it shouldn't break the task completion
      }

      // Create recent activity for task completion
      try {
        const targetId = `/${task.type}`;
        const taskTitle =
          task.title ||
          `English Grammar: ${task.type
            .replace(/([A-Z])/g, " $1")
            .trim()} Quiz`;

        await createActivityFromTaskAttempt(
          taskId,
          userId,
          targetId,
          taskTitle,
          task.lessonId,
          task.courseId,
          isPassed ? "completed" : "failed",
          1.0, // progress
          scoreData.score,
          Math.ceil(timeSpent / 60), // timeSpent in minutes
          task.questions.length
        );

        console.log("Recent activity created for task completion");
      } catch (error) {
        console.error("Error creating recent activity:", error);
        // Don't throw error here as it shouldn't break the task completion
      }
    }

    return {
      id: docRef.id,
      ...attempt,
      score: scoreData.score,
      isPassed,
    };
  } catch (e) {
    console.error("Error submitting task attempt:", e);
    throw e;
  }
}

// Check and award achievements
async function checkAndAwardAchievements(
  userId,
  score,
  totalQuestions,
  isPassed
) {
  try {
    // Award achievements based on performance
    if (score >= 90) {
      await awardAchievement(userId, "high_score");
    }
    if (isPassed) {
      await awardAchievement(userId, "task_completed");
    }
    if (totalQuestions >= 10) {
      await awardAchievement(userId, "long_quiz");
    }
  } catch (e) {
    console.error("Error awarding achievements:", e);
  }
}

// Award achievement if not already awarded
async function awardAchievement(userId, achievementId) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const achievements = userData.achievements || [];

      if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
        await updateDoc(userRef, { achievements });
      }
    }
  } catch (e) {
    console.error("Error awarding achievement:", e);
  }
}

// Get task attempts for a user and specific task
export async function getTaskAttempts(userId, taskId) {
  try {
    const q = query(
      collection(db, TASK_ATTEMPTS_COLLECTION),
      where("taskId", "==", taskId),
      where("userId", "==", userId),
      orderBy("submittedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting task attempts:", e);
    return [];
  }
}

// Get all task attempts for a user (legacy method)
export async function getUserTaskAttempts(taskId, userId) {
  return getTaskAttempts(userId, taskId);
}

// Get task progress for a user
export async function getTaskProgress(taskId, userId) {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) return 0.0;

    const userData = userDoc.data();
    const progress = userData.progress;
    if (!progress) return 0.0;

    const taskProgress = progress.taskProgress?.[taskId];
    if (!taskProgress) return 0.0;

    const bestScore = taskProgress.bestScore || 0;
    return bestScore / 100.0;
  } catch (e) {
    console.error("Error getting task progress:", e);
    return 0.0;
  }
}

// Get user progress
export async function getUserProgress(userId) {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) return {};

    const userData = userDoc.data();
    return userData.progress || {};
  } catch (e) {
    console.error("Error getting user progress:", e);
    return {};
  }
}

// Create a new task
export async function createTask(taskData) {
  try {
    const newTask = {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), newTask);
    return { id: docRef.id, ...newTask };
  } catch (e) {
    console.error("Error creating task:", e);
    throw e;
  }
}

// Update a task
export async function updateTask(taskId, taskData) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const updateData = {
      ...taskData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(taskRef, updateData);
    return { id: taskId, ...updateData };
  } catch (e) {
    console.error("Error updating task:", e);
    throw e;
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
    return true;
  } catch (e) {
    console.error("Error deleting task:", e);
    throw e;
  }
}

// Get analytics for a task
export async function getTaskAnalytics(taskId) {
  try {
    const q = query(
      collection(db, TASK_ATTEMPTS_COLLECTION),
      where("taskId", "==", taskId)
    );

    const snapshot = await getDocs(q);
    const attempts = snapshot.docs.map((doc) => doc.data());

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
      };
    }

    const totalAttempts = attempts.length;
    const averageScore =
      attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts;
    const completionRate =
      attempts.filter((a) => a.isPassed).length / totalAttempts;

    return {
      totalAttempts,
      averageScore,
      completionRate,
    };
  } catch (e) {
    console.error("Error getting task analytics:", e);
    return {
      totalAttempts: 0,
      averageScore: 0,
      completionRate: 0,
    };
  }
}

const studentTaskService = {
  getTasksByLesson,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  submitTaskAttempt,
  getTaskAttempts,
  getUserTaskAttempts,
  getTaskProgress,
  getUserProgress,
  getTaskAnalytics,
};

export default studentTaskService;
