export const ROUTES = {
  // Public routes
  LANDING: "/",
  AUTH: "/auth",
  LOGIN: "/login",
  SIGNUP: "/signup",
  COURSES: "/courses",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  STUDENT_COURSE_DETAILS: "/student/courses/:id",
  // Protected routes
  PROFILE: "/profile",

  // Admin routes
  DASHBOARD: "/dashboard",
  COURSE_CREATE: "/courses/create",
  COURSE_DETAILS: "/courses/:id",
  COURSE_EDIT: "/courses/edit/:id",
  STUDENTS: "/students",
  ENROLLMENTS: "/enrollments",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",

  // Student UI routes
  STUDENT_DASHBOARD: "/student/dashboard/:id",
  STUDENT_LESSON_DETAILS: "/student/lessons/:lessonId",
};

// Helper function to generate course details URL
export const getCourseDetailsUrl = (courseId) =>
  ROUTES.COURSE_DETAILS.replace(":id", courseId);

// Helper function to generate course edit URL
export const getCourseEditUrl = (courseId) =>
  ROUTES.COURSE_EDIT.replace(":id", courseId);
