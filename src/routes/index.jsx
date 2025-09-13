import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "./constants";
import AppLayout from "../components/Layout/AppLayout";
import CenteredLoader from "../components/CenteredLoader";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";
import StudentDashboardPage from "../student-ui/students-pages/student-dashboard-page/StudentDashboardPage";
import StudentCourseDetailsPage from "../student-ui/students-pages/student-course-details-page/StudentCourseDetailsPage";
import StudentCoursesPage from "../pages/student/StudentCoursesPage";
import StudentLessonDetailsPage from "../student-ui/students-pages/student-lesson-details-page/StudentLessonDetailsPage";
import StudentFillInBlanksTaskPage from "../student-ui/students-pages/student-tasks-pages/student-fill-in-blanks-task-page/StudentFillInBlanksTaskPage";
import StudentMultipleChoiceTaskPage from "../student-ui/students-pages/student-tasks-pages/student-mutiple-choice-task-page/StudentMultipleChoiceTaskPage";
import StudentTrueFalseTaskPage from "../student-ui/students-pages/student-tasks-pages/student-true-false-task-page/StudentTrueFalseTaskPage";
import StudentTaskResultsPage from "../student-ui/students-pages/student-tasks-pages/components/StudentTaskResultsPage";
import StudentVocabularyBuildingPage from "../student-ui/students-pages/student-vocabulary-building-page/StudentVocabularyBuildingPage";

// Session pages
import AdminSessionTypesPage from "../pages/admin/AdminSessionTypesPage";
import AdminInstructorManagementPage from "../pages/admin/AdminInstructorManagementPage";
import StudentBookingPage from "../pages/student/StudentBookingPage";
import InstructorDashboardPage from "../pages/InstructorDashboardPage";
import InstructorProfilePage from "../pages/InstructorProfilePage";
import InstructorPublicProfilePage from "../pages/InstructorPublicProfilePage";
import InstructorsShowcasePage from "../pages/InstructorsShowcasePage";
import SessionTypesPage from "../pages/SessionTypesPage";
import TermsManagement from "../components/sessions/admin/TermsManagement";


// Temporarily disable lazy loading to debug webpack issue
import StudentStatisticsPage from "../screens/student-statistics/StudentStatisticsPage";
import Landing from "../screens/Landing";
import Auth from "../screens/Auth";
import Dashboard from "../screens/Dashboard";
import ManagementDashboard from "../screens/ManagementDashboard";
import Profile from "../screens/Profile";
import CourseDetails from "../screens/CourseDetailsScreen";
import Students from "../screens/Students";
import Enrollments from "../screens/Enrollments";
import Analytics from "../screens/Analytics";
import Settings from "../screens/Settings";
import Pricing from "../screens/Pricing";
import About from "../screens/About";
import Contact from "../screens/Contact";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();
  return currentUser ? children : <Navigate to={ROUTES.AUTH} />;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) {
    return <CenteredLoader />;
  }
  
  if (!currentUser) {
    return <Navigate to={ROUTES.AUTH} />;
  }
  
  // Wait for userData to load before checking admin status
  if (!userData) {
    return <CenteredLoader />;
  }
  
  if (!userData?.isAdmin) {
    console.log('Access denied: User is not admin');
    return <Navigate to={ROUTES.LANDING} />;
  }
  
  return children;
};

// Instructor Route component
const InstructorRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) {
    return <CenteredLoader />;
  }
  
  if (!currentUser) {
    return <Navigate to={ROUTES.AUTH} />;
  }
  
  // Wait for userData to load before checking instructor status
  if (!userData) {
    return <CenteredLoader />;
  }
  
  // Check if user has instructor or admin privileges
  const hasInstructorAccess = userData?.isAdmin || userData?.role === 'instructor' || userData?.isInstructor;
  
  if (!hasInstructorAccess) {
    console.log('Access denied: User is not instructor or admin');
    return <Navigate to={ROUTES.AUTH} />;
  }
  
  return children;
};

// Student Route component (for logged-in students)
const StudentRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to={ROUTES.AUTH} />;
};

// Preview Route component (allows both authenticated and non-authenticated users)
const PreviewRoute = ({ children }) => {
  return children;
};

