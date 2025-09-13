import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { checkFeatureFlag } from "../services/student-services/featureFlags";

/**
 * React hook for feature flags
 * @param {string} flagName - The name of the feature flag
 * @returns {Object} - { enabled: boolean, loading: boolean }
 */
export const useFeatureFlag = (flagName) => {
  const { currentUser } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFlag = async () => {
      try {
        setLoading(true);
        const userData = currentUser ? { uid: currentUser.uid } : {};
        const isEnabled = await checkFeatureFlag(flagName, userData);
        setEnabled(isEnabled);
      } catch (error) {
        console.error(`Error checking feature flag ${flagName}:`, error);
        setEnabled(false); // Fail gracefully - feature disabled
      } finally {
        setLoading(false);
      }
    };

    checkFlag();
  }, [flagName, currentUser]);

  return { enabled, loading };
};

/**
 * Hook specifically for lesson requirements feature
 * @returns {Object} - { enabled: boolean, loading: boolean }
 */
export const useLessonRequirements = () => {
  return useFeatureFlag("lessonRequirements");
};

/**
 * Hook specifically for content tracking feature
 * @returns {Object} - { enabled: boolean, loading: boolean }
 */
export const useContentTracking = () => {
  return useFeatureFlag("contentTracking");
};
