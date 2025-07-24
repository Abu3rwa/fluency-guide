// studentRecentActivityService.js
// Ported from migrate/lib/services/recent_activity_service.dart
// Handles recent activity logic and Firestore integration for students

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const RECENT_ACTIVITIES_COLLECTION = "recent_activities";

// Save or update a recent activity
export async function saveActivity(activityData) {
  try {
    const newActivity = {
      ...activityData,
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, RECENT_ACTIVITIES_COLLECTION), newActivity);
  } catch (e) {
    console.error("Error saving activity:", e);
  }
}

// Get incomplete activities for a user
export async function getIncompleteActivities(userId) {
  try {
    const q = query(
      collection(db, RECENT_ACTIVITIES_COLLECTION),
      where("userId", "==", userId),
      where("status", "!=", "completed")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting incomplete activities:", e);
    return [];
  }
}

const studentRecentActivityService = {
  saveActivity,
  getIncompleteActivities,
};

export default studentRecentActivityService;
