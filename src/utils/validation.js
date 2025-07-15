import * as yup from "yup";

// Course validation schema
export const courseSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  category: yup.string().required("Category is required"),
  level: yup
    .string()
    .oneOf(["beginner", "intermediate", "advanced"], "Invalid level")
    .required("Level is required"),
  price: yup
    .number()
    .min(0, "Price must be non-negative")
    .required("Price is required"),
  status: yup
    .string()
    .oneOf(["draft", "active", "archived"], "Invalid status")
    .required("Status is required"),
});

// Module validation schema
export const moduleSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must be less than 300 characters"),
  order: yup
    .number()
    .min(1, "Order must be at least 1")
    .required("Order is required"),
  status: yup
    .string()
    .oneOf(["draft", "active", "archived"], "Invalid status")
    .required("Status is required"),
});

// Lesson validation schema
export const lessonSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must be less than 300 characters"),
  content: yup
    .string()
    .required("Content is required")
    .min(20, "Content must be at least 20 characters"),
  duration: yup
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration must be less than 8 hours")
    .required("Duration is required"),
  order: yup
    .number()
    .min(1, "Order must be at least 1")
    .required("Order is required"),
  type: yup
    .string()
    .oneOf(["video", "text", "quiz", "assignment"], "Invalid type")
    .required("Type is required"),
  status: yup
    .string()
    .oneOf(["draft", "active", "archived"], "Invalid status")
    .required("Status is required"),
});

// Task validation schema
export const taskSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must be less than 300 characters"),
  type: yup
    .string()
    .oneOf(["assignment", "quiz", "discussion"], "Invalid type")
    .required("Type is required"),
  points: yup
    .number()
    .min(1, "Points must be at least 1")
    .max(100, "Points must be less than 100")
    .required("Points is required"),
  status: yup
    .string()
    .oneOf(["draft", "active", "archived"], "Invalid status")
    .required("Status is required"),
});

// Generic validation helper
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (validationErrors) {
    const errors = {};
    validationErrors.inner.forEach((error) => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};

// Field validation helper
export const validateField = async (schema, fieldName, value) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    return null;
  } catch (error) {
    return error.message;
  }
};
