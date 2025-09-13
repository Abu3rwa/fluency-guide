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

  // Session routes
  ADMIN_SESSION_TYPES: "/admin/session-types",
  ADMIN_SESSION_DASHBOARD: "/admin/sessions",
  ADMIN_INSTRUCTOR_MANAGEMENT: "/admin/instructors",
  ADMIN_SESSION_ANALYTICS: "/admin/session-analytics",
  ADMIN_TERMS_MANAGEMENT: "/admin/terms-management",
  INSTRUCTOR_DASHBOARD: "/instructor/dashboard",
  INSTRUCTOR_SESSION_TYPES: "/instructor/session-types",
  INSTRUCTOR_PROFILE: "/instructor/profile",
  INSTRUCTOR_PUBLIC_PROFILE: "/instructors/:id", // Public instructor profile
  INSTRUCTOR_AVAILABILITY: "/instructor/availability",
  STUDENT_BOOKING: "/student/booking",
  SESSION_BOOKING_CALENDAR: "/sessions/calendar",
  INSTRUCTORS_SHOWCASE: "/instructors",

  // Student UI routes
  STUDENT_DASHBOARD: "/student/dashboard/:id",
  STUDENT_COURSES: "/student/courses",
  STUDENT_LESSON_DETAILS: "/student/lessons/:lessonId",
  STUDENT_FILL_IN_BLANKS_TASK: "/student/tasks/fill-in-blanks/:taskId",
  STUDENT_MULTIPLE_CHOICE_TASK: "/student/tasks/multiple-choice/:taskId",
  STUDENT_TRUE_FALSE_TASK: "/student/tasks/true-false/:taskId",
  STUDENT_GENERIC_TASK: "/student/tasks/:taskId",
  STUDENT_TASK_RESULTS: "/student/task/:taskId/results",
  STUDENT_VOCABULARY_BUILDING: "/student/vocabulary",
  STUDENT_PROGRESS: "/student/progress",
  STUDENT_STATISTICS: "/student/statistics",

  // Test routes
  OCR_TEST: "/ocr-test",
};

// Helper function to generate course details URL
export const getCourseDetailsUrl = (courseId) =>
  ROUTES.COURSE_DETAILS.replace(":id", courseId);

// Helper function to generate course edit URL
export const getCourseEditUrl = (courseId) =>
  ROUTES.COURSE_EDIT.replace(":id", courseId);

// Helper function to generate student courses URL
export const getStudentCoursesUrl = () => ROUTES.STUDENT_COURSES;
