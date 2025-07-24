// studentPronunciationProgressService.js
// Ported from migrate/lib/services/pronunciation_progress_service.dart
// Handles pronunciation progress logic and Firestore integration for students

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

const PRONUNCIATION_PROGRESS_COLLECTION = "pronunciation_progress";

// Save pronunciation attempt
export async function savePronunciationProgress(progressData) {
  try {
    const newProgress = {
      ...progressData,
      createdAt: serverTimestamp(),
    };
    await addDoc(
      collection(db, PRONUNCIATION_PROGRESS_COLLECTION),
      newProgress
    );
  } catch (e) {
    console.error("Error saving pronunciation progress:", e);
  }
}

// Get all pronunciation progress for a user
export async function getPronunciationProgressByUser(userId) {
  try {
    const q = query(
      collection(db, PRONUNCIATION_PROGRESS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting pronunciation progress:", e);
    return [];
  }
}

const studentPronunciationProgressService = {
  savePronunciationProgress,
  getPronunciationProgressByUser,
};

export default studentPronunciationProgressService;
