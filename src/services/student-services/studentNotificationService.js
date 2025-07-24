// studentNotificationService.js
// Ported from migrate/lib/services/notification_service.dart
// Handles notification logic for students (Firestore + browser notifications)

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const NOTIFICATIONS_COLLECTION = "notifications";

// Send a notification (Firestore + browser notification)
export async function sendNotification({ userId, title, body, data = {} }) {
  try {
    // Save to Firestore
    const notification = {
      userId,
      title,
      body,
      data,
      createdAt: serverTimestamp(),
      read: false,
    };
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    // Browser notification (if allowed)
    if (window.Notification && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch (e) {
    console.error("Error sending notification:", e);
  }
}

// Get notifications for a user
export async function getUserNotifications(userId) {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting user notifications:", e);
    return [];
  }
}

// Mark a notification as read
export async function markNotificationRead(notificationId) {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (e) {
    console.error("Error marking notification as read:", e);
  }
}

// Delete a notification
export async function deleteNotification(notificationId) {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (e) {
    console.error("Error deleting notification:", e);
    throw e;
  }
}

const studentNotificationService = {
  sendNotification,
  getUserNotifications,
  markNotificationRead,
  deleteNotification,
};

export default studentNotificationService;
