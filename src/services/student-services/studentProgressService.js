import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

/**
 * Get overall learning progress for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Overall progress data
 */
export const getOverallProgress = async (userId) => {
  try {
    // 1. Fetch all progress-related data
    const [
      courseProgress,
      lessonProgress,
      vocabularyProgress,
      pronunciationProgress,
      achievementProgress,
      goalProgress,
    ] = await Promise.all([
      getCourseProgress(userId),
      getLessonProgress(userId),
      getVocabularyProgress(userId),
      getPronunciationProgress(userId),
      getAchievementProgress(userId),
      getGoalProgress(userId),
    ]);

    // 2. Calculate comprehensive progress metrics
    const overallProgress = {
      // Course-based progress
      courseProgress: {
        totalCourses: courseProgress.totalCourses,
        completedCourses: courseProgress.completedCourses,
        inProgressCourses: courseProgress.inProgressCourses,
        averageCourseProgress: courseProgress.averageProgress,
        totalLessons: courseProgress.totalLessons,
        completedLessons: courseProgress.completedLessons,
        lessonCompletionRate: courseProgress.lessonCompletionRate,
      },

      // Skill-based progress
      skillProgress: {
        vocabulary: vocabularyProgress,
        pronunciation: pronunciationProgress,
        grammar: await getGrammarProgress(userId),
        listening: await getListeningProgress(userId),
        speaking: await getSpeakingProgress(userId),
        reading: await getReadingProgress(userId),
        writing: await getWritingProgress(userId),
      },

      // Achievement progress
      achievementProgress: {
        totalAchievements: achievementProgress.totalAchievements,
        unlockedAchievements: achievementProgress.unlockedAchievements,
        achievementRate: achievementProgress.achievementRate,
        recentAchievements: achievementProgress.recentAchievements,
      },

      // Goal progress
      goalProgress: {
        totalGoals: goalProgress.totalGoals,
        completedGoals: goalProgress.completedGoals,
        inProgressGoals: goalProgress.inProgressGoals,
        goalCompletionRate: goalProgress.completionRate,
      },

      // Overall metrics
      overallMetrics: {
        totalStudyTime: await calculateTotalStudyTime(userId),
        averageDailyStudyTime: await calculateAverageDailyStudyTime(userId),
        currentStreak: await calculateCurrentStreak(userId),
        longestStreak: await calculateLongestStreak(userId),
        totalPoints: await calculateTotalPoints(userId),
        level: await calculateUserLevel(userId),
        experiencePoints: await calculateExperiencePoints(userId),
      },
    };

    return overallProgress;
  } catch (error) {
    console.error("Error fetching overall progress:", error);
    throw new Error("Failed to fetch overall progress");
  }
};

/**
 * Get course-specific progress
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID (optional)
 * @returns {Promise<Object>} Course progress data
 */
