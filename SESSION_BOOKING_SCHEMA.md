# Sudanglish Session Booking Feature - Database Schema Extensions

This document describes the non-breaking schema extensions made to support the private session booking feature in Sudanglish.

## 1. User Collection Extensions

Added optional fields for instructor role:

```javascript
{
  // ... existing user fields ...
  
  // Instructor-specific fields
  instructorProfile: {
    bio: string, // Instructor biography
    qualifications: string[], // Instructor qualifications
    hourlyRate: number, // Base hourly rate
    currency: string, // Currency code (e.g., USD, EUR)
    languages: string[], // Languages taught
    specialties: string[], // Teaching specialties
    rating: {
      average: number, // Average rating (0-5)
      count: number // Number of reviews
    }
  },
  
  // Availability management
  availability: {
    timeZone: string, // IANA time zone identifier (e.g., Africa/Tripoli)
    slots: [
      {
        day: string, // Day of week (e.g., Monday)
        startTime: timestamp, // Start time in UTC
        endTime: timestamp, // End time in UTC
        isRecurring: boolean // Weekly recurring availability
      }
    ]
  },
  
  // Session management
  sessions: {
    activeCount: number, // Number of active sessions
    completedCount: number, // Number of completed sessions
    cancelledCount: number // Number of cancelled sessions
  }
}
```

## 2. New Collections

### 2.1 sessionTypes

Admin-defined session types that instructors can select from:

```javascript
{
  name: string, // Session type name (e.g., Conversation Practice)
  duration: int, // Duration in minutes
  price: number, // Price per session
  currency: string, // Currency code
  description: string, // Description of the session type
  createdAt: timestamp, // Creation timestamp
  updatedAt: timestamp // Last update timestamp
}
```

### 2.2 sessions

Individual session instances managed by instructors:

```javascript
{
  instructorId: string, // Reference to instructor user
  userId: string, // Reference to student user (optional for scheduled sessions)
  sessionType: string, // Reference to session type
  date: timestamp, // Date of session
  startTime: timestamp, // Start time in UTC
  endTime: timestamp, // End time in UTC
  status: string, // (scheduled, completed, cancelled, missed)
  notes: string, // Session notes (instructor only)
  price: number, // Price for this session
  currency: string, // Currency code
  rating: {
    student: number, // Student's rating (0-5)
    instructor: number // Instructor's rating of student (0-5)
  }
}
```

### 2.3 availability

Instructor availability patterns:

```javascript
{
  instructorId: string, // Reference to instructor user
  date: timestamp, // Date of availability (for non-recurring)
  startTime: timestamp, // Start time in UTC
  endTime: timestamp, // End time in UTC
  isRecurring: boolean, // Weekly recurring availability
  timeZone: string // IANA time zone identifier
}
```

### 2.4 bookings

Student session bookings:

```javascript
{
  userId: string, // Reference to student user
  sessionId: string, // Reference to session
  status: string, // (pending, confirmed, cancelled, completed)
  bookingDate: timestamp, // Date the booking was made
  phoneNumber: string, // Student's phone number for WhatsApp
  notes: string, // Student notes for instructor
  paymentStatus: string, // (pending, paid, refunded)
  paymentId: string // Reference to payment if applicable
}
```

### 2.5 notifications

Admin notification queue for manual WhatsApp messages:

```javascript
{
  userId: string, // Reference to user (student or instructor)
  type: string, // (booking_confirmation, reminder, etc.)
  message: string, // Message content
  status: string, // (pending, sent, failed)
  priority: string, // (low, medium, high)
  createdAt: timestamp, // Creation timestamp
  sentAt: timestamp // When message was sent
}
```

## 3. Indexes

Added indexes in firestore.indexes.json:

- bookings: userId + status + sessionDate
- availability: instructorId + date + startTime
- sessions: instructorId + sessionType
- notifications: userId + status + type

## 4. Security Rules

Security rules implemented in firestore.rules:

- User collection: Allow instructors to update session-related fields
- sessionTypes: Read by all, create/update/delete by admin/instructor
- sessions: Read by all, create/update/delete by owner instructor
- availability: Read by all, create/update/delete by owner instructor
- bookings: Read by admin/instructor/owning student, create by student
- notifications: Read by admin/related user, create/update by admin