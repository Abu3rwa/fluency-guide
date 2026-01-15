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
    orderBy,
    Timestamp,
} from 'firebase/firestore';

const initialState = {
    attendanceRecords: [],
    loading: false,
    error: null,
};

// Mark attendance for a student
export const markAttendance = createAsyncThunk(
    'attendance/markAttendance',
    async ({ courseId, unitId, lessonId, studentId, status, notes, instructorId }, { rejectWithValue }) => {
        try {
            // Check if attendance record already exists
            const attendanceRef = collection(db, 'attendance');
            const qExisting = query(
                attendanceRef,
                where('courseId', '==', courseId),
                where('lessonId', '==', lessonId),
                where('studentId', '==', studentId)
            );
            const querySnapshot = await getDocs(qExisting);

            let docRef;
            let attendanceData;

            if (!querySnapshot.empty) {
                // Update existing record
                const existingDoc = querySnapshot.docs[0];
                docRef = existingDoc.ref;
                const existingData = existingDoc.data();

                attendanceData = {
                    ...existingData,
                    status,
                    notes: notes || existingData.notes || '',
                    markedAt: Timestamp.now(),
                    instructorId // Update instructor if changed
                };

                await updateDoc(docRef, {
                    status: attendanceData.status,
                    notes: attendanceData.notes,
                    markedAt: attendanceData.markedAt,
                    instructorId: attendanceData.instructorId
                });
            } else {
                // Create new record
                attendanceData = {
                    courseId,
                    unitId,
                    lessonId,
                    studentId,
                    instructorId,
                    status,
                    notes: notes || '',
                    markedAt: Timestamp.now(),
                };
                const newDoc = await addDoc(collection(db, 'attendance'), attendanceData);
                docRef = newDoc;
            }

            // Update enrollment to mark lesson as complete if present
            if (status === 'present') {
                const enrollmentsRef = collection(db, 'enrollments');
                const q = query(
                    enrollmentsRef,
                    where('userId', '==', studentId),
                    where('courseId', '==', courseId)
                );
                const enrollmentSnap = await getDocs(q);

                if (!enrollmentSnap.empty) {
                    const enrollmentDoc = enrollmentSnap.docs[0];
                    const enrollmentData = enrollmentDoc.data();
                    const completedLessons = enrollmentData.completedLessons || {};

                    completedLessons[lessonId] = {
                        completedAt: Timestamp.now(),
                        attendanceId: docRef.id,
                    };

                    // Calculate progress
                    const totalLessons = enrollmentData.totalLessons || 0;
                    const completedCount = Object.keys(completedLessons).length;
                    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                    await updateDoc(doc(db, 'enrollments', enrollmentDoc.id), {
                        completedLessons,
                        progress: {
                            totalLessons,
                            completedLessons: completedCount,
                            percentage,
                        },
                        updatedAt: Timestamp.now(),
                    });
                }
            }

            return { id: docRef.id, ...attendanceData };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Bulk mark attendance
export const bulkMarkAttendance = createAsyncThunk(
    'attendance/bulkMarkAttendance',
    async ({ courseId, unitId, lessonId, studentIds, status, instructorId }, { dispatch, rejectWithValue }) => {
        try {
            const results = await Promise.all(
                studentIds.map(studentId =>
                    dispatch(markAttendance({
                        courseId,
                        unitId,
                        lessonId,
                        studentId,
                        status,
                        instructorId,
                        notes: '',
                    }))
                )
            );
            return results.map(r => r.payload);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Fetch attendance for a lesson
export const fetchLessonAttendance = createAsyncThunk(
    'attendance/fetchLessonAttendance',
    async ({ courseId, lessonId }, { rejectWithValue }) => {
        try {
            const attendanceRef = collection(db, 'attendance');
            // TEMPORARY FIX: Removed orderBy to avoid composite index requirement
            // TODO: Create composite index in Firebase Console for courseId + lessonId + markedAt
            const q = query(
                attendanceRef,
                where('courseId', '==', courseId),
                where('lessonId', '==', lessonId)
                // orderBy('markedAt', 'desc') // Commented until Firebase index is created
            );
            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort locally instead
            records.sort((a, b) => {
                const aTime = a.markedAt?.toMillis?.() || 0;
                const bTime = b.markedAt?.toMillis?.() || 0;
                return bTime - aTime; // Descending order
            });

            return records;
        } catch (err) {
            console.error('❌ Error fetching lesson attendance:', err);
            return rejectWithValue(err.message);
        }
    }
);

// Fetch attendance for a student in a course
export const fetchStudentAttendance = createAsyncThunk(
    'attendance/fetchStudentAttendance',
    async ({ courseId, studentId }, { rejectWithValue }) => {
        try {
            const attendanceRef = collection(db, 'attendance');
            const q = query(
                attendanceRef,
                where('courseId', '==', courseId),
                where('studentId', '==', studentId)
                // orderBy('markedAt', 'desc') // Removed to avoid index requirement
            );
            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            records.sort((a, b) => (b.markedAt?.toMillis?.() || 0) - (a.markedAt?.toMillis?.() || 0));
            return records;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Fetch all attendance for a course
export const fetchCourseAttendance = createAsyncThunk(
    'attendance/fetchCourseAttendance',
    async ({ courseId }, { rejectWithValue }) => {
        try {
            const attendanceRef = collection(db, 'attendance');
            const q = query(
                attendanceRef,
                where('courseId', '==', courseId)
                // orderBy('markedAt', 'desc') // Single where clause, but removed for consistency
            );
            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            records.sort((a, b) => (b.markedAt?.toMillis?.() || 0) - (a.markedAt?.toMillis?.() || 0));
            return records;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Update attendance record
export const updateAttendance = createAsyncThunk(
    'attendance/updateAttendance',
    async ({ attendanceId, updates }, { rejectWithValue }) => {
        try {
            await updateDoc(doc(db, 'attendance', attendanceId), {
                ...updates,
                updatedAt: Timestamp.now(),
            });
            return { id: attendanceId, ...updates };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// Delete attendance record
export const deleteAttendance = createAsyncThunk(
    'attendance/deleteAttendance',
    async ({ attendanceId }, { rejectWithValue }) => {
        try {
            await deleteDoc(doc(db, 'attendance', attendanceId));
            return attendanceId;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        clearAttendance: (state) => {
            state.attendanceRecords = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Mark Attendance
            .addCase(markAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords.unshift(action.payload);
            })
            .addCase(markAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Bulk Mark Attendance
            .addCase(bulkMarkAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(bulkMarkAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords = [...action.payload, ...state.attendanceRecords];
            })
            .addCase(bulkMarkAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Lesson Attendance
            .addCase(fetchLessonAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLessonAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords = action.payload;
            })
            .addCase(fetchLessonAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Student Attendance
            .addCase(fetchStudentAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords = action.payload;
            })
            .addCase(fetchStudentAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Course Attendance
            .addCase(fetchCourseAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords = action.payload;
            })
            .addCase(fetchCourseAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Attendance
            .addCase(updateAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAttendance.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.attendanceRecords.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.attendanceRecords[index] = { ...state.attendanceRecords[index], ...action.payload };
                }
            })
            .addCase(updateAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Attendance
            .addCase(deleteAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceRecords = state.attendanceRecords.filter(a => a.id !== action.payload);
            })
            .addCase(deleteAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearAttendance } = attendanceSlice.actions;

export const selectAttendanceRecords = (state) => state.attendance.attendanceRecords;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;

export default attendanceSlice.reducer;
