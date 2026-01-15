import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import blogReducer from './slices/blogSlice';
import courseReducer from './slices/courseSlice';
import attendanceReducer from './slices/attendanceSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        blog: blogReducer,
        courses: courseReducer,
        attendance: attendanceReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'auth/loginUser/fulfilled',
                    'auth/registerUser/fulfilled',
                    'auth/updateUserProfile/fulfilled',
                    'auth/setUserProfile',
                    'blog/fetchPosts/fulfilled',
                    'courses/fetchCourses/fulfilled',
                    'courses/fetchInstructorCourses/fulfilled',
                    'courses/createCourseWithRound/fulfilled',
                    'courses/updateCourse/fulfilled',
                    'courses/fetchCourseContent/fulfilled',
                    'courses/fetchCourseContent/pending',
                    'courses/fetchCourseContent/rejected',
                    'attendance/markAttendance/fulfilled',
                    'attendance/markAttendance/pending',
                    'attendance/markAttendance/rejected',
                    'attendance/fetchLessonAttendance/fulfilled',
                    'attendance/fetchLessonAttendance/pending',
                    'attendance/fetchLessonAttendance/rejected',
                    'attendance/fetchCourseAttendance/fulfilled',
                    'attendance/fetchCourseAttendance/pending',
                    'attendance/fetchCourseAttendance/rejected'
                ],
                ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
                ignoredPaths: [
                    'auth.userProfile.createdAt',
                    'auth.userProfile.updatedAt',
                    'blog.lastDoc',
                    // Ignore all timestamp fields in courses array
                    /^courses\.courses\.\d+\.createdAt$/,
                    /^courses\.courses\.\d+\.updatedAt$/,
                    /^courses\.courses\.\d+\.currentRound\.createdAt$/,
                    /^courses\.courses\.\d+\.currentRound\.startDate$/,
                    /^courses\.courses\.\d+\.currentRound\.endDate$/,
                    // Ignore all timestamp fields in course content (units/lessons)
                    /^courses\.courseContent\..+\.\d+\.createdAt$/,
                    /^courses\.courseContent\..+\.\d+\.updatedAt$/,
                    /^courses\.courseContent\..+\.\d+\.lessons\.\d+\.createdAt$/,
                    /^courses\.courseContent\..+\.\d+\.lessons\.\d+\.updatedAt$/,
                    // Ignore all timestamp fields in attendance array
                    /^attendance\.attendanceRecords\.\d+\.markedAt$/,
                    /^attendance\.attendanceRecords\.\d+\.createdAt$/,
                    /^attendance\.attendanceRecords\.\d+\.updatedAt$/,
                    /^attendance\.attendanceRecords\.\d+\.completedAt$/
                ],
            },
        }),
});

export default store;
