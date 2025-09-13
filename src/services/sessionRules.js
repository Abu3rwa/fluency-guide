/**
 * @fileoverview Frontend validation utilities for session management
 * @description This file provides client-side validation helpers for session-related data
 * For Firestore security rules, see sessionRules.rules
 */

// @ts-check
// sessionRules.js - Frontend validation utilities for session management
// This file provides client-side validation helpers for session-related data
// For Firestore security rules, see sessionRules.rules

import { addDays, isAfter, isBefore, parseISO, formatISO } from 'date-fns';

// Valid session statuses
export const SESSION_STATUSES = ['scheduled', 'active', 'completed', 'cancelled'];
export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
export const NOTIFICATION_STATUSES = ['pending', 'sent', 'failed'];
export const NOTIFICATION_TYPES = ['booking_confirmation', 'session_reminder', 'session_cancelled', 'session_completed'];
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'LYD'];

// Session type validation (client-side)
export const validateSessionType = (sessionType) => {
  const errors = {};
  
  if (!sessionType.name || typeof sessionType.name !== 'string') {
    errors.name = 'Session type name is required';
  } else if (sessionType.name.length > 100) {
    errors.name = 'Session type name must be 100 characters or less';
  }
  
  if (!sessionType.duration || typeof sessionType.duration !== 'number') {
    errors.duration = 'Duration is required and must be a number';
  } else if (sessionType.duration <= 0 || sessionType.duration > 300) {
    errors.duration = 'Duration must be between 1 and 300 minutes';
  } else if (sessionType.duration % 30 !== 0) {
    errors.duration = 'Duration must be in 30-minute intervals';
  }
  
  if (sessionType.price === undefined || typeof sessionType.price !== 'number') {
    errors.price = 'Price is required and must be a number';
  } else if (sessionType.price < 0) {
    errors.price = 'Price must be non-negative';
  }
  
  if (!sessionType.currency || !SUPPORTED_CURRENCIES.includes(sessionType.currency)) {
    errors.currency = `Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`;
  }
  
  if (typeof sessionType.active !== 'boolean') {
    errors.active = 'Active status must be a boolean';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Session validation (client-side)
export const validateSession = (session) => {
  const errors = {};
  
  if (!session.instructorId || typeof session.instructorId !== 'string') {
    errors.instructorId = 'Instructor ID is required';
  }
  
  if (!session.sessionTypeId || typeof session.sessionTypeId !== 'string') {
    errors.sessionTypeId = 'Session type ID is required';
  }
  
  if (!session.date) {
    errors.date = 'Session date is required';
  }
  
  if (!session.startTime) {
    errors.startTime = 'Start time is required';
  }
  
  if (!session.endTime) {
    errors.endTime = 'End time is required';
  }
  
  if (session.startTime && session.endTime) {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    
    if (startTime >= endTime) {
      errors.endTime = 'End time must be after start time';
    }
    
    // Validate Libya timezone business hours (8 AM - 8 PM)
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    
    if (startHour < 8 || endHour > 20) {
      errors.businessHours = 'Sessions must be between 8 AM and 8 PM (Libya time)';
    }
  }
  
  if (!session.status || !SESSION_STATUSES.includes(session.status)) {
    errors.status = `Status must be one of: ${SESSION_STATUSES.join(', ')}`;
  }
  
  if (!session.maxStudents || typeof session.maxStudents !== 'number') {
    errors.maxStudents = 'Max students is required and must be a number';
  } else if (session.maxStudents <= 0 || session.maxStudents > 10) {
    errors.maxStudents = 'Max students must be between 1 and 10';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Availability validation (client-side)
export const validateAvailability = (availability) => {
  const errors = {};
  
  if (!availability.instructorId || typeof availability.instructorId !== 'string') {
    errors.instructorId = 'Instructor ID is required';
  }
  
  if (!availability.date) {
    errors.date = 'Date is required';
  }
  
  if (!availability.startTime) {
    errors.startTime = 'Start time is required';
  }
  
  if (!availability.endTime) {
    errors.endTime = 'End time is required';
  }
  
  if (availability.startTime && availability.endTime) {
    const startTime = new Date(availability.startTime);
    const endTime = new Date(availability.endTime);
    
    if (startTime >= endTime) {
      errors.endTime = 'End time must be after start time';
    }
  }
  
  if (typeof availability.isRecurring !== 'boolean') {
    errors.isRecurring = 'Is recurring must be a boolean';
  }
  
  if (typeof availability.isActive !== 'boolean') {
    errors.isActive = 'Is active must be a boolean';
  }
  
  // If recurring, validate additional fields
  if (availability.isRecurring) {
    if (!availability.patternType || !['weekly', 'daily'].includes(availability.patternType)) {
      errors.patternType = 'Pattern type must be either "weekly" or "daily"';
    }
    
    if (!Array.isArray(availability.daysOfWeek)) {
      errors.daysOfWeek = 'Days of week must be an array';
    } else if (availability.daysOfWeek.some(day => typeof day !== 'number' || day < 0 || day > 6)) {
      errors.daysOfWeek = 'Days of week must be numbers between 0 (Sunday) and 6 (Saturday)';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Booking validation (client-side)
export const validateBooking = (booking) => {
  const errors = {};
  
  if (!booking.userId || typeof booking.userId !== 'string') {
    errors.userId = 'User ID is required';
  }
  
  if (!booking.sessionId || typeof booking.sessionId !== 'string') {
    errors.sessionId = 'Session ID is required';
  }
  
  if (!booking.instructorId || typeof booking.instructorId !== 'string') {
    errors.instructorId = 'Instructor ID is required';
  }
  
  if (!booking.sessionTypeId || typeof booking.sessionTypeId !== 'string') {
    errors.sessionTypeId = 'Session type ID is required';
  }
  
  if (!booking.status || !BOOKING_STATUSES.includes(booking.status)) {
    errors.status = `Status must be one of: ${BOOKING_STATUSES.join(', ')}`;
  }
  
  if (!booking.bookingDate) {
    errors.bookingDate = 'Booking date is required';
  }
  
  if (!booking.scheduledDate) {
    errors.scheduledDate = 'Scheduled date is required';
  }
  
  if (!booking.phoneNumber || typeof booking.phoneNumber !== 'string') {
    errors.phoneNumber = 'Phone number is required';
  } else if (!isValidPhoneNumber(booking.phoneNumber)) {
    errors.phoneNumber = 'Phone number must be 10-20 characters and contain only numbers, spaces, dashes, and plus sign';
  }
  
  // Validate 1+ day advance booking
  if (booking.scheduledDate) {
    const scheduledDate = new Date(booking.scheduledDate);
    const minimumDate = addDays(new Date(), 1);
    
    if (isBefore(scheduledDate, minimumDate)) {
      errors.scheduledDate = 'Bookings must be made at least 1 day in advance';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Notification validation (client-side)
export const validateNotification = (notification) => {
  const errors = {};
  
  if (!notification.userId || typeof notification.userId !== 'string') {
    errors.userId = 'User ID is required';
  }
  
  if (!notification.type || !NOTIFICATION_TYPES.includes(notification.type)) {
    errors.type = `Notification type must be one of: ${NOTIFICATION_TYPES.join(', ')}`;
  }
  
  if (!notification.message || typeof notification.message !== 'string') {
    errors.message = 'Message is required';
  } else if (notification.message.length > 1000) {
    errors.message = 'Message must be 1000 characters or less';
  }
  
  if (!notification.status || !NOTIFICATION_STATUSES.includes(notification.status)) {
    errors.status = `Status must be one of: ${NOTIFICATION_STATUSES.join(', ')}`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper validation functions
export const isValidPhoneNumber = (phone) => {
  if (typeof phone !== 'string') return false;
  if (phone.length < 10 || phone.length > 20) return false;
  return /^[+]?[0-9\s-]+$/.test(phone);
};

export const isValidCurrency = (currency) => {
  return SUPPORTED_CURRENCIES.includes(currency);
};

export const isValidSessionStatus = (status) => {
  return SESSION_STATUSES.includes(status);
};

export const isValidBookingStatus = (status) => {
  return BOOKING_STATUSES.includes(status);
};

export const isValidNotificationStatus = (status) => {
  return NOTIFICATION_STATUSES.includes(status);
};

export const isValidNotificationType = (type) => {
  return NOTIFICATION_TYPES.includes(type);
};

// Libya timezone utilities (UTC+2)
export const convertToLibyaTime = (date) => {
  const libyaTime = new Date(date);
  libyaTime.setHours(libyaTime.getHours() + 2);
  return libyaTime;
};

export const convertFromLibyaTime = (date) => {
  const utcTime = new Date(date);
  utcTime.setHours(utcTime.getHours() - 2);
  return utcTime;
};

// Business hours validation (8 AM - 8 PM Libya time)
export const isWithinBusinessHours = (date) => {
  const libyaTime = convertToLibyaTime(date);
  const hour = libyaTime.getHours();
  return hour >= 8 && hour < 20;
};

// Minimum advance booking validation (1+ day)
export const isValidAdvanceBooking = (scheduledDate, currentDate = new Date()) => {
  const scheduled = new Date(scheduledDate);
  const minimum = addDays(currentDate, 1);
  return isAfter(scheduled, minimum);
};

// Session duration validation (30-minute intervals)
export const isValidSessionDuration = (duration) => {
  return typeof duration === 'number' && 
         duration > 0 && 
         duration <= 300 && 
         duration % 30 === 0;
};

// Export all validation functions as a group
export const sessionValidators = {
  validateSessionType,
  validateSession,
  validateAvailability,
  validateBooking,
  validateNotification,
  isValidPhoneNumber,
  isValidCurrency,
  isValidSessionStatus,
  isValidBookingStatus,
  isValidNotificationStatus,
  isValidNotificationType,
  convertToLibyaTime,
  convertFromLibyaTime,
  isWithinBusinessHours,
  isValidAdvanceBooking,
  isValidSessionDuration
};

export default sessionValidators;