// studentMessageService.js
// Ported from migrate/lib/services/message_service.dart
// Handles message/chat logic and Firestore integration for students

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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const MESSAGES_COLLECTION = "messages";

// Send a message
export async function sendMessage({ lessonId, userId, receiverId, content }) {
  try {
    const message = {
      lessonId,
      userId,
      receiverId,
      content,
      createdAt: new Date(),
      participants: [userId, receiverId],
    };
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), message);
    await updateDoc(docRef, { id: docRef.id });
    return { id: docRef.id, ...message };
  } catch (e) {
    console.error("Error sending message:", e);
    throw e;
  }
}

// Get all messages for a user (inbox)
export async function getUserMessages(userId) {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("participants", "array-contains", userId)
    );
    const snapshot = await getDocs(q);
    // Deduplicate by message ID
    const uniqueMessages = {};
    snapshot.docs.forEach((doc) => {
      uniqueMessages[doc.id] = { id: doc.id, ...doc.data() };
    });
    return Object.values(uniqueMessages).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  } catch (e) {
    console.error("Error getting user messages:", e);
    return [];
  }
}

// Get messages for a conversation between two users
export async function getConversation(userId1, userId2) {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("participants", "in", [
        [userId1, userId2],
        [userId2, userId1],
      ])
    );
    const snapshot = await getDocs(q);
    const uniqueMessages = {};
    snapshot.docs.forEach((doc) => {
      uniqueMessages[doc.id] = { id: doc.id, ...doc.data() };
    });
    return Object.values(uniqueMessages).sort(
      (a, b) => a.createdAt - b.createdAt
    );
  } catch (e) {
    console.error("Error getting conversation:", e);
    return [];
  }
}

// Delete a message
export async function deleteMessage(messageId) {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await deleteDoc(messageRef);
    return true;
  } catch (e) {
    console.error("Error deleting message:", e);
    throw e;
  }
}

const studentMessageService = {
  sendMessage,
  getUserMessages,
  getConversation,
  deleteMessage,
};

export default studentMessageService;
