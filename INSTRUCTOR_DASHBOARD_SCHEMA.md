# Instructor Dashboard Data Structure & Schema Documentation

## Overview
This document details the data structures, schemas, and current state of the instructor dashboard, outlining the planned improvements for mobile responsiveness and session management integration.

## Current State Analysis

### 1. Current Instructor Dashboard Structure
**File**: `src/components/sessions/instructor/InstructorDashboard.jsx`

#### Current Features:
- Basic session statistics display
- Tab-based navigation (Upcoming, Today, Completed, Cancelled)
- Session type management integration
- Basic mobile responsiveness
- Translation support (partially implemented)

#### Current Issues:
- Limited mobile responsiveness 
- Missing integration with admin session form
- Incomplete translation coverage
- Authentication timeout issues
- Mixed data loading patterns

### 2. Admin Session Dashboard (Reference)
**File**: `src/components/sessions/admin/AdminSessionDashboard.jsx`

#### Features to Integrate:
- Comprehensive session form with bilingual support
- Advanced filtering and search
- Session type management
- Mobile-responsive design
- Complete translation support

## Data Schemas

### 1. Session Types Schema
```javascript
{
  id: string,                    // Unique identifier
  name: {                       // Bilingual support
    en: string,                 // English name
    ar: string                  // Arabic name
  },
  description: {                // Bilingual descriptions
    en: string,
    ar: string
  },
  duration: number,             // Duration in minutes
  price: number,                // Session price
  currency: string,             // Currency code (LYD)
  active: boolean,              // Active/inactive status
  createdBy: string,            // Creator user ID
  createdAt: timestamp,         // Creation date
  updatedAt: timestamp,         // Last update
  instructorId?: string         // For instructor-specific types
}
```