export const getCourseProgress = async (userId, courseId = null) => {
  try {
    // Query enrollments collection instead of user's enrolledCourses
    const enrollmentsRef = collection(db, "enrollments");
    let enrollmentsQuery;

    if (courseId) {
      enrollmentsQuery = query(
        enrollmentsRef,
        where("userId", "==", userId),
        where("courseId", "==", courseId),
        where("status", "==", "active")
      );
    } else {
      enrollmentsQuery = query(
        enrollmentsRef,
        where("userId", "==", userId),
        where("status", "==", "active")
      );
    }

    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    const enrollments = enrollmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const progressData = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter((enrollment) => enrollment.progress === 100)
        .length,
      inProgressCourses: enrollments.filter(
        (enrollment) => enrollment.progress > 0 && enrollment.progress < 100
      ).length,
      totalLessons: enrollments.reduce(
        (sum, enrollment) => sum + (enrollment.totalLessons || 0),
        0
      ),
      completedLessons: enrollments.reduce(
        (sum, enrollment) => sum + (enrollment.completedLessons || 0),
        0
      ),
      averageProgress:
        enrollments.length > 0
          ? Math.round(
              enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) /
                enrollments.length
            )
          : 0,
      lessonCompletionRate:
        enrollments.reduce((sum, enrollment) => sum + (enrollment.totalLessons || 0), 0) > 0
          ? Math.round(
              (enrollments.reduce(
                (sum, enrollment) => sum + (enrollment.completedLessons || 0),
                0
              ) /
                enrollments.reduce(
                  (sum, enrollment) => sum + (enrollment.totalLessons || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progressData;
  } catch (error) {
    console.error("Error fetching course progress:", error);
    throw new Error("Failed to fetch course progress");
  }
};

/**
 * Get lesson-specific progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Lesson progress data
 */
export const getLessonProgress = async (userId) => {
  try {
    const userLessonsRef = collection(db, "users", userId, "lessonProgress");
    const lessonsSnapshot = await getDocs(userLessonsRef);
    const lessons = lessonsSnapshot.docs.map((doc) => doc.data());

    const progressData = {
      totalLessons: lessons.length,
      completedLessons: lessons.filter(
        (lesson) => lesson.status === "completed"
      ).length,
      inProgressLessons: lessons.filter(
        (lesson) => lesson.status === "in_progress"
      ).length,
      notStartedLessons: lessons.filter(
        (lesson) => lesson.status === "not_started"
      ).length,
      averageScore:
        lessons.length > 0
          ? Math.round(
              lessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) /
                lessons.length
            )
          : 0,
      totalStudyTime: lessons.reduce(
        (sum, lesson) => sum + (lesson.studyTime || 0),
        0
      ),
      averageStudyTime:
        lessons.length > 0
          ? Math.round(
              lessons.reduce(
                (sum, lesson) => sum + (lesson.studyTime || 0),
                0
              ) / lessons.length
            )
          : 0,
    };

    return progressData;
  } catch (error) {
    console.error("Error fetching lesson progress:", error);
    throw new Error("Failed to fetch lesson progress");
  }
};

/**
 * Get vocabulary progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Vocabulary progress data
 */
export const getVocabularyProgress = async (userId) => {
  try {
    const vocabularyProgressRef = collection(
      db,
      "users",
      userId,
      "vocabularyProgress"
    );
    const progressSnapshot = await getDocs(vocabularyProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalWords: progressData.reduce(
        (sum, progress) => sum + (progress.totalWords || 0),
        0
      ),
      learnedWords: progressData.reduce(
        (sum, progress) => sum + (progress.learnedWords || 0),
        0
      ),
      accuracyRate:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.accuracyRate || 0),
                0
              ) / progressData.length
            )
          : 0,
      practiceSessions: progressData.reduce(
        (sum, progress) => sum + (progress.practiceSessions || 0),
        0
      ),
      progressPercentage:
        progressData.reduce(
          (sum, progress) => sum + (progress.totalWords || 0),
          0
        ) > 0
          ? Math.round(
              (progressData.reduce(
                (sum, progress) => sum + (progress.learnedWords || 0),
                0
              ) /
                progressData.reduce(
                  (sum, progress) => sum + (progress.totalWords || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching vocabulary progress:", error);
    throw new Error("Failed to fetch vocabulary progress");
  }
};

/**
 * Get pronunciation progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Pronunciation progress data
 */
export const getPronunciationProgress = async (userId) => {
  try {
    const pronunciationProgressRef = collection(
      db,
      "users",
      userId,
      "pronunciationProgress"
    );
    const progressSnapshot = await getDocs(pronunciationProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalWords: progressData.reduce(
        (sum, progress) => sum + (progress.totalWords || 0),
        0
      ),
      practicedWords: progressData.reduce(
        (sum, progress) => sum + (progress.practicedWords || 0),
        0
      ),
      averageAccuracy:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.accuracyRate || 0),
                0
              ) / progressData.length
            )
          : 0,
      perfectScores: progressData.reduce(
        (sum, progress) => sum + (progress.perfectScores || 0),
        0
      ),
      practiceSessions: progressData.reduce(
        (sum, progress) => sum + (progress.practiceSessions || 0),
        0
      ),
      progressPercentage:
        progressData.reduce(
          (sum, progress) => sum + (progress.totalWords || 0),
          0
        ) > 0
          ? Math.round(
              (progressData.reduce(
                (sum, progress) => sum + (progress.practicedWords || 0),
                0
              ) /
                progressData.reduce(
                  (sum, progress) => sum + (progress.totalWords || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching pronunciation progress:", error);
    throw new Error("Failed to fetch pronunciation progress");
  }
};

/**
 * Get achievement progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Achievement progress data
 */
export const getAchievementProgress = async (userId) => {
  try {
    const achievementsRef = collection(db, "users", userId, "achievements");
    const achievementsSnapshot = await getDocs(achievementsRef);
    const achievements = achievementsSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalAchievements: achievements.length,
      unlockedAchievements: achievements.filter((ach) => ach.isUnlocked).length,
      achievementRate:
        achievements.length > 0
          ? Math.round(
              (achievements.filter((ach) => ach.isUnlocked).length /
                achievements.length) *
                100
            )
          : 0,
      recentAchievements: achievements
        .filter((ach) => ach.isUnlocked && ach.unlockDate)
        .sort((a, b) => new Date(b.unlockDate) - new Date(a.unlockDate))
        .slice(0, 5),
    };

    return progress;
  } catch (error) {
    console.error("Error fetching achievement progress:", error);
    throw new Error("Failed to fetch achievement progress");
  }
};

/**
 * Get goal progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Goal progress data
 */
export const getGoalProgress = async (userId) => {
  try {
    const goalsRef = collection(db, "users", userId, "goals");
    const goalsSnapshot = await getDocs(goalsRef);
    const goals = goalsSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalGoals: goals.length,
      completedGoals: goals.filter((goal) => goal.status === "completed")
        .length,
      inProgressGoals: goals.filter((goal) => goal.status === "in_progress")
        .length,
      completionRate:
        goals.length > 0
          ? Math.round(
              (goals.filter((goal) => goal.status === "completed").length /
                goals.length) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    throw new Error("Failed to fetch goal progress");
  }
};

/**
 * Get grammar progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Grammar progress data
 */
export const getGrammarProgress = async (userId) => {
  try {
    const grammarProgressRef = collection(
      db,
      "users",
      userId,
      "grammarProgress"
    );
    const progressSnapshot = await getDocs(grammarProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalExercises: progressData.reduce(
        (sum, progress) => sum + (progress.totalExercises || 0),
        0
      ),
      completedExercises: progressData.reduce(
        (sum, progress) => sum + (progress.completedExercises || 0),
        0
      ),
      averageScore:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.averageScore || 0),
                0
              ) / progressData.length
            )
          : 0,
      accuracyRate:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.accuracyRate || 0),
                0
              ) / progressData.length
            )
          : 0,
      progressPercentage:
        progressData.reduce(
          (sum, progress) => sum + (progress.totalExercises || 0),
          0
        ) > 0
          ? Math.round(
              (progressData.reduce(
                (sum, progress) => sum + (progress.completedExercises || 0),
                0
              ) /
                progressData.reduce(
                  (sum, progress) => sum + (progress.totalExercises || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching grammar progress:", error);
    return { progress: 0, accuracy: 0, exercisesCompleted: 0 };
  }
};

/**
 * Get listening progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Listening progress data
 */
export const getListeningProgress = async (userId) => {
  try {
    const listeningProgressRef = collection(
      db,
      "users",
      userId,
      "listeningProgress"
    );
    const progressSnapshot = await getDocs(listeningProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalExercises: progressData.reduce(
        (sum, progress) => sum + (progress.totalExercises || 0),
        0
      ),
      completedExercises: progressData.reduce(
        (sum, progress) => sum + (progress.completedExercises || 0),
        0
      ),
      averageScore:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.averageScore || 0),
                0
              ) / progressData.length
            )
          : 0,
      comprehensionRate:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.comprehensionRate || 0),
                0
              ) / progressData.length
            )
          : 0,
      progressPercentage:
        progressData.reduce(
          (sum, progress) => sum + (progress.totalExercises || 0),
          0
        ) > 0
          ? Math.round(
              (progressData.reduce(
                (sum, progress) => sum + (progress.completedExercises || 0),
                0
              ) /
                progressData.reduce(
                  (sum, progress) => sum + (progress.totalExercises || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching listening progress:", error);
    return { progress: 0, comprehension: 0, exercisesCompleted: 0 };
  }
};

/**
 * Get speaking progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Speaking progress data
 */
export const getSpeakingProgress = async (userId) => {
  try {
    const speakingProgressRef = collection(
      db,
      "users",
      userId,
      "speakingProgress"
    );
    const progressSnapshot = await getDocs(speakingProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalSessions: progressData.reduce(
        (sum, progress) => sum + (progress.totalSessions || 0),
        0
      ),
      completedSessions: progressData.reduce(
        (sum, progress) => sum + (progress.completedSessions || 0),
        0
      ),
      averageFluency:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.averageFluency || 0),
                0
              ) / progressData.length
            )
          : 0,
      confidenceRate:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.confidenceRate || 0),
                0
              ) / progressData.length
            )
          : 0,
      progressPercentage:
        progressData.reduce(
          (sum, progress) => sum + (progress.totalSessions || 0),
          0
        ) > 0
          ? Math.round(
              (progressData.reduce(
                (sum, progress) => sum + (progress.completedSessions || 0),
                0
              ) /
                progressData.reduce(
                  (sum, progress) => sum + (progress.totalSessions || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching speaking progress:", error);
    return { progress: 0, fluency: 0, sessionsCompleted: 0 };
  }
};

/**
 * Get reading progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Reading progress data
 */
export const getReadingProgress = async (userId) => {
  try {
    const readingProgressRef = collection(
      db,
      "users",
      userId,
      "readingProgress"
    );
    const progressSnapshot = await getDocs(readingProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalTexts: progressData.reduce(
        (sum, progress) => sum + (progress.totalTexts || 0),
        0
      ),
      completedTexts: progressData.reduce(
        (sum, progress) => sum + (progress.completedTexts || 0),
        0
      ),
      averageComprehension:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.averageComprehension || 0),
                0
              ) / progressData.length
            )
          : 0,
      readingSpeed:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.readingSpeed || 0),
                0
              ) / progressData.length
            )
          : 0,
      progressPercentage:
        progressData.reduce(
          (sum, progress) => sum + (progress.totalTexts || 0),
          0
        ) > 0
          ? Math.round(
              (progressData.reduce(
                (sum, progress) => sum + (progress.completedTexts || 0),
                0
              ) /
                progressData.reduce(
                  (sum, progress) => sum + (progress.totalTexts || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching reading progress:", error);
    return { progress: 0, comprehension: 0, textsCompleted: 0 };
  }
};

/**
 * Get writing progress
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Writing progress data
 */
export const getWritingProgress = async (userId) => {
  try {
    const writingProgressRef = collection(
      db,
      "users",
      userId,
      "writingProgress"
    );
    const progressSnapshot = await getDocs(writingProgressRef);
    const progressData = progressSnapshot.docs.map((doc) => doc.data());

    const progress = {
      totalAssignments: progressData.reduce(
        (sum, progress) => sum + (progress.totalAssignments || 0),
        0
      ),
      completedAssignments: progressData.reduce(
        (sum, progress) => sum + (progress.completedAssignments || 0),
        0
      ),
      averageScore:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.averageScore || 0),
                0
              ) / progressData.length
            )
          : 0,
      grammarAccuracy:
        progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (sum, progress) => sum + (progress.grammarAccuracy || 0),
                0
              ) / progressData.length
            )
          : 0,
      progressPercentage:
        progressData.reduce(
          (sum, progress) => sum + (progress.totalAssignments || 0),
          0
        ) > 0
          ? Math.round(
              (progressData.reduce(
                (sum, progress) => sum + (progress.completedAssignments || 0),
                0
              ) /
                progressData.reduce(
                  (sum, progress) => sum + (progress.totalAssignments || 0),
                  0
                )) *
                100
            )
          : 0,
    };

    return progress;
  } catch (error) {
    console.error("Error fetching writing progress:", error);
    return { progress: 0, accuracy: 0, assignmentsCompleted: 0 };
  }
};

