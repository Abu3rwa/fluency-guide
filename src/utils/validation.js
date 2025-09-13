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

// Comprehensive validation utilities for forms and inputs

/**
 * Email validation with regex
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, message: "Email is required" };
  if (!emailRegex.test(email))
    return { isValid: false, message: "Please enter a valid email address" };
  return { isValid: true, message: "" };
};

/**
 * Phone number validation
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, message: "" }; // Phone is optional
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  if (!phoneRegex.test(phone))
    return { isValid: false, message: "Please enter a valid phone number" };
  return { isValid: true, message: "" };
};

/**
 * Name validation
 */
export const validateName = (name) => {
  if (!name) return { isValid: false, message: "Name is required" };
  if (name.length < 2)
    return { isValid: false, message: "Name must be at least 2 characters" };
  if (name.length > 50)
    return { isValid: false, message: "Name must be less than 50 characters" };
  return { isValid: true, message: "" };
};

/**
 * Message validation
 */
export const validateMessage = (message) => {
  if (!message) return { isValid: false, message: "Message is required" };
  if (message.length < 10)
    return {
      isValid: false,
      message: "Message must be at least 10 characters",
    };
  if (message.length > 1000)
    return {
      isValid: false,
      message: "Message must be less than 1000 characters",
    };
  return { isValid: true, message: "" };
};

/**
 * WhatsApp number validation
 */
export const validateWhatsAppNumber = (number) => {
  if (!number) return { isValid: true, message: "" }; // Optional
  const cleanNumber = number.replace(/[\s\-()]/g, "");
  const numberRegex = /^\+?[\d]{10,15}$/;
  if (!numberRegex.test(cleanNumber)) {
    return { isValid: false, message: "Please enter a valid WhatsApp number" };
  }
  return { isValid: true, message: "" };
};

/**
 * URL validation
 */
export const validateURL = (url) => {
  if (!url) return { isValid: true, message: "" }; // Optional
  try {
    new URL(url);
    return { isValid: true, message: "" };
  } catch {
    return { isValid: false, message: "Please enter a valid URL" };
  }
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove potentially dangerous characters and patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(limit = 3, windowMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  canAttempt(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(
      (time) => now - time < this.windowMs
    );

    if (recentAttempts.length >= this.limit) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  getRemainingAttempts(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(
      (time) => now - time < this.windowMs
    );
    return Math.max(0, this.limit - recentAttempts.length);
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

/**
 * Contact form validation
 */
export const validateContactForm = (data) => {
  const errors = {};

  // Validate name
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  // Validate phone (optional)
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
  }

  // Validate message
  const messageValidation = validateMessage(data.message);
  if (!messageValidation.isValid) {
    errors.message = messageValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Settings form validation
 */
export const validateSettingsForm = (data, formType) => {
  const errors = {};

  switch (formType) {
    case "hero":
      if (!data.title?.trim()) errors.title = "Title is required";
      if (!data.subtitle?.trim()) errors.subtitle = "Subtitle is required";
      break;

    case "contact": {
      const contactValidation = validateContactForm(data);
      if (!contactValidation.isValid) {
        Object.assign(errors, contactValidation.errors);
      }
      break;
    }

    case "social": {
      if (data.whatsappNumber) {
        const whatsappValidation = validateWhatsAppNumber(data.whatsappNumber);
        if (!whatsappValidation.isValid) {
          errors.whatsappNumber = whatsappValidation.message;
        }
      }
      if (data.tiktokLink) {
        const urlValidation = validateURL(data.tiktokLink);
        if (!urlValidation.isValid) {
          errors.tiktokLink = urlValidation.message;
        }
      }
      break;
    }

    default:
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * CSRF token generation
 */
export const generateCSRFToken = () => {
  return btoa(Math.random().toString()).substr(10, 32);
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token, storedToken) => {
  return token === storedToken;
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateMessage,
  validateWhatsAppNumber,
  validateURL,
  sanitizeInput,
  RateLimiter,
  validateContactForm,
  validateSettingsForm,
  generateCSRFToken,
  validateCSRFToken,
};
