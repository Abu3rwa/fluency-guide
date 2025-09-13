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
      where("moduleId", "==", moduleId),
      orderBy("order", "asc")
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

    if (!lessonDoc.exists()) {
      return null;
    }

    const lessonData = lessonDoc.data();
    const moduleId = lessonData.moduleId;

    // Get all lessons in the module to calculate indices
    const moduleLessons = await getLessonsByModule(moduleId);
    // Data is already sorted by order from Firestore query
    const sortedModuleLessons = moduleLessons;

    // Calculate lesson index within module
    const lessonIndexInModule = sortedModuleLessons.findIndex(
      (l) => l.id === lessonId
    );

    // Get all modules to calculate module index
    const modulesRef = collection(db, "modules");
    const modulesSnapshot = await getDocs(modulesRef);
    const modules = modulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort modules by order
    const sortedModules = modules.sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    // Calculate module index
    const moduleIndex = sortedModules.findIndex((m) => m.id === moduleId);

    // Calculate overall lesson index
    let lessonIndex = 0;
    for (let i = 0; i < moduleIndex; i++) {
      const prevModuleLessons = await getLessonsByModule(sortedModules[i].id);
      lessonIndex += prevModuleLessons.length;
    }
    lessonIndex += lessonIndexInModule;

    return {
      id: lessonDoc.id,
      ...lessonData,
      moduleIndex,
      lessonIndex,
      lessonIndexInModule,
    };
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
