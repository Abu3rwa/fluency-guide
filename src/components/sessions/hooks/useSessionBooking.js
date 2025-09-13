import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import { getInstructors } from '../../../services/userService';
import { bookingService } from '../../../services/bookingService';
import { sessionTypeService } from '../../../services/sessionService';

/**
 * Custom hook for managing session booking functionality
 * Handles booking flow, validation, and form state management
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onBookingSuccess - Callback when booking succeeds
 * @param {Function} options.onBookingError - Callback when booking fails
 * @returns {Object} Booking state and handlers
 */
export const useSessionBooking = (options = {}) => {
  const { t } = useTranslation();
  const { currentUser: user } = useAuth();
  const { onBookingSuccess, onBookingError } = options;

  // Booking flow state
  const [step, setStep] = useState(1); // 1: Select Session, 2: Book Details
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Session data
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedSessionType, setSelectedSessionType] = useState(null);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day'));
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots] = useState([
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ]);
  
  // Guest information (for non-authenticated users)
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Form errors
  const [errors, setErrors] = useState({});
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Initialize guest info when user changes
  useEffect(() => {
    setGuestInfo({
      name: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || ''
    });
  }, [user]);

  // Load session types with instructor information
  const loadSessionTypes = async () => {
    try {
      setLoading(true);
      
      const [instructorsData, sessionTypesData] = await Promise.all([
        getInstructors(),
        sessionTypeService.getPublicActive()
      ]);
      
      // Process session types with instructor info
      const processedSessionTypes = [];
      
      sessionTypesData.forEach(sessionType => {
        const instructor = instructorsData.find(inst => 
          inst.id === sessionType.instructorId || inst.id === sessionType.createdBy
        );
        
        if (instructor && sessionType.active) {
          processedSessionTypes.push({
            ...sessionType,
            instructorId: instructor.id,
            instructorName: instructor.displayName,
            instructorAvatar: instructor.photoURL,
            instructorRating: instructor.instructorProfile?.rating?.average || 0
          });
        }
      });
      
      setSessionTypes(processedSessionTypes);
    } catch (error) {
      console.error('Error loading session types:', error);
      if (onBookingError) {
        onBookingError(t('sessions.booking.messages.errorLoadingData', 'Failed to load session data'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle session type selection
  const handleSessionSelect = (sessionType) => {
    setSelectedSessionType(sessionType);
    setStep(2);
    setErrors({}); // Clear any previous errors
  };

  // Handle guest info updates
  const handleGuestInfoChange = (field, value) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate booking form
  const validateBookingForm = () => {
    const newErrors = {};
    
    // Validate date and time selection
    if (!selectedDate || !selectedTime) {
      newErrors.dateTime = t('sessions.booking.validation.dateTimeRequired', 'Please select date and time');
    }
    
    // Validate date is in the future
    if (selectedDate && selectedDate.isBefore(dayjs(), 'day')) {
      newErrors.dateTime = t('sessions.booking.validation.pastDate', 'Please select a future date');
    }
    
    // Validate contact information for guests
    if (!user) {
      if (!guestInfo.name.trim()) {
        newErrors.name = t('sessions.booking.validation.nameRequired', 'Name is required');
      }
      if (!guestInfo.email.trim()) {
        newErrors.email = t('sessions.booking.validation.emailRequired', 'Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
        newErrors.email = t('sessions.booking.validation.emailInvalid', 'Please enter a valid email');
      }
    }
    
    // Phone validation (always required)
    if (!guestInfo.phone.trim()) {
      newErrors.phone = t('sessions.booking.validation.phoneRequired', 'Phone number is required');
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(guestInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('sessions.booking.validation.phoneInvalid', 'Please enter a valid phone number');
    }

    // Validate terms agreement
    if (!termsAgreed) {
      newErrors.terms = t('sessions.booking.validation.termsRequired', 'You must agree to the terms and conditions');
    }
    
    return newErrors;
  };

  // Submit booking
  const submitBooking = async () => {
    const validationErrors = validateBookingForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return { success: false, errors: validationErrors };
    }
    
    try {
      setSubmitting(true);
      
      const bookingData = {
        userId: user?.uid || null,
        instructorId: selectedSessionType.instructorId,
        sessionTypeId: selectedSessionType.id,
        date: selectedDate.format('YYYY-MM-DD'),
        time: selectedTime,
        guestName: guestInfo.name || user?.displayName,
        guestEmail: guestInfo.email || user?.email,
        phoneNumber: guestInfo.phone,
        price: selectedSessionType.price,
        currency: selectedSessionType.currency,
        status: 'pending'
      };
      
      await bookingService.create(bookingData);
      
      const bookingDetails = {
        sessionType: selectedSessionType,
        date: selectedDate.format('YYYY-MM-DD'),
        time: selectedTime,
        ...bookingData
      };
      
      if (onBookingSuccess) {
        onBookingSuccess(bookingDetails);
      }
      
      // Reset form after successful booking
      resetBookingForm();
      
      return { success: true, data: bookingDetails };
    } catch (error) {
      console.error('Error submitting booking:', error);
      const errorMessage = t('sessions.booking.messages.errorSubmitting', 'Error submitting booking');
      setErrors({ submit: errorMessage });
      
      if (onBookingError) {
        onBookingError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  // Reset booking form
  const resetBookingForm = () => {
    setStep(1);
    setSelectedSessionType(null);
    setSelectedDate(dayjs().add(1, 'day'));
    setSelectedTime(null);
    setErrors({});
    setGuestInfo({
      name: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || ''
    });
    setTermsAgreed(false);
  };

  // Initialize booking with pre-selected session type
  const initializeWithSessionType = (sessionType) => {
    if (sessionType) {
      setSelectedSessionType(sessionType);
      setStep(2); // Skip to booking details
    } else {
      resetBookingForm();
    }
  };

  // Go back to previous step
  const goBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  return {
    // State
    step,
    loading,
    submitting,
    sessionTypes,
    selectedSessionType,
    selectedDate,
    selectedTime,
    availableSlots,
    guestInfo,
    errors,
    termsAgreed,
    setTermsAgreed,
    
    // Actions
    loadSessionTypes,
    handleSessionSelect,
    handleGuestInfoChange,
    setSelectedDate,
    setSelectedTime,
    submitBooking,
    resetBookingForm,
    initializeWithSessionType,
    goBackStep,
    validateBookingForm
  };
};

export default useSessionBooking;