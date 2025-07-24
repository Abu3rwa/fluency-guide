// studentVocabularyProgressService.js
// Ported from migrate/lib/services/vocabulary_progress_service.dart
// Handles vocabulary progress logic and Firestore integration for students

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

const VOCABULARY_PROGRESS_COLLECTION = "vocabulary_progress";

// Save vocabulary progress
export async function saveVocabularyProgress(progressData) {
  try {
    const newProgress = {
      ...progressData,
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, VOCABULARY_PROGRESS_COLLECTION), newProgress);
  } catch (e) {
    console.error("Error saving vocabulary progress:", e);
  }
}

// Get all vocabulary progress for a user
export async function getVocabularyProgressByUser(userId) {
  try {
    const q = query(
      collection(db, VOCABULARY_PROGRESS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting vocabulary progress:", e);
    return [];
  }
}

const studentVocabularyProgressService = {
  saveVocabularyProgress,
  getVocabularyProgressByUser,
};

export default studentVocabularyProgressService;
