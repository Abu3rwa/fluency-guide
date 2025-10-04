import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "./constants";
import AppLayout from "../components/Layout/AppLayout";
import CenteredLoader from "../components/CenteredLoader";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";
import StudentDashboardPage from "../student-ui/students-pages/student-dashboard-page/StudentDashboardPage";
import StudentCourseDetailsPage from "../student-ui/students-pages/student-course-details-page/StudentCourseDetailsPage";
import StudentLessonDetailsPage from "../student-ui/students-pages/student-lesson-details-page/StudentLessonDetailsPage";
import StudentFillInBlanksTaskPage from "../student-ui/students-pages/student-tasks-pages/student-fill-in-blanks-task-page/StudentFillInBlanksTaskPage";
import StudentMultipleChoiceTaskPage from "../student-ui/students-pages/student-tasks-pages/student-mutiple-choice-task-page/StudentMultipleChoiceTaskPage";
import StudentTrueFalseTaskPage from "../student-ui/students-pages/student-tasks-pages/student-true-false-task-page/StudentTrueFalseTaskPage";
import StudentTaskResultsPage from "../student-ui/students-pages/student-tasks-pages/components/StudentTaskResultsPage";
import StudentVocabularyBuildingPage from "../student-ui/students-pages/student-vocabulary-building-page/StudentVocabularyBuildingPage";

// Blog pages
import BlogListPage from "../screens/BlogListPage";
import BlogPostPage from "../screens/BlogPostPage";
import BlogDashboardPage from "../admin/screens/BlogDashboardPage";
import BlogPostEditorPage from "../admin/screens/BlogPostEditorPage";
import BlogCategoryManagementPage from "../admin/screens/BlogCategoryManagementPage";


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
  // Blog routes
  {
    path: ROUTES.BLOG,
    element: (
      <AppLayout>
        <BlogListPage />
      </AppLayout>
    ),
  },
  {
    path: ROUTES.BLOG_POST,
    element: (
      <AppLayout>
        <BlogPostPage />
      </AppLayout>
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
    path: ROUTES.STUDENT_LESSON_DETAILS,
    element: (
      <StudentRoute>
        <AppLayout>
          <StudentLessonDetailsPage />
        </AppLayout>
      </StudentRoute>
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
    path: ROUTES.STUDENTS,
    element: (
      <AdminRoute>
        <AppLayout>
          <Students />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ENROLLMENTS,
    element: (
      <AdminRoute>
        <AppLayout>
          <Enrollments />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ANALYTICS,
    element: (
      <AdminRoute>
        <AppLayout>
          <Analytics />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.STUDENT_STATISTICS,
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
  // Blog admin routes
  {
    path: ROUTES.ADMIN_BLOG,
    element: (
      <AdminRoute>
        <AppLayout>
          <BlogDashboardPage />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ADMIN_BLOG_CATEGORIES,
    element: (
      <AdminRoute>
        <AppLayout>
          <BlogCategoryManagementPage />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ADMIN_BLOG_NEW,
    element: (
      <AdminRoute>
        <AppLayout>
          <BlogPostEditorPage />
        </AppLayout>
      </AdminRoute>
    ),
  },
  {
    path: ROUTES.ADMIN_BLOG_EDIT,
    element: (
      <AdminRoute>
        <AppLayout>
          <BlogPostEditorPage />
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

        {/* Redirect old auth routes to new auth screen */}
        <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.AUTH} />} />
        <Route path={ROUTES.SIGNUP} element={<Navigate to={ROUTES.AUTH} />} />

        {/* Fallback route */}
        <Route path={fallbackRoute.path} element={fallbackRoute.element} />
      </Routes>
    </GlobalErrorBoundary>
  );
};

export default AppRoutes;