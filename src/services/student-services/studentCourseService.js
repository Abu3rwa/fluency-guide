// studentCourseService.js
// Ported from migrate/lib/services/course_service.dart
// Handles course logic and Firestore integration for students

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

const COURSES_COLLECTION = "courses";

// Get all courses
export async function getAllCourses() {
  try {
    const snapshot = await getDocs(collection(db, COURSES_COLLECTION));
    // console.log(snapshot.docs.map((doc) => ({ id: doc.id })));
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  } catch (e) {
    console.error("Error getting courses:", e);
    return [];
  }
}

// Get a single course by ID
export async function getCourseById(courseId) {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    const courseDoc = await getDoc(courseRef);
    return courseDoc.exists()
      ? { id: courseDoc.id, ...courseDoc.data() }
      : null;
  } catch (e) {
    console.error("Error getting course by ID:", e);
    return null;
  }
}

// Get courses by category
export async function getCoursesByCategory(category) {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where("category", "==", category)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting courses by category:", e);
    return [];
  }
}

// Get courses by level
export async function getCoursesByLevel(level) {
  try {
    const q = query(
      collection(db, COURSES_COLLECTION),
      where("level", "==", level)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error getting courses by level:", e);
    return [];
  }
}

// Create a new course
export async function createCourse(courseData) {
  try {
    const newCourse = {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, COURSES_COLLECTION), newCourse);
    return { id: docRef.id, ...newCourse };
  } catch (e) {
    console.error("Error creating course:", e);
    throw e;
  }
}

// Update a course
export async function updateCourse(courseId, courseData) {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    const updateData = {
      ...courseData,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(courseRef, updateData);
    return { id: courseId, ...updateData };
  } catch (e) {
    console.error("Error updating course:", e);
    throw e;
  }
}

// Delete a course
export async function deleteCourse(courseId) {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(courseRef);
    return true;
  } catch (e) {
    console.error("Error deleting course:", e);
    throw e;
  }
}

const studentCourseService = {
  getAllCourses,
  getCourseById,
  getCoursesByCategory,
  getCoursesByLevel,
  createCourse,
  updateCourse,
  deleteCourse,
};

export default studentCourseService;