// Helper functions for overall metrics
const calculateTotalStudyTime = async (userId) => {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const activitiesSnapshot = await getDocs(activitiesRef);
    const activities = activitiesSnapshot.docs.map((doc) => doc.data());

    return activities.reduce(
      (sum, activity) => sum + (activity.duration || 0),
      0
    );
  } catch (error) {
    console.error("Error calculating total study time:", error);
    return 0;
  }
};

const calculateAverageDailyStudyTime = async (userId) => {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const activitiesSnapshot = await getDocs(activitiesRef);
    const activities = activitiesSnapshot.docs.map((doc) => doc.data());

    if (activities.length === 0) return 0;

    const totalStudyTime = activities.reduce(
      (sum, activity) => sum + (activity.duration || 0),
      0
    );
    const studyDays = new Set(
      activities.map(
        (activity) => activity.timestamp.toDate().toISOString().split("T")[0]
      )
    ).size;

    return studyDays > 0 ? Math.round(totalStudyTime / studyDays) : 0;
  } catch (error) {
    console.error("Error calculating average daily study time:", error);
    return 0;
  }
};

const calculateCurrentStreak = async (userId) => {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const activitiesSnapshot = await getDocs(activitiesRef);
    const activities = activitiesSnapshot.docs
      .map((doc) => doc.data())
      .filter(
        (act) =>
          act.type === "lesson_completed" || act.type === "vocabulary_practice"
      )
      .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

    if (activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const dayActivities = activities.filter((act) => {
        const actDate = new Date(act.timestamp.toDate());
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === currentDate.getTime();
      });

      if (dayActivities.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating current streak:", error);
    return 0;
  }
};

const calculateLongestStreak = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    return userData?.longestStreak || 0;
  } catch (error) {
    console.error("Error calculating longest streak:", error);
    return 0;
  }
};

