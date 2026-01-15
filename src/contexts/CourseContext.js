import React, { createContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCourses as fetchCoursesAction,
  fetchInstructorCourses as fetchInstructorCoursesAction,
  createCourseWithRound as createCourseWithRoundAction,
  restartCourse as restartCourseAction,
  fetchCourseRounds as fetchCourseRoundsAction,
  getCurrentRound as getCurrentRoundAction,
  updateRoundStatus as updateRoundStatusAction,
  updateCourse as updateCourseAction,
  deleteCourse as deleteCourseAction,
  enrollStudent as enrollStudentAction,
  selectCourses,
  selectCoursesLoading,
  selectCoursesError
} from '../store/slices/courseSlice';

export const CourseContext = createContext();

export function CourseProvider({ children }) {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const loading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);

  const fetchCourses = useCallback(async () => {
    await dispatch(fetchCoursesAction());
  }, [dispatch]);

  const fetchInstructorCourses = useCallback(async (instructorUid) => {
    await dispatch(fetchInstructorCoursesAction(instructorUid));
  }, [dispatch]);

  const createCourseWithRound = useCallback(async (courseData) => {
    const resultAction = await dispatch(createCourseWithRoundAction(courseData));
    if (createCourseWithRoundAction.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      throw new Error(resultAction.payload || 'Failed to create course');
    }
  }, [dispatch]);

  // Legacy support
  const createCourse = useCallback(async (courseData) => {
    return createCourseWithRound(courseData);
  }, [createCourseWithRound]);

  const restartCourse = useCallback(async (courseId, roundData) => {
    // We need current total rounds and price to pass to the action, or handle it in the thunk by fetching.
    // The thunk currently expects passed values or finds them in state if we adjust it.
    // My thunk implementation for restartCourse takes { courseId, roundData, currentTotalRounds, currentPrice }
    // BUT ideally the thunk should probably look up the course from state or Firestore if not provided.
    // Let's check `courses` state here since we have it.
    const course = courses.find(c => c.id === courseId);
    const currentTotalRounds = course ? course.totalRounds : 0;
    const currentPrice = course ? course.price : 0;

    const resultAction = await dispatch(restartCourseAction({
      courseId,
      roundData,
      currentTotalRounds,
      currentPrice
    }));

    if (restartCourseAction.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      throw new Error(resultAction.payload || 'Failed to restart course');
    }
  }, [dispatch, courses]);

  const fetchCourseRounds = useCallback(async (courseId) => {
    // This is a bit different because `fetchCourseRounds` thunk returns data but doesn't necessarily store it in the main `courses` list 
    // (unless we expanded the slice to have `currentCourseRounds`). 
    // The context implementation returned the array directly. 
    // The thunk returns it in payload.
    const resultAction = await dispatch(fetchCourseRoundsAction(courseId));
    if (fetchCourseRoundsAction.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      return [];
    }
  }, [dispatch]);

  const getCurrentRound = useCallback(async (courseId) => {
    const resultAction = await dispatch(getCurrentRoundAction(courseId));
    if (getCurrentRoundAction.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      return null;
    }
  }, [dispatch]);

  const updateRoundStatus = useCallback(async (roundId, status) => {
    const resultAction = await dispatch(updateRoundStatusAction({ roundId, status }));
    if (updateRoundStatusAction.rejected.match(resultAction)) {
      throw new Error(resultAction.payload);
    }
  }, [dispatch]);

  const updateCourse = useCallback(async (courseId, courseData) => {
    const resultAction = await dispatch(updateCourseAction({ courseId, courseData }));
    if (updateCourseAction.rejected.match(resultAction)) {
      throw new Error(resultAction.payload);
    }
  }, [dispatch]);

  const deleteCourse = useCallback(async (courseId) => {
    const resultAction = await dispatch(deleteCourseAction(courseId));
    if (deleteCourseAction.rejected.match(resultAction)) {
      throw new Error(resultAction.payload);
    }
  }, [dispatch]);

  const enrollStudent = useCallback(async (courseId, studentId) => {
    const resultAction = await dispatch(enrollStudentAction({ courseId, studentId }));
    if (enrollStudentAction.rejected.match(resultAction)) {
      throw new Error(resultAction.payload);
    }
  }, [dispatch]);

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
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}
