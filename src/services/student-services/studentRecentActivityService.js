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
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
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

// Get recent activities for a user
export async function getUserRecentActivities(userId, limitCount = 10) {
  try {
    const q = query(
      collection(db, RECENT_ACTIVITIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("lastAccessed", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ 
      id: doc.id, 
      ...doc.data(),
      lastAccessed: doc.data().lastAccessed?.toDate?.() || doc.data().lastAccessed,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));
  } catch (e) {
    console.error("Error getting recent activities:", e);
    return [];
  }
}

// Get incomplete activities for a user
export async function getIncompleteActivities(userId) {
  try {
    const q = query(
      collection(db, RECENT_ACTIVITIES_COLLECTION),
      where("userId", "==", userId),
      where("status", "in", ["inProgress", "failed", "notStarted"])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ 
      id: doc.id, 
      ...doc.data(),
      lastAccessed: doc.data().lastAccessed?.toDate?.() || doc.data().lastAccessed,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));
  } catch (e) {
    console.error("Error getting incomplete activities:", e);
    return [];
  }
}

// Update activity progress
export async function updateActivityProgress(activityId, progress, status) {
  try {
    const activityRef = doc(db, RECENT_ACTIVITIES_COLLECTION, activityId);
    await updateDoc(activityRef, {
      progress,
      status,
      lastAccessed: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error updating activity progress:", e);
    throw new Error("Failed to update activity progress");
  }
}

// Create activity from task attempt
export async function createActivityFromTaskAttempt(
  taskId,
  userId,
  targetId,
  taskTitle,
  lessonId,
  courseId,
  status = "notStarted",
  progress = 0.0,
  score = null,
  timeSpent = null,
  totalQuestions = null
) {
  try {
    const activity = {
      taskId,
      userId,
      title: taskTitle,
      description: "Complete the task to continue your learning journey",
      type: "task",
      status,
      targetId,
      lessonId,
      courseId,
      lastAccessed: serverTimestamp(),
      progress,
      score,
      timeSpent,
      totalQuestions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, RECENT_ACTIVITIES_COLLECTION), activity);
    return {
      id: docRef.id,
      ...activity,
    };
  } catch (e) {
    console.error("Error creating activity from task attempt:", e);
    throw new Error("Failed to create activity from task attempt");
  }
}

const studentRecentActivityService = {
  saveActivity,
  getUserRecentActivities,
  getIncompleteActivities,
  updateActivityProgress,
  createActivityFromTaskAttempt,
};

export default studentRecentActivityService;
