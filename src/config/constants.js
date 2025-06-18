// API Endpoints
export const API_ENDPOINTS = {
  COURSES: "/courses",
  LESSONS: "/lessons",
  TASKS: "/tasks",
  STUDENTS: "/students",
  ENROLLMENTS: "/enrollments",
  MESSAGES: "/messages",
};

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  COURSES: "/courses",
  COURSE_DETAILS: "/courses/:id",
  LESSON_DETAILS: "/lessons/:id",
  TASKS: "/tasks",
  STUDENTS: "/students",
  ENROLLMENTS: "/enrollments",
  MESSAGING: "/messaging",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  ANALYTICS: "/analytics",
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: "users",
  COURSES: "courses",
  LESSONS: "lessons",
  TASKS: "tasks",
  ENROLLMENTS: "enrollments",
  MESSAGES: "messages",
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
};

// Status Constants
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  COMPLETED: "completed",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

// File Upload
export const FILE_UPLOADS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "application/pdf"],
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: "Changes saved successfully.",
  CREATED: "Created successfully.",
  UPDATED: "Updated successfully.",
  DELETED: "Deleted successfully.",
};
