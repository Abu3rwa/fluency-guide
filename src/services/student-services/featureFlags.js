import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const FEATURE_FLAGS_COLLECTION = "featureFlags";

/**
 * Feature flags configuration for lesson completion requirements
 */
const DEFAULT_FEATURE_FLAGS = {
  lessonRequirements: {
    enabled: false,
    rolloutPercentage: 0,
    courseIds: [],
    userIds: [],
  },
  contentTracking: {
    enabled: false,
    trackingLevel: "basic",
  },
  adaptiveLearning: {
    enabled: false,
    features: [],
  },
};

/**
 * Gets feature flags from Firebase
 * @returns {Promise<Object>} - Feature flags configuration
 */
export const getFeatureFlags = async () => {
  try {
    const flagsRef = doc(db, FEATURE_FLAGS_COLLECTION, "lessonCompletion");
    const flagsDoc = await getDoc(flagsRef);

    if (!flagsDoc.exists()) {
      return DEFAULT_FEATURE_FLAGS;
    }

    return { ...DEFAULT_FEATURE_FLAGS, ...flagsDoc.data() };
  } catch (error) {
    console.error("Error getting feature flags:", error);
    return DEFAULT_FEATURE_FLAGS; // Fail gracefully
  }
};

/**
 * Checks if a specific feature flag is enabled for a user
 * @param {string} flagName - The name of the feature flag
 * @param {Object} userData - User data object
 * @returns {Promise<boolean>} - Whether the feature is enabled
 */
export const checkFeatureFlag = async (flagName, userData = {}) => {
  try {
    const flags = await getFeatureFlags();
    const flag = flags[flagName];

    if (!flag || !flag.enabled) {
      return false;
    }

    // Check if user is in specific user list
    if (flag.userIds && flag.userIds.length > 0) {
      return flag.userIds.includes(userData.uid);
    }

    // Check if course is in specific course list
    if (flag.courseIds && flag.courseIds.length > 0) {
      return flag.courseIds.includes(userData.courseId);
    }

    // Check rollout percentage
    if (flag.rolloutPercentage > 0) {
      const userHash = userData.uid
        ? userData.uid.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
        : 0;
      return userHash % 100 < flag.rolloutPercentage;
    }

    return flag.enabled;
  } catch (error) {
    console.error("Error checking feature flag:", error);
    return false; // Fail gracefully - feature disabled
  }
};

/**
 * React hook for feature flags (for use in components)
 * @param {string} flagName - The name of the feature flag
 * @param {Object} userData - User data object
 * @returns {boolean} - Whether the feature is enabled
 */
export const useFeatureFlag = (flagName, userData = {}) => {
  // This will be implemented as a proper React hook in Phase 2
  // For now, return false to ensure backward compatibility
  return false;
};

/**
 * Checks if lesson requirements feature is enabled for a user
 * @param {Object} userData - User data object
 * @returns {Promise<boolean>} - Whether lesson requirements are enabled
 */
export const isLessonRequirementsEnabled = async (userData = {}) => {
  return checkFeatureFlag("lessonRequirements", userData);
};

/**
 * Checks if content tracking feature is enabled for a user
 * @param {Object} userData - User data object
 * @returns {Promise<boolean>} - Whether content tracking is enabled
 */
export const isContentTrackingEnabled = async (userData = {}) => {
  return checkFeatureFlag("contentTracking", userData);
};
