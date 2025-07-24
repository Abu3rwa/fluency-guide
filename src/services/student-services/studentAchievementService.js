// studentAchievementService.js
// Ported from migrate/lib/services/achievement_service.dart
// Handles achievement logic and Firestore integration for students

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const ACHIEVEMENTS_COLLECTION = "achievements";
const USER_ACHIEVEMENTS_COLLECTION = "user_achievements";

// Get all achievements (master list)
export async function getAllAchievements() {
  try {
    const snapshot = await getDocs(collection(db, ACHIEVEMENTS_COLLECTION));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting achievements:", e);
    return [];
  }
}

// Get all user achievements (progress)
export async function getUserAchievements(userId) {
  try {
    const q = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting user achievements:", e);
    return [];
  }
}

// Get user's achievement progress (joined with master data)
export async function getUserAchievementProgress(userId) {
  try {
    const [userAchievements, allAchievements] = await Promise.all([
      getUserAchievements(userId),
      getAllAchievements(),
    ]);
    const userAchievementMap = {};
    userAchievements.forEach((ua) => {
      userAchievementMap[ua.achievementId] = ua;
    });
    return allAchievements.map((achievement) => {
      const userAchievement = userAchievementMap[achievement.id];
      if (userAchievement) {
        return {
          ...achievement,
          unlockDate: userAchievement.isUnlocked
            ? userAchievement.earnedAt
            : null,
          currentProgress: userAchievement.progress,
        };
      }
      return achievement;
    });
  } catch (e) {
    console.error("Error getting user achievement progress:", e);
    return [];
  }
}

// Award an achievement to a user (if not already exists)
export async function awardIfNotExists({ userId, achievementId }) {
  try {
    const q = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where("userId", "==", userId),
      where("achievementId", "==", achievementId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(collection(db, USER_ACHIEVEMENTS_COLLECTION), {
        userId,
        achievementId,
        earnedAt: serverTimestamp(),
        progress: 0,
        isUnlocked: true,
      });
    }
  } catch (e) {
    console.error("Error awarding achievement:", e);
  }
}

// Update achievement progress for a user
export async function updateAchievementProgress(
  userId,
  achievementId,
  progress
) {
  try {
    const q = query(
      collection(db, USER_ACHIEVEMENTS_COLLECTION),
      where("userId", "==", userId),
      where("achievementId", "==", achievementId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      // Update existing
      const docRef = doc(db, USER_ACHIEVEMENTS_COLLECTION, snapshot.docs[0].id);
      await updateDoc(docRef, { progress });
    } else {
      // Create new
      await addDoc(collection(db, USER_ACHIEVEMENTS_COLLECTION), {
        userId,
        achievementId,
        earnedAt: null,
        progress,
        isUnlocked: false,
      });
    }
  } catch (e) {
    console.error("Error updating achievement progress:", e);
  }
}

// Export as a service object for convenience
const studentAchievementService = {
  getAllAchievements,
  getUserAchievements,
  getUserAchievementProgress,
  awardIfNotExists,
  updateAchievementProgress,
};

export default studentAchievementService;
