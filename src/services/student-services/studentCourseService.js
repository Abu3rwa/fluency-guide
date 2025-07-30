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
//
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

// Get user's enrolled courses
export async function getUserEnrolledCourses(userId) {
  try {
    // Query enrollments collection for user's enrollments
    const enrollmentsRef = collection(db, "enrollments");
    const q = query(
      enrollmentsRef,
      where("userId", "==", userId),
      where("status", "==", "active")
    );

    const enrollmentsSnapshot = await getDocs(q);

    if (enrollmentsSnapshot.empty) {
      console.log("No active enrollments found for user:", userId);
      return [];
    }

    // Extract course IDs from enrollments
    const enrolledCourseIds = enrollmentsSnapshot.docs.map(
      (doc) => doc.data().courseId
    );

    if (enrolledCourseIds.length === 0) {
      return [];
    }

    // Fetch the actual course data for enrolled courses
    const enrolledCourses = [];
    for (const courseId of enrolledCourseIds) {
      try {
        const course = await getCourseById(courseId);
        if (course) {
          // Add enrollment data to course object
          const enrollmentDoc = enrollmentsSnapshot.docs.find(
            (doc) => doc.data().courseId === courseId
          );
          const enrollmentData = enrollmentDoc?.data();

          enrolledCourses.push({
            ...course,
            enrollmentId: enrollmentDoc?.id,
            enrollmentDate: enrollmentData?.enrollmentDate,
            progress: enrollmentData?.progress || 0,
            status: enrollmentData?.status || "active",
            lastAccessed: enrollmentData?.lastAccessed,
          });
        }
      } catch (error) {
        console.error(`Error fetching course ${courseId}:`, error);
      }
    }

    return enrolledCourses;
  } catch (error) {
    console.error("Error getting user enrolled courses:", error);
    return [];
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
  getUserEnrolledCourses,
};

export default studentCourseService;
