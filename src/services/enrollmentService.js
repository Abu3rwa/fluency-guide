import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "enrollments";

export const enrollmentService = {
  // Get all enrollments
  getAllEnrollments: async () => {
    try {
      const enrollmentsRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(enrollmentsRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw error;
    }
  },

  // Get enrollments by student ID
  getEnrollmentsByStudent: async (studentId) => {
    try {
      const enrollmentsRef = collection(db, COLLECTION_NAME);
      const q = query(enrollmentsRef, where("studentId", "==", studentId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      throw error;
    }
  },

  // Get enrollments by course ID
  getEnrollmentsByCourse: async (courseId) => {
    try {
      const enrollmentsRef = collection(db, COLLECTION_NAME);
      const q = query(enrollmentsRef, where("courseId", "==", courseId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching course enrollments:", error);
      throw error;
    }
  },

  // Enroll a student in a course
  enrollStudent: async (enrollmentData) => {
    try {
      // Check if student is already enrolled
      const enrollmentsRef = collection(db, COLLECTION_NAME);
      const q = query(
        enrollmentsRef,
        where("studentId", "==", enrollmentData.studentId),
        where("courseId", "==", enrollmentData.courseId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        throw new Error("Student is already enrolled in this course");
      }

      // Add new enrollment with pending status
      const docRef = await addDoc(enrollmentsRef, {
        ...enrollmentData,
        status: "pending",
        enrolledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        id: docRef.id,
        ...enrollmentData,
        status: "pending",
        enrolledAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error enrolling student:", error);
      throw error;
    }
  },

  // Update enrollment status
  updateEnrollmentStatus: async (enrollmentId, status) => {
    try {
      const enrollmentRef = doc(db, COLLECTION_NAME, enrollmentId);
      await updateDoc(enrollmentRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
      return enrollmentId;
    } catch (error) {
      console.error("Error updating enrollment status:", error);
      throw error;
    }
  },

  // Remove enrollment
  removeEnrollment: async (enrollmentId) => {
    try {
      const enrollmentRef = doc(db, COLLECTION_NAME, enrollmentId);
      await deleteDoc(enrollmentRef);
      return enrollmentId;
    } catch (error) {
      console.error("Error removing enrollment:", error);
      throw error;
    }
  },

  // Get enrollment details with course and student info
  getEnrollmentDetails: async (enrollmentId) => {
    try {
      const enrollmentRef = doc(db, COLLECTION_NAME, enrollmentId);
      const enrollmentDoc = await getDoc(enrollmentRef);

      if (!enrollmentDoc.exists()) {
        throw new Error("Enrollment not found");
      }

      const enrollment = {
        id: enrollmentDoc.id,
        ...enrollmentDoc.data(),
      };

      // Get course details
      const courseRef = doc(db, "courses", enrollment.courseId);
      const courseDoc = await getDoc(courseRef);
      if (courseDoc.exists()) {
        enrollment.course = {
          id: courseDoc.id,
          ...courseDoc.data(),
        };
      }

      // Get student details
      const studentRef = doc(db, "users", enrollment.studentId);
      const studentDoc = await getDoc(studentRef);
      if (studentDoc.exists()) {
        enrollment.student = {
          id: studentDoc.id,
          ...studentDoc.data(),
        };
      }

      return enrollment;
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
      throw error;
    }
  },

  // Approve an enrollment
  approveEnrollment: async (enrollmentId) => {
    try {
      const enrollmentRef = doc(db, COLLECTION_NAME, enrollmentId);
      const enrollmentDoc = await getDoc(enrollmentRef);

      if (!enrollmentDoc.exists()) {
        throw new Error("Enrollment not found");
      }

      const enrollment = enrollmentDoc.data();

      // Update enrollment status to active
      await updateDoc(enrollmentRef, {
        status: "active",
        updatedAt: new Date().toISOString(),
      });

      // Update course enrolled students count
      const courseRef = doc(db, "courses", enrollment.courseId);
      await updateDoc(courseRef, {
        enrolledStudents: increment(1),
      });

      // Update user's enrolled courses
      const userRef = doc(db, "users", enrollment.studentId);
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(enrollment.courseId),
        lastActiveCourse: enrollment.courseId,
        lastStudyDate: new Date().toISOString(),
      });

      return enrollmentId;
    } catch (error) {
      console.error("Error approving enrollment:", error);
      throw error;
    }
  },

  // Reject an enrollment
  rejectEnrollment: async (enrollmentId) => {
    try {
      const enrollmentRef = doc(db, COLLECTION_NAME, enrollmentId);
      await updateDoc(enrollmentRef, {
        status: "rejected",
        updatedAt: new Date().toISOString(),
      });
      return enrollmentId;
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      throw error;
    }
  },
};
