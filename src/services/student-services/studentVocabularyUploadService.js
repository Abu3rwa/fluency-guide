// studentVocabularyUploadService.js
// Ported from migrate/lib/services/vocabulary_upload_service.dart
// Handles vocabulary upload logic and Firestore integration for students

import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

const COMMON_WORDS_COLLECTION = "commonWords";

// Upload vocabulary data to Firestore
export async function uploadVocabulary(vocabularyList, metadata = {}) {
  try {
    for (const wordData of vocabularyList) {
      const docRef = doc(collection(db, COMMON_WORDS_COLLECTION));
      await setDoc(docRef, {
        ...wordData,
        uploaded_at: serverTimestamp(),
      });
    }
    // Save metadata
    const metadataRef = doc(
      collection(db, COMMON_WORDS_COLLECTION),
      "metadata"
    );
    await setDoc(metadataRef, {
      ...metadata,
      uploaded_at: serverTimestamp(),
      total_words: vocabularyList.length,
    });
  } catch (e) {
    console.error("Error uploading vocabulary:", e);
    throw e;
  }
}

// Get vocabulary stats
export async function getVocabularyStats() {
  try {
    const snapshot = await getDocs(collection(db, COMMON_WORDS_COLLECTION));
    return {
      total: snapshot.size,
    };
  } catch (e) {
    console.error("Error getting vocabulary stats:", e);
    return null;
  }
}

const studentVocabularyUploadService = {
  uploadVocabulary,
  getVocabularyStats,
};

export default studentVocabularyUploadService;
