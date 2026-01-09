import React, { createContext, useState, useCallback, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export const CourseContext = createContext();

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      const coursesList = await Promise.all(
        snapshot.docs.map(async (courseDoc) => {
          const courseData = { id: courseDoc.id, ...courseDoc.data() };

          // Fetch current round data if exists
          if (courseData.currentRoundId) {
            try {
              const roundRef = doc(db, 'course_rounds', courseData.currentRoundId);
              const roundSnap = await getDoc(roundRef);
              if (roundSnap.exists()) {
                courseData.currentRound = { id: roundSnap.id, ...roundSnap.data() };
              }
            } catch (err) {
              console.error('Error fetching round for course:', courseData.id, err);
            }
          }

          return courseData;
        })
      );
      setCourses(coursesList);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInstructorCourses = useCallback(async (instructorUid) => {
    setLoading(true);
    setError(null);
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('instructor.uid', '==', instructorUid));
      const snapshot = await getDocs(q);
      const coursesList = await Promise.all(
        snapshot.docs.map(async (courseDoc) => {
          const courseData = { id: courseDoc.id, ...courseDoc.data() };

          // Fetch current round data if exists
          if (courseData.currentRoundId) {
            try {
              const roundRef = doc(db, 'course_rounds', courseData.currentRoundId);
              const roundSnap = await getDoc(roundRef);
              if (roundSnap.exists()) {
                courseData.currentRound = { id: roundSnap.id, ...roundSnap.data() };
              }
            } catch (err) {
              console.error('Error fetching round for course:', courseData.id, err);
            }
          }

          return courseData;
        })
      );
      setCourses(coursesList);
    } catch (err) {
      console.error('Error fetching instructor courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create course with initial round
  const createCourseWithRound = useCallback(async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate, maxStudents, price, ...courseContent } = courseData;

      // Create course document (content only)
      const courseRef = await addDoc(collection(db, 'courses'), {
        ...courseContent,
        totalRounds: 1,
        totalStudents: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        reviews: [],
        rating: 0,
      });

      // Create first round
      const roundRef = await addDoc(collection(db, 'course_rounds'), {
        courseId: courseRef.id,
        roundNumber: 1,
        startDate: startDate || Timestamp.now(),
        endDate: endDate || null,
        status: 'active',
        maxStudents: maxStudents || 20,
        enrolledStudents: 0,
        price: price || 0,
        createdAt: Timestamp.now(),
        instructorId: courseData.instructor?.uid,
      });

      // Update course with current round ID
      await updateDoc(courseRef, {
        currentRoundId: roundRef.id,
      });

      const newCourse = {
        id: courseRef.id,
        ...courseContent,
        currentRoundId: roundRef.id,
        totalRounds: 1,
        totalStudents: 0,
      };

      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Legacy createCourse - now calls createCourseWithRound
  const createCourse = useCallback(async (courseData) => {
    return createCourseWithRound(courseData);
  }, [createCourseWithRound]);

  // Restart course with new round
  const restartCourse = useCallback(async (courseId, roundData) => {
    setLoading(true);
    setError(null);
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) throw new Error('Course not found');

      const newRoundNumber = (course.totalRounds || 0) + 1;

      // Create new round
      const roundRef = await addDoc(collection(db, 'course_rounds'), {
        courseId,
        roundNumber: newRoundNumber,
        startDate: roundData.startDate || Timestamp.now(),
        endDate: roundData.endDate || null,
        status: 'active',
        maxStudents: roundData.maxStudents || 20,
        enrolledStudents: 0,
        price: roundData.price || course.price || 0,
        createdAt: Timestamp.now(),
        instructorId: roundData.instructorId,
      });

      // Update course
      await updateDoc(doc(db, 'courses', courseId), {
        currentRoundId: roundRef.id,
        totalRounds: newRoundNumber,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setCourses(prev => prev.map(c =>
        c.id === courseId
          ? { ...c, currentRoundId: roundRef.id, totalRounds: newRoundNumber }
          : c
      ));

      return { id: roundRef.id, roundNumber: newRoundNumber };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courses]);

  // Fetch all rounds for a course
  const fetchCourseRounds = useCallback(async (courseId) => {
    try {
      const roundsRef = collection(db, 'course_rounds');
      const q = query(roundsRef, where('courseId', '==', courseId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => a.roundNumber - b.roundNumber);
    } catch (err) {
      console.error('Error fetching course rounds:', err);
      return [];
    }
  }, []);

  // Get current round for a course
  const getCurrentRound = useCallback(async (courseId) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course?.currentRoundId) return null;

      const roundRef = doc(db, 'course_rounds', course.currentRoundId);
      const roundSnap = await getDoc(roundRef);

      if (roundSnap.exists()) {
        return { id: roundSnap.id, ...roundSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Error fetching current round:', err);
      return null;
    }
  }, [courses]);

  // Update round status
  const updateRoundStatus = useCallback(async (roundId, status) => {
    try {
      await updateDoc(doc(db, 'course_rounds', roundId), {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error updating round status:', err);
      throw err;
    }
  }, []);

  const updateCourse = useCallback(async (courseId, courseData) => {
    setLoading(true);
    setError(null);
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        ...courseData,
        updatedAt: Timestamp.now(),
      });
      // Update local state
      setCourses(prev => prev.map(c => c.id === courseId ? { id: courseId, ...courseData } : c));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCourse = useCallback(async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      // Update local state
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enrollStudent = useCallback(async (courseId, studentId) => {
    setLoading(true);
    setError(null);
    try {
      const courseRef = doc(db, 'courses', courseId);
      const course = courses.find(c => c.id === courseId);
      const enrolledStudents = [...(course?.enrolledStudents || [])];

      if (!enrolledStudents.includes(studentId)) {
        enrolledStudents.push(studentId);
      }

      await updateDoc(courseRef, {
        enrolledStudents,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courses]);

  const value = {
    courses,
    loading,
    error,
    fetchCourses,
    fetchInstructorCourses,
    createCourse,
    createCourseWithRound,
    restartCourse,
    fetchCourseRounds,
    getCurrentRound,
    updateRoundStatus,
    updateCourse,
    deleteCourse,
    enrollStudent,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = React.useContext(CourseContext);
  if (!context) {
    return {
      courses: [],
      loading: false,
      error: null,
      fetchCourses: async () => { },
      fetchInstructorCourses: async () => { },
      createCourse: async () => { },
      createCourseWithRound: async () => { },
      restartCourse: async () => { },
      fetchCourseRounds: async () => [],
      getCurrentRound: async () => null,
      updateRoundStatus: async () => { },
      updateCourse: async () => { },
      deleteCourse: async () => { },
      enrollStudent: async () => { },
    };
  }
  return context;
}