### 2. Sessions Schema
```javascript
{
  id: string,                   // Unique identifier
  instructorId: string,         // Instructor user ID
  sessionTypeId: string,        // Reference to sessionTypes
  sessionType: object,          // Populated session type data
  title: {                      // Bilingual session title
    en: string,
    ar: string
  },
  description: {                // Bilingual description
    en: string,
    ar: string
  },
  date: timestamp,              // Session date
  startTime: timestamp,         // Start time (UTC)
  endTime: timestamp,           // End time (UTC)
  timeZone: string,             // "Africa/Tripoli"
  status: string,               // scheduled|completed|cancelled|missed
  maxStudents: number,          // Maximum enrolled students
  enrolledStudents: string[],   // Array of student IDs
  bookings: Booking[],          // Array of booking objects
  price: number,                // Session price
  currency: string,             // Currency (LYD)
  notes: string,                // Instructor notes
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. Bookings Schema
```javascript
{
  id: string,                   // Unique identifier
  userId: string,               // Student user ID
  sessionId: string,            // Reference to session
  instructorId: string,         // Reference to instructor
  status: string,               // pending|confirmed|cancelled|completed
  bookingDate: timestamp,       // When booking was made
  scheduledDate: timestamp,     // When session is scheduled
  phoneNumber: string,          // Student WhatsApp number
  notes: string,                // Student notes
  paymentStatus: string,        // pending|paid|refunded
  paymentId?: string,           // Payment reference
  price: number,                // Booking price
  currency: string,             // Currency
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. Dashboard Statistics Schema
```javascript
{
  totalSessions: number,        // Total sessions created
  upcomingSessions: number,     // Scheduled future sessions
  completedSessions: number,    // Completed sessions
  cancelledSessions: number,    // Cancelled sessions
  activeSessionTypes: number,   // Active session types count
  totalEarnings: number,        // Total earnings (completed)
  thisWeekEarnings: number,     // This week's earnings
  thisMonthEarnings: number,    // This month's earnings
  averageRating: number,        // Average session rating
  studentCount: number,         // Total unique students
  responseTime: number          // Average response time (hours)
}
```

## User Roles and Permissions

### 1. Admin Users
- Can see all sessions from all instructors
- Can manage all session types (create, edit, delete)
- Can view comprehensive analytics
- Can manage instructor permissions
- Can access dispute resolution

### 2. Instructor Users
- Can see only their own sessions
- Can create and manage their own session types
- Can view their own analytics and earnings
- Can manage their availability
- Can cancel their sessions with reason

### 3. Student Users (Referenced)
- Can book sessions
- Can view their booking history
- Can rate completed sessions
- Can cancel bookings (with restrictions)

## Translation Keys Structure

### Current Translation Structure
```javascript
{
  "sessions": {
    "dashboard": {
      "title": "Session Dashboard",
      "subtitle": "Manage your teaching sessions",
      "totalSessions": "Total Sessions",
      "upcomingSessions": "Upcoming Sessions", 
      "completedSessions": "Completed Sessions",
      "thisWeekEarnings": "This Week Earnings",
      "noSessions": "No sessions found",
      "loading": "Loading sessions...",
      "error": "Error loading sessions"
    },
    "form": {
      "addSession": "Add New Session",
      "editSession": "Edit Session",
      "sessionType": "Session Type",
      "title": "Session Title",
      "description": "Description",
      "date": "Date",
      "startTime": "Start Time",
      "endTime": "End Time",
      "maxStudents": "Maximum Students",
      "price": "Price",
      "save": "Save Session",
      "cancel": "Cancel"
    }
  }
}
```

## Mobile Responsiveness Requirements

### 1. Breakpoints
- Mobile: `xs` (0-599px)
- Tablet: `sm` (600-959px) 
- Desktop: `md+` (960px+)

### 2. Mobile Layout Adaptations
- Stack cards vertically on mobile
- Use smaller typography scales
- Implement slide-out navigation for tabs
- Touch-friendly button sizes (min 44px)
- Simplified forms with collapsible sections

### 3. Responsive Components
- Grid system: 12 columns desktop → 1-2 columns mobile
- Typography: Responsive font scales
- Spacing: Reduced margins/padding on mobile
- Navigation: Bottom tabs or hamburger menu

## Service Layer Architecture

### 1. Session Service (`sessionService.js`)
```javascript
{
  // Core CRUD operations
  getAll(): Promise<Session[]>,
  getByInstructor(instructorId): Promise<Session[]>,
  getById(id): Promise<Session>,
  create(sessionData): Promise<string>,
  update(id, updates): Promise<void>,
  delete(id): Promise<void>,
  
  // Status management
  cancelSession(id, reason): Promise<void>,
  completeSession(id): Promise<void>,
  
  // Filtering and search
  getByStatus(status): Promise<Session[]>,
  getByDateRange(start, end): Promise<Session[]>,
  searchSessions(query): Promise<Session[]>
}
```

### 2. Session Type Service (`sessionTypeService.js`)
```javascript
{
  getAll(user): Promise<SessionType[]>,
  getPublicActive(): Promise<SessionType[]>,
  getByInstructor(instructorId): Promise<SessionType[]>,
  getById(id): Promise<SessionType>,
  create(sessionType, userId): Promise<string>,
  update(id, updates): Promise<void>,
  delete(id): Promise<void>,
  toggleActive(id): Promise<void>
}
```

### 3. Booking Service (`bookingService.js`)
```javascript
{
  getAll(): Promise<Booking[]>,
  getForInstructor(instructorId): Promise<Booking[]>,
  getForUser(userId): Promise<Booking[]>,
  getForSession(sessionId): Promise<Booking[]>,
  create(bookingData): Promise<string>,
  update(id, updates): Promise<void>,
  cancel(id, reason): Promise<void>
}
```

## Integration Points

### 1. Admin Session Form Integration
- Location: `src/components/sessions/admin/`
- Components to integrate:
  - Session creation form with bilingual support
  - Session type management interface
  - Advanced filtering and search
  - Mobile-responsive design patterns

### 2. Authentication Integration
- Use `AuthContext` for user state management
- Implement proper loading states
- Handle authentication timeouts gracefully
- Support role-based access control

### 3. Translation Integration
- Use `react-i18next` for all text
- Support RTL layout for Arabic
- Implement language-specific date formatting
- Ensure form validation messages are translated

## Performance Considerations

### 1. Data Loading Strategies
- Implement pagination for large session lists
- Use React Query for caching and synchronization
- Load dashboard statistics separately from session list
- Implement incremental loading for mobile

### 2. Mobile Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Lazy load non-critical components
- Optimize bundle size for mobile networks

### 3. Real-time Updates
- Use Firestore real-time listeners for session updates
- Implement optimistic UI updates
- Handle offline scenarios gracefully
- Synchronize data when connection restored

## Error Handling Strategy

### 1. User-Facing Errors
- Display localized error messages
- Provide retry mechanisms
- Show fallback UI when data fails to load
- Guide users to resolve common issues

### 2. System Errors
- Log errors to centralized service
- Implement error boundaries for component crashes
- Graceful degradation of features
- Automatic error reporting for debugging

This documentation provides the foundation for implementing the improved instructor dashboard with proper mobile responsiveness and session management integration.