import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import HomePage from './pages/HomePage';
import Courses from './pages/Courses';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import MyCourses from './pages/MyCourses';
import CourseContentView from './pages/CourseContentView';
import CourseContentBuilder from './pages/CourseContentBuilder';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageViewTracker from './components/analytics/PageViewTracker';

// Lazy load context providers and pages
const AuthProvider = lazy(() => import('./contexts/AuthContext').then(mod => ({ default: mod.AuthProvider })).catch(() => {
  return { default: ({ children }) => children };
}));

const CourseProvider = lazy(() => import('./contexts/CourseContext').then(mod => ({ default: mod.CourseProvider })).catch(() => {
  return { default: ({ children }) => children };
}));

const BlogProvider = lazy(() => import('./contexts/BlogContext').then(mod => ({ default: mod.BlogProvider })).catch(() => {
  return { default: ({ children }) => children };
}));

const CourseDetails = lazy(() => import('./pages/CourseDetails').catch(() => {
  return {
    default: () => (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <h1>Course Details Coming Soon</h1>
      </Box>
    )
  };
}));

const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard').catch(() => {
  return {
    default: () => (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <h1>Instructor Dashboard Coming Soon</h1>
      </Box>
    )
  };
}));

const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogEditor = lazy(() => import('./pages/BlogEditor'));
const LessonAttendance = lazy(() => import('./pages/instructor/LessonAttendance'));
const CourseAttendanceOverview = lazy(() => import('./pages/instructor/CourseAttendanceOverview'));
const AdminUserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminBlogAnalytics = lazy(() => import('./pages/admin/analytics/BlogAnalytics'));

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <AuthProvider>
            <CourseProvider>
              <BlogProvider>
                <Router future={{ v7_relativeSplatPath: true }}>
                  <PageViewTracker />
                  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Header />
                    <Box sx={{ flex: 1 }}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:courseId" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <CourseDetails />
                          </Suspense>
                        } />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                          path="/student/my-courses"
                          element={
                            <ProtectedRoute>
                              <MyCourses />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/student/course/:courseId"
                          element={
                            <ProtectedRoute>
                              <CourseContentView />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/instructor/dashboard"
                          element={
                            <ProtectedRoute requiredRole="instructor">
                              <Suspense fallback={<LoadingSpinner />}>
                                <InstructorDashboard />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/instructor/course/:courseId/content"
                          element={
                            <ProtectedRoute requiredRole="instructor">
                              <CourseContentBuilder />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/instructor/course/:courseId/lesson/:lessonId/attendance"
                          element={
                            <ProtectedRoute requiredRole="instructor">
                              <Suspense fallback={<LoadingSpinner />}>
                                <LessonAttendance />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/instructor/course/:courseId/attendance"
                          element={
                            <ProtectedRoute requiredRole="instructor">
                              <Suspense fallback={<LoadingSpinner />}>
                                <CourseAttendanceOverview />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        {/* Admin Routes */}
                        <Route
                          path="/admin/users"
                          element={
                            <ProtectedRoute requiredRole="admin">
                              <Suspense fallback={<LoadingSpinner />}>
                                <AdminUserManagement />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/analytics/blog"
                          element={
                            <ProtectedRoute requiredRole="admin">
                              <Suspense fallback={<LoadingSpinner />}>
                                <AdminBlogAnalytics />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/blog" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Blog />
                          </Suspense>
                        } />
                        <Route path="/blog/new" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <BlogEditor />
                          </Suspense>
                        } />
                        <Route path="/blog/edit/:id" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <BlogEditor />
                          </Suspense>
                        } />
                        <Route path="/blog/:slug" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <BlogPost />
                          </Suspense>
                        } />
                        <Route path="/blog/category/:category" element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <Blog />
                          </Suspense>
                        } />
                      </Routes>
                    </Box>
                    <Footer />
                  </Box>
                </Router>
              </BlogProvider>
            </CourseProvider>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