const calculateTotalPoints = async (userId) => {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const activitiesSnapshot = await getDocs(activitiesRef);
    const activities = activitiesSnapshot.docs.map((doc) => doc.data());

    return activities.reduce(
      (sum, activity) => sum + (activity.points || 0),
      0
    );
  } catch (error) {
    console.error("Error calculating total points:", error);
    return 0;
  }
};

const calculateUserLevel = async (userId) => {
  try {
    const totalPoints = await calculateTotalPoints(userId);

    // Simple level calculation based on points
    if (totalPoints < 100) return 1;
    if (totalPoints < 500) return 2;
    if (totalPoints < 1000) return 3;
    if (totalPoints < 2000) return 4;
    if (totalPoints < 5000) return 5;
    return Math.floor(totalPoints / 1000) + 1;
  } catch (error) {
    console.error("Error calculating user level:", error);
    return 1;
  }
};

const calculateExperiencePoints = async (userId) => {
  try {
    const activitiesRef = collection(db, "users", userId, "activities");
    const activitiesSnapshot = await getDocs(activitiesRef);
    const activities = activitiesSnapshot.docs.map((doc) => doc.data());

    return activities.reduce(
      (sum, activity) => sum + (activity.experiencePoints || 0),
      0
    );
  } catch (error) {
    console.error("Error calculating experience points:", error);
    return 0;
  }
};

export default {
  getOverallProgress,
  getCourseProgress,
  getLessonProgress,
  getVocabularyProgress,
  getPronunciationProgress,
  getAchievementProgress,
  getGoalProgress,
  getGrammarProgress,
  getListeningProgress,
  getSpeakingProgress,
  getReadingProgress,
  getWritingProgress,
};
