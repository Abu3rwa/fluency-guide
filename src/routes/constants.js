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
  STUDENT_FILL_IN_BLANKS_TASK: "/student/tasks/fill-in-blanks/:taskId",
  STUDENT_MULTIPLE_CHOICE_TASK: "/student/tasks/multiple-choice/:taskId",
  STUDENT_TRUE_FALSE_TASK: "/student/tasks/true-false/:taskId",
  STUDENT_GENERIC_TASK: "/student/tasks/:taskId",
  STUDENT_TASK_RESULTS: "/student/task/:taskId/results",
  STUDENT_VOCABULARY_BUILDING: "/student/vocabulary",
  STUDENT_PROGRESS: "/student/progress",
  STUDENT_STATISTICS: "/student/statistics",


  // Blog routes
  BLOG: "/blog",
  BLOG_POST: "/blog/:lang/:slug",
  BLOG_CATEGORY: "/blog/category/:slug",
  ADMIN_BLOG: "/admin/blog",
  ADMIN_BLOG_NEW: "/admin/blog/new",
  ADMIN_BLOG_EDIT: "/admin/blog/edit/:postId",
  ADMIN_BLOG_CATEGORIES: "/admin/blog/categories",
};

// Helper function to generate course details URL
export const getCourseDetailsUrl = (courseId) =>
  ROUTES.COURSE_DETAILS.replace(":id", courseId);

// Helper function to generate course edit URL
export const getCourseEditUrl = (courseId) =>
  ROUTES.COURSE_EDIT.replace(":id", courseId);
