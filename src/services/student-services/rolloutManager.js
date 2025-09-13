import { db } from "../../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getFeatureFlags, checkFeatureFlag } from "./featureFlags";

const ROLLOUT_COLLECTION = "rolloutManagement";

/**
 * Rollout management system for lesson completion requirements
 */
export class RolloutManager {
  constructor() {
    this.rolloutConfig = null;
    this.monitoringData = {};
  }

  /**
   * Initialize rollout configuration
   */
  async initialize() {
    try {
      const configRef = doc(db, ROLLOUT_COLLECTION, "lessonCompletion");
      const configDoc = await getDoc(configRef);

      if (configDoc.exists()) {
        this.rolloutConfig = configDoc.data();
      } else {
        // Default configuration
        this.rolloutConfig = {
          currentPhase: "pilot",
          phases: {
            pilot: {
              name: "Pilot Testing",
              description: "Testing with select users",
              rolloutPercentage: 5,
              maxUsers: 100,
              duration: "2 weeks",
              criteria: {
                userTypes: ["premium", "active"],
                courseIds: [],
                userIds: [],
              },
            },
            beta: {
              name: "Beta Release",
              description: "Expanded testing",
              rolloutPercentage: 25,
              maxUsers: 500,
              duration: "4 weeks",
              criteria: {
                userTypes: ["premium", "active", "regular"],
                courseIds: [],
                userIds: [],
              },
            },
            general: {
              name: "General Release",
              description: "Full rollout",
              rolloutPercentage: 100,
              maxUsers: null,
              duration: "ongoing",
              criteria: {
                userTypes: ["all"],
                courseIds: [],
                userIds: [],
              },
            },
          },
          monitoring: {
            enabled: true,
            metrics: ["completion_rate", "user_satisfaction", "error_rate"],
            alerts: {
              errorRateThreshold: 5,
              satisfactionThreshold: 70,
              completionRateThreshold: 60,
            },
          },
          rollback: {
            enabled: true,
            autoRollback: true,
            rollbackTriggers: ["high_error_rate", "low_satisfaction", "manual"],
          },
        };

        // Save default configuration
        await setDoc(configRef, this.rolloutConfig);
      }
    } catch (error) {
      console.error("Error initializing rollout manager:", error);
    }
  }

  /**
   * Check if user should have feature enabled
   */
  async shouldEnableFeature(userId, userData = {}) {
    try {
      if (!this.rolloutConfig) {
        await this.initialize();
      }

      const currentPhase =
        this.rolloutConfig.phases[this.rolloutConfig.currentPhase];
      if (!currentPhase) return false;

      // Check user criteria
      if (currentPhase.criteria.userIds.length > 0) {
        return currentPhase.criteria.userIds.includes(userId);
      }

      // Check course criteria
      if (currentPhase.criteria.courseIds.length > 0 && userData.courseId) {
        return currentPhase.criteria.courseIds.includes(userData.courseId);
      }

      // Check user type criteria
      if (currentPhase.criteria.userTypes.includes("all")) {
        return this.checkRolloutPercentage(
          userId,
          currentPhase.rolloutPercentage
        );
      }

      if (currentPhase.criteria.userTypes.includes(userData.userType)) {
        return this.checkRolloutPercentage(
          userId,
          currentPhase.rolloutPercentage
        );
      }

      return false;
    } catch (error) {
      console.error("Error checking feature enablement:", error);
      return false; // Fail safely - feature disabled
    }
  }

  /**
   * Check rollout percentage for user
   */
  checkRolloutPercentage(userId, percentage) {
    if (percentage >= 100) return true;

    // Simple hash-based distribution
    const userHash = userId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return userHash % 100 < percentage;
  }

  /**
   * Advance to next rollout phase
   */
  async advancePhase() {
    try {
      const phases = Object.keys(this.rolloutConfig.phases);
      const currentIndex = phases.indexOf(this.rolloutConfig.currentPhase);

      if (currentIndex < phases.length - 1) {
        const nextPhase = phases[currentIndex + 1];
        await this.setPhase(nextPhase);
        return nextPhase;
      }

      return null; // Already at final phase
    } catch (error) {
      console.error("Error advancing rollout phase:", error);
      return null;
    }
  }

  /**
   * Set specific rollout phase
   */
  async setPhase(phaseName) {
    try {
      const configRef = doc(db, ROLLOUT_COLLECTION, "lessonCompletion");

      await updateDoc(configRef, {
        currentPhase: phaseName,
        lastUpdated: new Date().toISOString(),
      });

      this.rolloutConfig.currentPhase = phaseName;

      console.log(`Rollout phase changed to: ${phaseName}`);
      return phaseName;
    } catch (error) {
      console.error("Error setting rollout phase:", error);
      return null;
    }
  }

  /**
   * Emergency rollback
   */
  async emergencyRollback() {
    try {
      console.log("Initiating emergency rollback...");

      // Disable all features
      const flagsRef = doc(db, "featureFlags", "lessonCompletion");
      await updateDoc(flagsRef, {
        lessonRequirements: { enabled: false, rolloutPercentage: 0 },
        contentTracking: { enabled: false, trackingLevel: "basic" },
        lastUpdated: new Date().toISOString(),
      });

      // Set phase to pilot
      await this.setPhase("pilot");

      console.log("Emergency rollback completed");
      return true;
    } catch (error) {
      console.error("Error during emergency rollback:", error);
      return false;
    }
  }

  /**
   * Get current rollout status
   */
  getRolloutStatus() {
    if (!this.rolloutConfig) return null;

    const currentPhase =
      this.rolloutConfig.phases[this.rolloutConfig.currentPhase];
    return {
      currentPhase: this.rolloutConfig.currentPhase,
      phaseInfo: currentPhase,
      monitoring: this.rolloutConfig.monitoring,
      rollback: this.rolloutConfig.rollback,
    };
  }

  /**
   * Monitor rollout metrics
   */
  async monitorMetrics() {
    try {
      // Get monitoring data
      const monitoringRef = doc(db, "lessonCompletionMonitoring", "metrics");
      const monitoringDoc = await getDoc(monitoringRef);

      if (!monitoringDoc.exists()) {
        return { error: "No monitoring data available" };
      }

      const data = monitoringDoc.data();

      // Check for rollback triggers
      const shouldRollback = this.checkRollbackTriggers(data);

      if (shouldRollback && this.rolloutConfig.rollback.autoRollback) {
        console.log("Auto-rollback triggered due to metrics");
        await this.emergencyRollback();
        return { rollback: true, reason: shouldRollback };
      }

      return { data, shouldRollback };
    } catch (error) {
      console.error("Error monitoring metrics:", error);
      return { error: error.message };
    }
  }

  /**
   * Check if rollback should be triggered
   */
  checkRollbackTriggers(metrics) {
    const alerts = this.rolloutConfig.monitoring.alerts;

    if (metrics.errorRate > alerts.errorRateThreshold) {
      return "high_error_rate";
    }

    if (metrics.satisfactionScore < alerts.satisfactionThreshold) {
      return "low_satisfaction";
    }

    if (metrics.completionRate < alerts.completionRateThreshold) {
      return "low_completion_rate";
    }

    return null;
  }
}

// Export singleton instance
export const rolloutManager = new RolloutManager();
