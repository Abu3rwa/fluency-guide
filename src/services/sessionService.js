// sessionService.js - Firebase session management service

import { db } from '../firebase';
import { getSessionTypeNameString } from '../utils/sessionLocalization';
import dayjs from 'dayjs';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const SESSION_TYPES_COLLECTION = 'sessionTypes';
const SESSIONS_COLLECTION = 'sessions';
const AVAILABILITY_COLLECTION = 'availability';
const BOOKINGS_COLLECTION = 'bookings';
const NOTIFICATIONS_COLLECTION = 'notifications';

// Session Types Service
export const sessionTypeService = {
  /**
   * Normalize session type data to ensure consistent types
   * @param {Object} sessionType Raw session type from database
   * @returns {Object} Normalized session type
   */
  _normalizeSessionType: (sessionType) => {
    if (!sessionType) return sessionType;
    
    return {
      ...sessionType,
      // Ensure duration is a number
      duration: typeof sessionType.duration === 'string' ? parseInt(sessionType.duration, 10) || 0 : sessionType.duration,
      // Ensure price is a number
      price: typeof sessionType.price === 'string' ? parseFloat(sessionType.price) || 0 : sessionType.price
    };
  },
  /**
   * Get all session types
   * @returns {Promise<Array>} List of session types
   */
  getAll: async (user) => {
    try {
      let q;
      if (user && user.isAdmin) {
        // Admin can see all session types
        q = query(
          collection(db, SESSION_TYPES_COLLECTION)
        );
      } else if (user) {
        // Instructors can only see their own session types
        q = query(
          collection(db, SESSION_TYPES_COLLECTION),
          where('createdBy', '==', user.uid)
        );
      } else {
        // No user, return empty array
        return [];
      }

      const snapshot = await getDocs(q);
      const sessionTypes = snapshot.docs.map(doc => 
        sessionTypeService._normalizeSessionType({ id: doc.id, ...doc.data() })
      );
      
      // Sort by name in memory to avoid composite index requirement
      return sessionTypes.sort((a, b) => {
        const nameA = getSessionTypeNameString(a, 'en').toLowerCase();
        const nameB = getSessionTypeNameString(b, 'en').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } catch (error) {
      console.error('Error fetching session types:', error);
      throw error;
    }
  },

  /**
   * Get active session types for public (students)
   * @returns {Promise<Array>} Active session types
   */
  getPublicActive: async () => {
    try {
      const q = query(
        collection(db, SESSION_TYPES_COLLECTION),
        where('active', '==', true)
      );
      const snapshot = await getDocs(q);
      const sessionTypes = snapshot.docs.map(doc => 
        sessionTypeService._normalizeSessionType({ id: doc.id, ...doc.data() })
      );
      
      // Sort by name in memory to avoid composite index requirement
      return sessionTypes.sort((a, b) => {
        const nameA = getSessionTypeNameString(a, 'en').toLowerCase();
        const nameB = getSessionTypeNameString(b, 'en').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } catch (error) {
      console.error('Error fetching public active session types:', error);
      throw error;
    }
  },

  /**
   * Get session type by ID
   * @param {string} id Session type ID
   * @returns {Promise<Object>} Session type data
   */
  getById: async (id) => {
    try {
      const docRef = doc(db, SESSION_TYPES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Session type with ID ${id} not found`);
      }
      
      return sessionTypeService._normalizeSessionType({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
      console.error(`Error fetching session type ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new session type
   * @param {Object} sessionType Session type data
   * @returns {Promise<string>} Created session type ID
   */
  create: async (sessionType, userId) => {
    try {
      const docRef = await addDoc(collection(db, SESSION_TYPES_COLLECTION), {
        ...sessionType,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating session type:', error);
      throw error;
    }
  },

  /**
   * Update session type
   * @param {string} id Session type ID
   * @param {Object} updates Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, updates) => {
    try {
      const docRef = doc(db, SESSION_TYPES_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error updating session type ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete session type
   * @param {string} id Session type ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const docRef = doc(db, SESSION_TYPES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting session type ${id}:`, error);
      throw error;
    }
  }
};

// Sessions Service
export const sessionService = {
  /**
   * Get session by ID
   * @param {string} id Session ID
   * @returns {Promise<Object>} Session data
   */
  getById: async (id) => {
    try {
      const docRef = doc(db, SESSIONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Session with ID ${id} not found`);
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(`Error fetching session ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all sessions
   * @returns {Promise<Array>} List of all sessions
   */
  getAll: async () => {
    try {
      const q = query(
        collection(db, SESSIONS_COLLECTION),
        orderBy('startTime', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const sessions = [];
      
      for (const doc of snapshot.docs) {
        const sessionData = { id: doc.id, ...doc.data() };
        
        // Get session type details
        if (sessionData.sessionTypeId) {
          try {
            const sessionType = await sessionTypeService.getById(sessionData.sessionTypeId);
            sessionData.sessionType = sessionType;
          } catch (error) {
            console.warn(`Could not fetch session type ${sessionData.sessionTypeId}:`, error);
          }
        }
        
        sessions.push(sessionData);
      }
      
      return sessions;
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      throw error;
    }
  },

  /**
   * Get sessions for instructor
   * @param {string} instructorId Instructor user ID
   * @param {string} [status] Filter by session status
   * @returns {Promise<Array>} List of sessions
   */
  getForInstructor: async (instructorId, status) => {
    try {
      let q = query(
        collection(db, SESSIONS_COLLECTION),
        where('instructorId', '==', instructorId)
      );
      
      if (status) {
        q = query(q, where('status', '==', status));
      }
      
      // Only add orderBy if we're not filtering by status to avoid composite index requirements
      if (!status) {
        q = query(q, orderBy('startTime'));
      }
      
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort manually if we couldn't use orderBy due to composite index
      if (status) {
        sessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      }
      
      return sessions;
    } catch (error) {
      console.error(`Error fetching sessions for instructor ${instructorId}:`, error);
      throw error;
    }
  },

  /**
   * Get sessions for instructor (alias for getForInstructor)
   * @param {string} instructorId Instructor user ID
   * @param {string} [status] Filter by session status
   * @returns {Promise<Array>} List of sessions
   */
  getByInstructor: async (instructorId, status) => {
    return sessionService.getForInstructor(instructorId, status);
  },

  /**
   * Get sessions for student
   * @param {string} userId Student user ID
   * @param {string} [status] Filter by session status
   * @returns {Promise<Array>} List of sessions
   */
  getForStudent: async (userId, status) => {
    try {
      let q = query(
        collection(db, SESSIONS_COLLECTION),
        where('userId', '==', userId)
      );
      
      if (status) {
        q = query(q, where('status', '==', status));
      }
      
      q = query(q, orderBy('startTime', 'desc'));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching sessions for student ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Create new session
   * @param {Object} session Session data
   * @returns {Promise<string>} Created session ID
   */
  create: async (session) => {
    try {
      // Ensure a userId exists on session. If not provided, fall back to instructorId or createdBy.
      const normalizedSession = { ...session };
      if (!normalizedSession.userId) {
        normalizedSession.userId = normalizedSession.instructorId || normalizedSession.createdBy || null;
      }
      if (!normalizedSession.userId) {
        throw new Error('userId is required when creating a session');
      }
      const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
        ...normalizedSession,
        status: session.status || 'scheduled',
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  /**
   * Update session
   * @param {string} id Session ID
   * @param {Object} updates Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, updates) => {
    try {
      const docRef = doc(db, SESSIONS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error updating session ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete session
   * @param {string} id Session ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const docRef = doc(db, SESSIONS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting session ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get instructor availability for a specific date
   * @param {string} instructorId Instructor user ID
   * @param {Date} date Date to check availability
   * @returns {Promise<Array>} List of available time slots
   */
  getInstructorAvailability: async (instructorId, date) => {
    try {
      const dayOfWeek = new Date(date).getDay();
      const dateString = new Date(date).toISOString().split('T')[0];

      const availabilityQuery = query(
        collection(db, `users/${instructorId}/availability`),
        where('daysOfWeek', 'array-contains', dayOfWeek)
      );

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('instructorId', '==', instructorId),
        where('date', '==', dateString)
      );

      const [availabilitySnap, bookingsSnap] = await Promise.all([
        getDocs(availabilityQuery),
        getDocs(bookingsQuery)
      ]);

      const bookedTimes = bookingsSnap.docs.map(doc => doc.data().time);
      const availableSlots = [];

      availabilitySnap.docs.forEach(doc => {
        const { startTime, endTime, slotDuration } = doc.data();
        let currentTime = new Date(`${dateString}T${startTime}`);
        const lastTime = new Date(`${dateString}T${endTime}`);

        while (currentTime < lastTime) {
          const timeString = currentTime.toTimeString().substring(0, 5);
          if (!bookedTimes.includes(timeString)) {
            availableSlots.push({
              id: `${doc.id}-${timeString}`,
              time: timeString,
              available: true
            });
          }
          currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
        }
      });

      return availableSlots;
    } catch (error) {
      console.error(`Error fetching availability for instructor ${instructorId}:`, error);
      throw error;
    }
  }
};

// Availability Service
export const availabilityService = {
  /**
   * Get availability for instructor
   * @param {string} instructorId Instructor user ID
   * @param {Date} startDate Start date for query
   * @param {Date} endDate End date for query
   * @returns {Promise<Array>} List of availability slots
   */
  getForInstructor: async (instructorId, startDate, endDate) => {
    console.log(`🚀 [DEBUG] Starting getForInstructor with:`, { instructorId, startDate, endDate });
    
    try {
      // Test Firebase connection first
      console.log(`🔗 [DEBUG] Testing Firebase connection...`);
      const testCollection = collection(db, 'users'); // Test with a collection that should exist
      console.log(`✅ [DEBUG] Firebase db object:`, !!db);
      console.log(`✅ [DEBUG] Collection reference created:`, !!testCollection);
      
      console.log(`🔍 [AVAILABILITY] Starting lookup for instructor ${instructorId}`);
      console.log(`📅 [AVAILABILITY] Date range: ${dayjs(startDate).format('YYYY-MM-DD')} to ${dayjs(endDate).format('YYYY-MM-DD')}`);
      console.log(`⏰ [AVAILABILITY] Current time: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
      
      // Validate inputs
      if (!instructorId || !startDate || !endDate) {
        console.error(`❌ [AVAILABILITY] Invalid parameters:`, { instructorId, startDate, endDate });
        throw new Error('Invalid parameters for availability lookup');
      }
      
      console.log(`🗃️ [AVAILABILITY] Querying collection: ${AVAILABILITY_COLLECTION}`);
      console.log(`🔍 [AVAILABILITY] About to create query...`);
      
      const q = query(
        collection(db, AVAILABILITY_COLLECTION),
        where('instructorId', '==', instructorId)
      );
      
      console.log(`✅ [AVAILABILITY] Query created successfully`);
      console.log(`🔍 [AVAILABILITY] Executing Firebase query...`);
      
      const snapshot = await getDocs(q);
      console.log(`✅ [AVAILABILITY] Query completed. Snapshot size: ${snapshot.size}`);
      
      let allAvailability = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log(`📊 [AVAILABILITY] Found ${allAvailability.length} availability records for instructor ${instructorId}`);
      
      if (allAvailability.length === 0) {
        console.log(`⚠️ [AVAILABILITY] No availability records found in database for instructor ${instructorId}`);
        return [];
      }
      
      // Log all slot dates and times for comprehensive debugging
      console.log(`📅 [AVAILABILITY] All slots for instructor ${instructorId}:`);
      allAvailability.forEach((slot, index) => {
        const slotDate = slot.date?.toDate ? dayjs(slot.date.toDate()) : dayjs(slot.date);
        const slotStartTime = slot.startTime?.toDate ? dayjs(slot.startTime.toDate()) : dayjs(slot.startTime);
        console.log(`  Slot ${index + 1}: Date=${slotDate.format('YYYY-MM-DD')}, StartTime=${slotStartTime.format('YYYY-MM-DD HH:mm')}, IsPattern=${slot.isPattern}`);
      });
      
      // Log first record structure for debugging
      if (allAvailability.length > 0) {
        console.log(`📋 [AVAILABILITY] Sample record structure:`, {
          id: allAvailability[0].id,
          instructorId: allAvailability[0].instructorId,
          isPattern: allAvailability[0].isPattern,
          date: allAvailability[0].date,
          startTime: allAvailability[0].startTime,
          endTime: allAvailability[0].endTime,
          patternType: allAvailability[0].patternType
        });
      }
      
      // Process recurring patterns and expand them into actual dates
      const processedAvailability = [];
      const daysToGenerate = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Get current time in Libya timezone for proper comparison
      const nowLibya = dayjs().add(2, 'hour'); // Libya is UTC+2
      
      allAvailability.forEach(availability => {
        // Convert Firestore timestamps to dayjs objects and handle timezone conversion
        const processedAvailability_item = {
          ...availability,
          date: availability.date?.toDate ? availability.date.toDate() : availability.date,
          startTime: availability.startTime?.toDate ? availability.startTime.toDate() : availability.startTime,
          endTime: availability.endTime?.toDate ? availability.endTime.toDate() : availability.endTime,
          startDate: availability.startDate?.toDate ? availability.startDate.toDate() : availability.startDate
        };
        
        // Convert UTC times back to Libya time for proper filtering
        // Since we store times in UTC by subtracting 2 hours, we need to add them back
        const convertUtcToLibya = (utcTime) => {
          if (!utcTime) return null;
          return dayjs(utcTime).add(2, 'hour'); // Convert UTC back to Libya time
        };
        
        if (processedAvailability_item.isPattern) {
          // Handle recurring patterns
          if (processedAvailability_item.patternType === 'weekly') {
            // Generate slots for each week day in the pattern
            const patternStartDate = processedAvailability_item.startDate ? dayjs(processedAvailability_item.startDate) : dayjs(startDate);
            
            // Generate slots for each day in the date range
            for (let i = 0; i < daysToGenerate; i++) {
              const currentDate = dayjs(startDate).add(i, 'day');
              
              // Check if this day is in the pattern's days of week
              if (processedAvailability_item.daysOfWeek.includes(currentDate.day())) {
                // Create a slot for this day based on the pattern
                const slotDate = currentDate;
                const slotStartTime = convertUtcToLibya(processedAvailability_item.startTime);
                
                if (slotStartTime) {
                  // Create a new slot with the specific date
                  const newSlot = {
                    ...processedAvailability_item,
                    id: `${processedAvailability_item.id}-instance-${currentDate.format('YYYY-MM-DD')}`,
                    date: slotDate.toDate(),
                    startTime: slotDate.set('hour', slotStartTime.hour()).set('minute', slotStartTime.minute()).toDate(),
                    endTime: slotDate.set('hour', convertUtcToLibya(processedAvailability_item.endTime).hour()).set('minute', convertUtcToLibya(processedAvailability_item.endTime).minute()).toDate(),
                    isPatternInstance: true,
                    patternId: processedAvailability_item.id,
                    isRecurring: true
                  };
                  
                  // Filter future slots using Libya time
                  const slotTimeLibya = dayjs(newSlot.startTime).add(2, 'hour');
                  if (slotTimeLibya.isAfter(nowLibya)) {
                    processedAvailability.push(newSlot);
                  }
                }
              }
            }
          }
        } else {
          // For non-pattern slots, include if they fall within the date range and are in the future
          const slotDate = dayjs(processedAvailability_item.date);
          const slotStartTimeUtc = processedAvailability_item.startTime ? dayjs(processedAvailability_item.startTime) : slotDate;
          const slotStartTimeLibya = convertUtcToLibya(slotStartTimeUtc);
          
          if (slotStartTimeLibya) {
            // Include slots that:
            // 1. Are within the requested date range
            // 2. Have start time in the future (including today's future slots) in Libya time
            const isWithinDateRange = (slotDate.isSame(dayjs(startDate), 'day') || slotDate.isAfter(dayjs(startDate), 'day')) && 
                                     (slotDate.isSame(dayjs(endDate), 'day') || slotDate.isBefore(dayjs(endDate), 'day'));
            const isFutureSlot = slotStartTimeLibya.isAfter(nowLibya);
            
            console.log(`🔍 [AVAILABILITY] Slot analysis for instructor ${instructorId}:`, {
              slotDate: slotDate.format('YYYY-MM-DD'),
              slotStartTimeUtc: slotStartTimeUtc.format('YYYY-MM-DD HH:mm'),
              slotStartTimeLibya: slotStartTimeLibya.format('YYYY-MM-DD HH:mm'),
              nowLibya: nowLibya.format('YYYY-MM-DD HH:mm'),
              startDate: dayjs(startDate).format('YYYY-MM-DD'),
              endDate: dayjs(endDate).format('YYYY-MM-DD'),
              isWithinDateRange,
              isFutureSlot,
              willInclude: isWithinDateRange && isFutureSlot
            });
            
            if (isWithinDateRange && isFutureSlot) {
              console.log(`✅ [AVAILABILITY] Including slot for instructor ${instructorId}:`, {
                slotDate: slotDate.format('YYYY-MM-DD'),
                slotStartTimeUtc: slotStartTimeUtc.format('YYYY-MM-DD HH:mm'),
                slotStartTimeLibya: slotStartTimeLibya.format('YYYY-MM-DD HH:mm'),
                nowLibya: nowLibya.format('YYYY-MM-DD HH:mm'),
                isWithinDateRange,
                isFutureSlot
              });
              processedAvailability.push(processedAvailability_item);
            } else {
              console.log(`❌ [AVAILABILITY] Excluding slot for instructor ${instructorId}:`, {
                slotDate: slotDate.format('YYYY-MM-DD'),
                slotStartTimeUtc: slotStartTimeUtc.format('YYYY-MM-DD HH:mm'),
                slotStartTimeLibya: slotStartTimeLibya.format('YYYY-MM-DD HH:mm'),
                nowLibya: nowLibya.format('YYYY-MM-DD HH:mm'),
                isWithinDateRange,
                isFutureSlot,
                reason: !isWithinDateRange ? 'outside date range' : 'not future slot'
              });
            }
          }
        }
      });
      
      // Sort by date and start time
      const sortedAvailability = processedAvailability.sort((a, b) => {
        if (dayjs(a.date).isBefore(dayjs(b.date))) {
          return -1;
        }
        if (dayjs(a.date).isAfter(dayjs(b.date))) {
          return 1;
        }
        if (dayjs(a.startTime).isBefore(dayjs(b.startTime))) {
          return -1;
        }
        return 1;
      });
      
      console.log(`✅ [AVAILABILITY] Returning ${sortedAvailability.length} processed availability slots for instructor ${instructorId}`);
      
      if (sortedAvailability.length > 0) {
        console.log(`📊 [AVAILABILITY] Sample processed slot:`, {
          id: sortedAvailability[0].id,
          date: dayjs(sortedAvailability[0].date).format('YYYY-MM-DD'),
          startTime: dayjs(sortedAvailability[0].startTime).format('YYYY-MM-DD HH:mm'),
          endTime: dayjs(sortedAvailability[0].endTime).format('YYYY-MM-DD HH:mm'),
          isPattern: sortedAvailability[0].isPattern,
          isPatternInstance: sortedAvailability[0].isPatternInstance
        });
      }
      
      return sortedAvailability;
    } catch (error) {
      console.error(`❌ [AVAILABILITY] Error fetching availability for instructor ${instructorId}:`, {
        error: error.message,
        stack: error.stack,
        instructorId,
        startDate: dayjs(startDate).format('YYYY-MM-DD HH:mm'),
        endDate: dayjs(endDate).format('YYYY-MM-DD HH:mm')
      });
      throw error;
    }
  },

  /**
   * Get availability for date range
   * @param {Date} startDate Start date
   * @param {Date} endDate End date
   * @returns {Promise<Array>} List of availability slots
   */
  getForDateRange: async (startDate, endDate) => {
    try {
      const q = query(
        collection(db, AVAILABILITY_COLLECTION),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date'),
        orderBy('startTime')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  },

  /**
   * Create availability slot
   * @param {Object} availability Availability data
   * @returns {Promise<string>} Created availability ID
   */
  create: async (availability) => {
    try {
      console.log(`🆕 [AVAILABILITY] Creating new availability slot:`, availability);
      
      // Validate required fields
      if (!availability.instructorId) {
        throw new Error('instructorId is required');
      }
      if (!availability.date) {
        throw new Error('date is required');
      }
      if (!availability.startTime) {
        throw new Error('startTime is required');
      }
      if (!availability.endTime) {
        throw new Error('endTime is required');
      }
      
      // Create a copy to avoid mutating the original object
      const availabilityToSave = { ...availability };
      
      // Convert dayjs objects to Date objects if needed
      if (availabilityToSave.date && typeof availabilityToSave.date.toDate === 'function') {
        availabilityToSave.date = availabilityToSave.date.toDate();
      } else if (availabilityToSave.date && typeof availabilityToSave.date.format === 'function') {
        // It's a dayjs object
        availabilityToSave.date = availabilityToSave.date.toDate();
      }
      
      if (availabilityToSave.startTime && typeof availabilityToSave.startTime.toDate === 'function') {
        availabilityToSave.startTime = availabilityToSave.startTime.toDate();
      } else if (availabilityToSave.startTime && typeof availabilityToSave.startTime.format === 'function') {
        // It's a dayjs object
        availabilityToSave.startTime = availabilityToSave.startTime.toDate();
      }
      
      if (availabilityToSave.endTime && typeof availabilityToSave.endTime.toDate === 'function') {
        availabilityToSave.endTime = availabilityToSave.endTime.toDate();
      } else if (availabilityToSave.endTime && typeof availabilityToSave.endTime.format === 'function') {
        // It's a dayjs object
        availabilityToSave.endTime = availabilityToSave.endTime.toDate();
      }
      
      if (availabilityToSave.startDate && typeof availabilityToSave.startDate.toDate === 'function') {
        availabilityToSave.startDate = availabilityToSave.startDate.toDate();
      } else if (availabilityToSave.startDate && typeof availabilityToSave.startDate.format === 'function') {
        // It's a dayjs object
        availabilityToSave.startDate = availabilityToSave.startDate.toDate();
      }
      
      console.log(`🔄 [AVAILABILITY] After date conversion:`, {
        date: availabilityToSave.date,
        startTime: availabilityToSave.startTime,
        endTime: availabilityToSave.endTime,
        startDate: availabilityToSave.startDate
      });
      
      // Handle timezone conversion for Libya (UTC+2) - store as UTC
      if (availabilityToSave.timeZone === 'Africa/Tripoli') {
        console.log(`🌍 [AVAILABILITY] Converting Libya timezone to UTC...`);
        const offset = 2 * 60; // 2 hours in minutes
        
        if (availabilityToSave.date) {
          availabilityToSave.date = dayjs(availabilityToSave.date).subtract(offset, 'minute').toDate();
        }
        
        if (availabilityToSave.startTime) {
          availabilityToSave.startTime = dayjs(availabilityToSave.startTime).subtract(offset, 'minute').toDate();
        }
        
        if (availabilityToSave.endTime) {
          availabilityToSave.endTime = dayjs(availabilityToSave.endTime).subtract(offset, 'minute').toDate();
        }
        
        if (availabilityToSave.startDate) {
          availabilityToSave.startDate = dayjs(availabilityToSave.startDate).subtract(offset, 'minute').toDate();
        }
        
        console.log(`🔄 [AVAILABILITY] After timezone conversion to UTC:`, {
          date: availabilityToSave.date,
          startTime: availabilityToSave.startTime,
          endTime: availabilityToSave.endTime,
          startDate: availabilityToSave.startDate
        });
      }
      
      const dataToSave = {
        ...availabilityToSave,
        createdAt: new Date()
      };
      
      console.log(`💾 [AVAILABILITY] Final data to save:`, dataToSave);
      console.log(`📂 [AVAILABILITY] Saving to collection: ${AVAILABILITY_COLLECTION}`);
      
      const docRef = await addDoc(collection(db, AVAILABILITY_COLLECTION), dataToSave);
      
      console.log(`✅ [AVAILABILITY] Successfully created availability with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`❌ [AVAILABILITY] Error creating availability:`, {
        error: error.message,
        stack: error.stack,
        availability: availability
      });
      throw error;
    }
  },

  /**
   * Update availability slot
   * @param {string} id Availability ID
   * @param {Object} updates Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, updates) => {
    try {
      const docRef = doc(db, AVAILABILITY_COLLECTION, id);
      
      // Handle timezone conversion for Libya (UTC+2)
      if (updates.timeZone === 'Africa/Tripoli') {
        // Convert local time to UTC by subtracting 2 hours
        if (updates.date) {
          const utcDate = new Date(updates.date);
          utcDate.setHours(utcDate.getHours() - 2);
          updates.date = utcDate;
        }
        
        if (updates.startTime) {
          const utcStartTime = new Date(updates.startTime);
          utcStartTime.setHours(utcStartTime.getHours() - 2);
          updates.startTime = utcStartTime;
        }
        
        if (updates.endTime) {
          const utcEndTime = new Date(updates.endTime);
          utcEndTime.setHours(utcEndTime.getHours() - 2);
          updates.endTime = utcEndTime;
        }
      }
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error updating availability ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete availability slot
   * @param {string} id Availability ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const docRef = doc(db, AVAILABILITY_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting availability ${id}:`, error);
      throw error;
    }
  }
};

// Booking Service
export const bookingService = {
  /**
   * Get booking by ID
   * @param {string} id Booking ID
   * @returns {Promise<Object>} Booking data
   */
  getById: async (id) => {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Booking with ID ${id} not found`);
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get bookings for user
   * @param {string} userId User ID
   * @param {string} [status] Filter by booking status
   * @returns {Promise<Array>} List of bookings
   */
  getForUser: async (userId, status) => {
    try {
      let q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('userId', '==', userId)
      );
      
      if (status) {
        q = query(q, where('status', '==', status));
      }
      
      // Only add orderBy if we're not filtering by status to avoid composite index requirements
      if (!status) {
        q = query(q, orderBy('bookingDate', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort manually if we couldn't use orderBy due to composite index
      if (status) {
        bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      }
      
      return bookings;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get bookings for instructor
   * @param {string} instructorId Instructor ID
   * @param {string} [status] Filter by booking status
   * @returns {Promise<Array>} List of bookings
   */
  getForInstructor: async (instructorId, status) => {
    try {
      let q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('instructorId', '==', instructorId)
      );
      
      if (status) {
        q = query(q, where('status', '==', status));
      }
      
      // Only add orderBy if we're not filtering by status to avoid composite index requirements
      if (!status) {
        q = query(q, orderBy('bookingDate', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort manually if we couldn't use orderBy due to composite index
      if (status) {
        bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      }
      
      return bookings;
    } catch (error) {
      console.error(`Error fetching bookings for instructor ${instructorId}:`, error);
      throw error;
    }
  },

  /**
   * Get bookings for session
   * @param {string} sessionId Session ID
   * @returns {Promise<Array>} List of bookings
   */
  getForSession: async (sessionId) => {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('sessionId', '==', sessionId),
        orderBy('bookingDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching bookings for session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Create booking
   * @param {Object} booking Booking data
   * @returns {Promise<string>} Created booking ID
   */
  create: async (booking) => {
    try {
      const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
        ...booking,
        status: 'pending',
        bookingDate: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  /**
   * Update booking
   * @param {string} id Booking ID
   * @param {Object} updates Fields to update
   * @returns {Promise<void>}
   */
  update: async (id, updates) => {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete booking
   * @param {string} id Booking ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all bookings
   * @returns {Promise<Array>} List of all bookings
   */
  getAll: async () => {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        orderBy('bookingDate', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  }
};

// Notification Service
export const notificationService = {
  /**
   * Get notifications for user
   * @param {string} userId User ID
   * @param {string} [status] Filter by notification status
   * @param {string} [type] Filter by notification type
   * @returns {Promise<Array>} List of notifications
   */
  getForUser: async (userId, status, type) => {
    try {
      let q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );
      
      if (status) {
        q = query(q, where('status', '==', status));
      }
      
      if (type) {
        q = query(q, where('type', '==', type));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching notifications for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Create notification
   * @param {Object} notification Notification data
   * @returns {Promise<string>} Created notification ID
   */
  create: async (notification) => {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notification,
        status: 'pending',
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Update notification status
   * @param {string} id Notification ID
   * @param {string} status New status
   * @returns {Promise<void>}
   */
  updateStatus: async (id, status) => {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
      await updateDoc(docRef, {
        status,
        sentAt: status === 'sent' ? new Date() : null
      });
    } catch (error) {
      console.error(`Error updating notification ${id}:`, error);
      throw error;
    }
  }
};