// Public routes
export const publicRoutes = [
  // { path: ROUTES.LANDING, element: <Landing /> },
  {
    path: ROUTES.AUTH,
    element: (
      <AppLayout>
        <Auth />
      </AppLayout>
    ),
  },
  {
    path: ROUTES.STUDENT_STATISTICS,
    element: (
      <AppLayout>
        <StudentStatisticsPage />
      </AppLayout>
    ),
  },
  {
    path: ROUTES.LANDING,
    element: (
      <AppLayout>
        <Landing />
      </AppLayout>
    ),
  },
  {
    path: ROUTES.STUDENT_COURSE_DETAILS,
    element: (
      <AppLayout>
        <StudentCourseDetailsPage />
      </AppLayout>
    ),
  },

  { path: ROUTES.PRICING, element: <Pricing /> },
  { path: ROUTES.ABOUT, element: <About /> },
  { path: ROUTES.CONTACT, element: <Contact /> },
  // Public Session Booking Page (no login required)
  {
    path: ROUTES.STUDENT_BOOKING,
    element: (
      <AppLayout>
        <StudentBookingPage />
      </AppLayout>
    ),
  },
  // Instructors Showcase Page
  {
    path: ROUTES.INSTRUCTORS_SHOWCASE,
    element: (
      <AppLayout>
        <InstructorsShowcasePage />
      </AppLayout>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_PUBLIC_PROFILE,
    element: (
      <AppLayout>
        <InstructorPublicProfilePage />
      </AppLayout>
    ),
  },
];

// Student routes (for logged-in students)
export const studentRoutes = [
  {
    path: ROUTES.STUDENT_DASHBOARD,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentDashboardPage />
        </AppLayout>
      </StudentRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_COURSES,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentCoursesPage />
        </AppLayout>
      </StudentRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_LESSON_DETAILS,
    element: (
      <PreviewRoute>
        <AppLayout>
          <StudentLessonDetailsPage />
        </AppLayout>
      </PreviewRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_FILL_IN_BLANKS_TASK,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentFillInBlanksTaskPage />
        </AppLayout>
      </StudentRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_MULTIPLE_CHOICE_TASK,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentMultipleChoiceTaskPage />
        </AppLayout>
      </StudentRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_TRUE_FALSE_TASK,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentTrueFalseTaskPage />
        </AppLayout>
      </StudentRoute>
    ),
  },
  // Task Results Route
  {
    path: ROUTES.STUDENT_TASK_RESULTS,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentTaskResultsPage />
        </AppLayout>
      </StudentRoute>
    ),
  },
  // Generic task route for any task type
  {
    path: "/student/tasks/:taskId",
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentFillInBlanksTaskPage />
        </AppLayout>
      </StudentRoute>
    ),
  },
  // Student Vocabulary Building Page
  {
    path: ROUTES.STUDENT_VOCABULARY_BUILDING,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentVocabularyBuildingPage />
        </AppLayout>
      </StudentRoute>
    ),
  },

];

// Instructor routes
export const instructorRoutes = [
  {
    path: ROUTES.INSTRUCTOR_DASHBOARD,
    element: (
      <InstructorRoute>
        <AppLayout>
          <InstructorDashboardPage />
        </AppLayout>
      </InstructorRoute>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_SESSION_TYPES,
    element: (
      <InstructorRoute>
        <AppLayout>
          <SessionTypesPage />
        </AppLayout>
      </InstructorRoute>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_PROFILE,
    element: (
      <InstructorRoute>
        <AppLayout>
          <InstructorProfilePage />
        </AppLayout>
      </InstructorRoute>
    ),
  },
];

// Protected routes
export const protectedRoutes = [
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Profile />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
];

// Admin routes
export const adminRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: (
      <AdminRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </AdminRoute>
    ),
  },

  {
    path: "/courses/:id",
    element: (
      <AdminRoute>
        <AppLayout>
          <CourseDetails />
        </AppLayout>
      </AdminRoute>
    ),
  },

  {
    path: "/students",
    element: (
      <AdminRoute>
        <AppLayout>
          <Students />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: "/enrollments",
    element: (
      <AdminRoute>
        <AppLayout>
          <Enrollments />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <AdminRoute>
        <AppLayout>
          <StudentStatisticsPage />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <AdminRoute>
        <AppLayout>
          <Settings />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: "/management",
    element: (
      <AdminRoute>
        <AppLayout>
          <ManagementDashboard />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ADMIN_SESSION_TYPES,
    element: (
      <AdminRoute>
        <AppLayout>
          <SessionTypesPage />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ADMIN_INSTRUCTOR_MANAGEMENT,
    element: (
      <AdminRoute>
        <AppLayout>
          <AdminInstructorManagementPage />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ADMIN_SESSION_DASHBOARD,
    element: (
      <AdminRoute>
        <AppLayout>
          <AdminSessionTypesPage />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ADMIN_TERMS_MANAGEMENT,
    element: (
      <AdminRoute>
        <AppLayout>
          <TermsManagement />
        </AppLayout>
      </AdminRoute>
    ),
  },
];

// Fallback route
export const fallbackRoute = {
  path: "*",
  element: <Navigate to={ROUTES.LANDING} />,
};

// Main router component
const AppRoutes = () => {
  return (
    <GlobalErrorBoundary>
      <Routes>
        {/* Public routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Protected routes */}
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Admin routes */}
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Student routes */}
        {studentRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Instructor routes */}
        {instructorRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Redirect old auth routes to new auth screen */}
        <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.AUTH} />} />
        <Route path={ROUTES.SIGNUP} element={<Navigate to={ROUTES.AUTH} />} />
        
        {/* Redirect admin-sessions to admin/sessions */}
        <Route path="/admin-sessions" element={<Navigate to={ROUTES.ADMIN_SESSION_DASHBOARD} />} />

        {/* Fallback route */}
        <Route path={fallbackRoute.path} element={fallbackRoute.element} />
      </Routes>
    </GlobalErrorBoundary>
  );
};

export default AppRoutes;
