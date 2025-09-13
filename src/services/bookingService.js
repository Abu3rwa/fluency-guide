// bookingService.js

// Import relevant functions from sessionService.js
import { bookingService as sessionBookingService } from './sessionService';

// Create a service that exports the same functions as sessionBookingService
export const bookingService = {
  /**
   * Get booking by ID
   * @param {string} id Booking ID
   * @returns {Promise<Object>} Booking data
   */
  getById: async (id) => {
    return sessionBookingService.getById(id);
  },

  /**
   * Get bookings for user
   * @param {string} userId User ID
   * @param {string} [status] Filter by booking status
   * @returns {Promise<Array>} List of bookings
   */
  getForUser: async (userId, status) => {
    return sessionBookingService.getForUser(userId, status);
  },

  /**
   * Get bookings for instructor
   * @param {string} instructorId Instructor ID
   * @param {string} [status] Filter by booking status
   * @returns {Promise<Array>} List of bookings
   */
  getForInstructor: async (instructorId, status) => {
    return sessionBookingService.getForInstructor(instructorId, status);
  },

  /**
   * Get bookings for session
   * @param {string} sessionId Session ID
   * @returns {Promise<Array>} List of bookings
   */
  getForSession: async (sessionId) => {
    return sessionBookingService.getForSession(sessionId);
  },

  /**
   * Create booking
   * @param {Object} booking Booking data
   * @returns {Promise<string>} Created booking ID
   */
  create: async (booking) => {
    return sessionBookingService.create(booking);
  },

  /**
   * Update booking
   * @param {string} id Booking ID
   * @param {Object} updates Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, updates) => {
    return sessionBookingService.update(id, updates);
  },

  /**
   * Delete booking
   * @param {string} id Booking ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    return sessionBookingService.delete(id);
  },

  /**
   * Get all bookings
   * @returns {Promise<Array>} List of all bookings
   */
  getAll: async () => {
    return sessionBookingService.getAll();
  }
};