// studentLessonService.js
// Ported from migrate/lib/services/lesson_service.dart
// Handles lesson logic and Firestore integration for students

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

const LESSONS_COLLECTION = "lessons";

// Get all lessons for a module
export async function getLessonsByModule(moduleId) {
  try {
    const q = query(
      collection(db, LESSONS_COLLECTION),
      where("moduleId", "==", moduleId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting lessons by module:", e);
    return [];
  }
}

// Get a single lesson
export async function getLessonById(lessonId) {
  try {
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    const lessonDoc = await getDoc(lessonRef);
    return lessonDoc.exists()
      ? { id: lessonDoc.id, ...lessonDoc.data() }
      : null;
  } catch (e) {
    console.error("Error getting lesson by ID:", e);
    return null;
  }
}

// Create a new lesson
export async function createLesson(lessonData) {
  try {
    const newLesson = {
      ...lessonData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, LESSONS_COLLECTION), newLesson);
    return { id: docRef.id, ...newLesson };
  } catch (e) {
    console.error("Error creating lesson:", e);
    throw e;
  }
}

// Update a lesson
export async function updateLesson(lessonId, lessonData) {
  try {
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    const updateData = {
      ...lessonData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(lessonRef, updateData);
    return { id: lessonId, ...updateData };
  } catch (e) {
    console.error("Error updating lesson:", e);
    throw e;
  }
}

// Delete a lesson
export async function deleteLesson(lessonId) {
  try {
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    await deleteDoc(lessonRef);
    return true;
  } catch (e) {
    console.error("Error deleting lesson:", e);
    throw e;
  }
}

const studentLessonService = {
  getLessonsByModule,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};

export default studentLessonService;
