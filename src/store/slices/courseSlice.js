import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase';
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

// Initial state
const initialState = {
    courses: [],
    loading: false,
    error: null,
};

// Async Thunks

// Fetch all courses
export const fetchCourses = createAsyncThunk(
    'courses/fetchCourses',
    async (_, { rejectWithValue }) => {
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
            return coursesList;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Fetch instructor courses
export const fetchInstructorCourses = createAsyncThunk(
    'courses/fetchInstructorCourses',
    async (instructorUid, { rejectWithValue }) => {
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
            return coursesList;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Create course with round
export const createCourseWithRound = createAsyncThunk(
    'courses/createCourseWithRound',
    async (courseData, { rejectWithValue }) => {
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

            return {
                id: courseRef.id,
                ...courseContent,
                currentRoundId: roundRef.id,
                totalRounds: 1,
                totalStudents: 0,
            };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Restart course (new round)
export const restartCourse = createAsyncThunk(
    'courses/restartCourse',
    async ({ courseId, roundData, currentTotalRounds, currentPrice }, { rejectWithValue }) => {
        try {
            const newRoundNumber = (currentTotalRounds || 0) + 1;

            // Create new round
            const roundRef = await addDoc(collection(db, 'course_rounds'), {
                courseId,
                roundNumber: newRoundNumber,
                startDate: roundData.startDate || Timestamp.now(),
                endDate: roundData.endDate || null,
                status: 'active',
                maxStudents: roundData.maxStudents || 20,
                enrolledStudents: 0,
                price: roundData.price || currentPrice || 0,
                createdAt: Timestamp.now(),
                instructorId: roundData.instructorId,
            });

            // Update course
            await updateDoc(doc(db, 'courses', courseId), {
                currentRoundId: roundRef.id,
                totalRounds: newRoundNumber,
                updatedAt: Timestamp.now(),
            });

            return {
                courseId,
                currentRoundId: roundRef.id,
                totalRounds: newRoundNumber
            };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Update course
export const updateCourse = createAsyncThunk(
    'courses/updateCourse',
    async ({ courseId, courseData }, { rejectWithValue }) => {
        try {
            const courseRef = doc(db, 'courses', courseId);
            await updateDoc(courseRef, {
                ...courseData,
                updatedAt: Timestamp.now(),
            });
            return { id: courseId, ...courseData };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Delete course
export const deleteCourse = createAsyncThunk(
    'courses/deleteCourse',
    async (courseId, { rejectWithValue }) => {
        try {
            await deleteDoc(doc(db, 'courses', courseId));
            return courseId;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Fetch course rounds
export const fetchCourseRounds = createAsyncThunk(
    'courses/fetchCourseRounds',
    async (courseId, { rejectWithValue }) => {
        try {
            const roundsRef = collection(db, 'course_rounds');
            const q = query(roundsRef, where('courseId', '==', courseId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })).sort((a, b) => a.roundNumber - b.roundNumber);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Get current round
export const getCurrentRound = createAsyncThunk(
    'courses/getCurrentRound',
    async (courseId, { getState, rejectWithValue }) => {
        try {
            // Note: Ideally we should pass the roundId, but following the context logic:
            const state = getState();
            const course = state.courses.courses.find(c => c.id === courseId);

            if (!course?.currentRoundId) return null;

            const roundRef = doc(db, 'course_rounds', course.currentRoundId);
            const roundSnap = await getDoc(roundRef);

            if (roundSnap.exists()) {
                return { id: roundSnap.id, ...roundSnap.data() };
            }
            return null;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);


// Update round status
export const updateRoundStatus = createAsyncThunk(
    'courses/updateRoundStatus',
    async ({ roundId, status }, { rejectWithValue }) => {
        try {
            await updateDoc(doc(db, 'course_rounds', roundId), {
                status,
                updatedAt: Timestamp.now(),
            });
            return { roundId, status };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Enroll student
export const enrollStudent = createAsyncThunk(
    'courses/enrollStudent',
    async ({ courseId, studentId }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const course = state.courses.courses.find(c => c.id === courseId);
            const enrolledStudents = [...(course?.enrolledStudents || [])];

            if (!enrolledStudents.includes(studentId)) {
                enrolledStudents.push(studentId);
            } else {
                // Already enrolled, but we might want to return success/updated data anyway
            }

            const courseRef = doc(db, 'courses', courseId);
            await updateDoc(courseRef, {
                enrolledStudents,
                updatedAt: Timestamp.now(),
            });

            return { courseId, enrolledStudents };

        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);


// Fetch course content (Units and Lessons)
export const fetchCourseContent = createAsyncThunk(
    'courses/fetchCourseContent',
    async (courseId, { rejectWithValue }) => {
        try {
            // 1. Get all Units
            const unitsRef = collection(db, 'courses', courseId, 'units');
            const unitsSnap = await getDocs(query(unitsRef)); // Suggest adding 'orderBy' if field exists

            // 2. Map through units and get their Lessons
            const unitsWithLessons = await Promise.all(unitsSnap.docs.map(async (unitDoc) => {
                const unitData = { id: unitDoc.id, ...unitDoc.data() };

                const lessonsRef = collection(db, 'courses', courseId, 'units', unitDoc.id, 'lessons');
                const lessonsSnap = await getDocs(query(lessonsRef)); // Suggest adding 'orderBy' if field exists

                unitData.lessons = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Sort lessons if they have an 'order' field
                unitData.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

                return unitData;
            }));

            // Sort units if they have an 'order' field
            unitsWithLessons.sort((a, b) => (a.order || 0) - (b.order || 0));

            return { courseId, content: unitsWithLessons };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const courseSlice = createSlice({
    name: 'courses',
    initialState: {
        ...initialState,
        courseContent: {}, // Map courseId -> units array
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Courses
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = action.payload;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Instructor Courses
            .addCase(fetchInstructorCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = action.payload;
            })
            .addCase(fetchInstructorCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Course Content
            .addCase(fetchCourseContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseContent.fulfilled, (state, action) => {
                state.loading = false;
                state.courseContent[action.payload.courseId] = action.payload.content;
            })
            .addCase(fetchCourseContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Course
            .addCase(createCourseWithRound.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCourseWithRound.fulfilled, (state, action) => {
                state.loading = false;
                state.courses.push(action.payload);
            })
            .addCase(createCourseWithRound.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Restart Course
            .addCase(restartCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(restartCourse.fulfilled, (state, action) => {
                state.loading = false;
                const { courseId, currentRoundId, totalRounds } = action.payload;
                const index = state.courses.findIndex(c => c.id === courseId);
                if (index !== -1) {
                    state.courses[index].currentRoundId = currentRoundId;
                    state.courses[index].totalRounds = totalRounds;
                }
            })
            .addCase(restartCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Course
            .addCase(updateCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCourse.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.courses.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = { ...state.courses[index], ...action.payload };
                }
            })
            .addCase(updateCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Course
            .addCase(deleteCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = state.courses.filter(c => c.id !== action.payload);
            })
            .addCase(deleteCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Enroll Student
            .addCase(enrollStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(enrollStudent.fulfilled, (state, action) => {
                state.loading = false;
                const { courseId, enrolledStudents } = action.payload;
                const index = state.courses.findIndex(c => c.id === courseId);
                if (index !== -1) {
                    state.courses[index].enrolledStudents = enrolledStudents;
                }
            })
            .addCase(enrollStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const selectCourses = (state) => state.courses.courses;
export const selectCourseContent = (state) => state.courses.courseContent;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesError = (state) => state.courses.error;

export default courseSlice.reducer;
