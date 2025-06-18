import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "./constants";
import MainLayout from "../components/Layout/MainLayout";

// Lazy load components
const Landing = React.lazy(() => import("../screens/Landing"));
const Auth = React.lazy(() => import("../screens/Auth"));
const Dashboard = React.lazy(() => import("../screens/Dashboard"));
const Profile = React.lazy(() => import("../screens/Profile"));
const Courses = React.lazy(() => import("../screens/Courses"));
const CourseDetails = React.lazy(() =>
  import("../screens/CourseDetailsScreen")
);
const CreateCourse = React.lazy(() => import("../screens/CourseCreate"));
const EditCourse = React.lazy(() => import("../screens/EditCourse"));
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
  { path: ROUTES.LANDING, element: <Landing /> },
  { path: ROUTES.AUTH, element: <Auth /> },
  { path: ROUTES.COURSES, element: <Courses /> },
  { path: ROUTES.PRICING, element: <Pricing /> },
  { path: ROUTES.ABOUT, element: <About /> },
  { path: ROUTES.CONTACT, element: <Contact /> },
];

// Protected routes
export const protectedRoutes = [
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <Profile />
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
        <Dashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/courses",
    element: (
      <AdminRoute>
        <Courses />
      </AdminRoute>
    ),
  },
  {
    path: "/courses/create",
    element: (
      <AdminRoute>
        <CreateCourse />
      </AdminRoute>
    ),
  },
  {
    path: "/courses/:id",
    element: (
      <AdminRoute>
        <MainLayout>
          <CourseDetails />
        </MainLayout>
      </AdminRoute>
    ),
  },
  {
    path: "/courses/edit/:id",
    element: (
      <AdminRoute>
        <EditCourse />
      </AdminRoute>
    ),
  },
  {
    path: "/students",
    element: (
      <AdminRoute>
        <Students />
      </AdminRoute>
    ),
  },
  {
    path: "/enrollments",
    element: (
      <AdminRoute>
        <Enrollments />
      </AdminRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <AdminRoute>
        <Analytics />
      </AdminRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <AdminRoute>
        <Settings />
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
    <React.Suspense fallback={<div>Loading...</div>}>
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
