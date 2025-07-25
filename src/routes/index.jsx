import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "./constants";
import AppLayout from "../components/Layout/AppLayout";
import CustomSpinner from "../components/CustomSpinner";
import StudentDashboardPage from "../student-ui/students-pages/student-dashboard-page/StudentDashboardPage";
import StudentCourseDetailsPage from "../student-ui/students-pages/student-course-details-page/StudentCourseDetailsPage";
import StudentLessonDetailsPage from "../student-ui/students-pages/student-lesson-details-page/StudentLessonDetailsPage";

// Lazy load components
const Landing = React.lazy(() => import("../screens/Landing"));
const Auth = React.lazy(() => import("../screens/Auth"));
const Dashboard = React.lazy(() => import("../screens/Dashboard"));
const ManagementDashboard = React.lazy(() =>
  import("../screens/ManagementDashboard")
);
const Profile = React.lazy(() => import("../screens/Profile"));
const CourseDetails = React.lazy(() =>
  import("../screens/CourseDetailsScreen")
);
const Students = React.lazy(() => import("../screens/Students"));
const Enrollments = React.lazy(() => import("../screens/Enrollments"));
const Analytics = React.lazy(() => import("../screens/Analytics"));
const Settings = React.lazy(() => import("../screens/Settings"));
const Pricing = React.lazy(() => import("../screens/Pricing"));
const About = React.lazy(() => import("../screens/About"));
const Contact = React.lazy(() => import("../screens/Contact"));

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();
  return currentUser ? children : <Navigate to={ROUTES.AUTH} />;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();
  if (!currentUser) {
    return <Navigate to={ROUTES.AUTH} />;
  }
  if (!userData?.isAdmin) {
    return <Navigate to={ROUTES.LANDING} />;
  }
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

  // Student Profile Page
  {
    path: ROUTES.STUDENT_DASHBOARD,
    element: (
      <AppLayout>
        <StudentDashboardPage />
      </AppLayout>
    ),
  },
  {
    path: ROUTES.STUDENT_LESSON_DETAILS,
    element: (
      <AppLayout>
        <StudentLessonDetailsPage />
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
          <Analytics />
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
];

// Fallback route
export const fallbackRoute = {
  path: "*",
  element: <Navigate to={ROUTES.LANDING} />,
};

// Main router component
const AppRoutes = () => {
  return (
    <React.Suspense
      fallback={<CustomSpinner message="Loading application..." />}
    >
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

        {/* Redirect old auth routes to new auth screen */}
        <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.AUTH} />} />
        <Route path={ROUTES.SIGNUP} element={<Navigate to={ROUTES.AUTH} />} />

        {/* Fallback route */}
        <Route path={fallbackRoute.path} element={fallbackRoute.element} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
