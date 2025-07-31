// studentLearningPathService.js
// Service to manage learning path configuration and dynamic data

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const LEARNING_PATH_CONFIG_COLLECTION = "learning_path_config";
const USER_LEARNING_PROGRESS_COLLECTION = "user_learning_progress";

/**
 * Get learning path configuration from Firestore
 * @param {string} userId - User ID (optional, for personalized config)
 * @returns {Promise<Array>} Learning path configuration
 */
export const getLearningPathConfig = async (userId = null) => {
  try {
    // First try to get user-specific configuration
    if (userId) {
      const userConfigRef = doc(db, LEARNING_PATH_CONFIG_COLLECTION, userId);
      const userConfigDoc = await getDoc(userConfigRef);

      if (userConfigDoc.exists()) {
        return userConfigDoc.data().paths || getDefaultLearningPaths();
      }
    }

    // Fallback to global configuration
    const globalConfigRef = doc(db, LEARNING_PATH_CONFIG_COLLECTION, "global");
    const globalConfigDoc = await getDoc(globalConfigRef);

    if (globalConfigDoc.exists()) {
      return globalConfigDoc.data().paths || getDefaultLearningPaths();
    }

    // Final fallback to default configuration
    return getDefaultLearningPaths();
  } catch (error) {
    console.error("Error fetching learning path config:", error);
    return getDefaultLearningPaths();
  }
};

/**
 * Get user's learning progress for each path
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's learning progress
 */
export const getUserLearningProgress = async (userId) => {
  try {
    const progressRef = collection(
      db,
      "users",
      userId,
      USER_LEARNING_PROGRESS_COLLECTION
    );
    const progressSnapshot = await getDocs(progressRef);

    const progress = {};
    progressSnapshot.docs.forEach((doc) => {
      progress[doc.id] = doc.data();
    });

    return progress;
  } catch (error) {
    console.error("Error fetching user learning progress:", error);
    return {};
  }
};

/**
 * Update user's learning progress for a specific path
 * @param {string} userId - User ID
 * @param {string} pathId - Learning path ID
 * @param {Object} progressData - Progress data
 * @returns {Promise<void>}
 */
export const updateUserLearningProgress = async (
  userId,
  pathId,
  progressData
) => {
  try {
    const progressRef = doc(
      db,
      "users",
      userId,
      USER_LEARNING_PROGRESS_COLLECTION,
      pathId
    );
    await setDoc(progressRef, {
      ...progressData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user learning progress:", error);
    throw new Error("Failed to update learning progress");
  }
};

/**
 * Get combined learning path data with user progress
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Learning paths with user progress
 */
export const getLearningPathsWithProgress = async (userId) => {
  try {
    const [config, userProgress] = await Promise.all([
      getLearningPathConfig(userId),
      getUserLearningProgress(userId),
    ]);

    return config.map((path) => ({
      ...path,
      progress: userProgress[path.id]?.progress || 0,
      lastAccessed: userProgress[path.id]?.lastAccessed,
      status: userProgress[path.id]?.status || "not_started",
    }));
  } catch (error) {
    console.error("Error fetching learning paths with progress:", error);
    return getDefaultLearningPaths();
  }
};

/**
 * Default learning path configuration
 * @returns {Array} Default learning paths
 */
const getDefaultLearningPaths = () => [
  {
    id: "hard_words",
    title: "Hard Words",
    icon: "📄",
    description: "Master challenging vocabulary and complex terms",
    color: "#1976d2",
    route: "/hard-words",
    category: "vocabulary",
    difficulty: "intermediate",
    estimatedDuration: "2-3 weeks",
    prerequisites: [],
  },
  {
    id: "vocabulary",
    title: "Vocabulary",
    icon: "🌐",
    description: "Build your vocabulary foundation",
    color: "#388e3c",
    route: "/vocabulary",
    category: "vocabulary",
    difficulty: "beginner",
    estimatedDuration: "4-6 weeks",
    prerequisites: [],
  },
  {
    id: "listening",
    title: "Listening",
    icon: "🎧",
    description: "Improve your listening comprehension skills",
    color: "#8e24aa",
    route: "/listening-practice",
    category: "comprehension",
    difficulty: "beginner",
    estimatedDuration: "3-4 weeks",
    prerequisites: ["vocabulary"],
  },
  {
    id: "speaking",
    title: "Speaking",
    icon: "🎤",
    description: "Develop your speaking and pronunciation skills",
    color: "#e53935",
    route: "/speaking",
    category: "production",
    difficulty: "intermediate",
    estimatedDuration: "4-5 weeks",
    prerequisites: ["vocabulary", "listening"],
  },
  {
    id: "grammar",
    title: "Grammar",
    icon: "📚",
    description: "Master essential grammar rules and structures",
    color: "#ff9800",
    route: "/grammar",
    category: "structure",
    difficulty: "beginner",
    estimatedDuration: "6-8 weeks",
    prerequisites: ["vocabulary"],
  },
  {
    id: "pronunciation",
    title: "Pronunciation",
    icon: "🎯",
    description: "Perfect your pronunciation and accent",
    color: "#9c27b0",
    route: "/pronunciation",
    category: "production",
    difficulty: "intermediate",
    estimatedDuration: "3-4 weeks",
    prerequisites: ["vocabulary", "listening"],
  },
];

/**
 * Initialize global learning path configuration
 * @returns {Promise<void>}
 */
export const initializeGlobalLearningPathConfig = async () => {
  try {
    const globalConfigRef = doc(db, LEARNING_PATH_CONFIG_COLLECTION, "global");
    await setDoc(globalConfigRef, {
      paths: getDefaultLearningPaths(),
      version: "1.0.0",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error initializing global learning path config:", error);
  }
};

const studentLearningPathService = {
  getLearningPathConfig,
  getUserLearningProgress,
  updateUserLearningProgress,
  getLearningPathsWithProgress,
  initializeGlobalLearningPathConfig,
};

export default studentLearningPathService;
