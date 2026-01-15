# Student Attendance & Lesson Completion System

## Overview
Implement an attendance tracking system where instructors can mark student attendance for each lesson. When a student is marked present, that lesson is automatically marked as complete for them.

## Data Structure

### 1. Firestore Collections

#### `attendance` collection
```javascript
{
  id: "auto-generated",
  courseId: "course_id",
  lessonId: "lesson_id",
  studentId: "user_id",
  instructorId: "user_id",
  status: "present" | "absent" | "late",
  markedAt: timestamp,
  notes: "optional instructor notes"
}
```

#### Update `enrollments` collection
```javascript
{
  // ... existing fields
  completedLessons: {
    "lesson_id_1": {
      completedAt: timestamp,
      attendanceId: "attendance_record_id"
    },
    "lesson_id_2": { ... }
  },
  progress: {
    totalLessons: number,
    completedLessons: number,
    percentage: number
  }
}
```

## Features to Implement

### 1. Instructor Dashboard - Attendance View
**Location**: `/instructor/course/:courseId/attendance`

**Components**:
- Course attendance overview page
- List of all lessons with attendance status
- Per-lesson attendance sheet

**Features**:
- View all enrolled students for the course
- Select a specific lesson to mark attendance
- Bulk attendance marking (select all present/absent)
- Search/filter students
- View attendance history per lesson
- Export attendance reports

### 2. Lesson Attendance Sheet
**Location**: `/instructor/course/:courseId/lesson/:lessonId/attendance`

**UI Elements**:
- Lesson title and date
- Student list with checkboxes/toggle
- Status buttons: Present / Absent / Late
- Notes field per student
- Save button
- Attendance statistics (X/Y students present)

**Actions**:
- Mark individual student attendance
- Bulk mark all as present/absent
- Add notes for specific students
- View previous attendance records
- Auto-complete lesson for students marked present

### 3. Student Course View Updates
**Location**: `/student/course/:courseId`

**Updates**:
- Show completed lessons with checkmark/badge
- Display completion percentage
- Show completion date on lesson items
- Lock/unlock lessons based on prerequisites (optional)

### 4. Firestore Security Rules
```javascript
// attendance collection
match /attendance/{attendanceId} {
  // Instructors can read all attendance for their courses
  allow read: if request.auth != null && 
    get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId == request.auth.uid;
  
  // Only instructors can create/update attendance
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/courses/$(request.resource.data.courseId)).data.instructorId == request.auth.uid;
}

// enrollments - update read rules
match /enrollments/{enrollmentId} {
  allow read: if request.auth != null && 
    (resource.data.studentId == request.auth.uid || 
     get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId == request.auth.uid);
  
  // Students can't modify completedLessons directly
  allow update: if request.auth != null && 
    resource.data.studentId == request.auth.uid &&
    !request.resource.data.diff(resource.data).affectedKeys().hasAny(['completedLessons']);
}
```

## Implementation Steps

### Phase 1: Data Layer
1. Create Firestore indexes for queries
2. Update security rules
3. Create attendance Redux slice
4. Add attendance API functions

### Phase 2: Instructor UI
1. Create AttendanceSheet component
2. Create LessonAttendanceView page
3. Add attendance route to instructor dashboard
4. Implement attendance marking logic
5. Add attendance stats/overview

### Phase 3: Completion Logic
1. Update enrollment document when attendance is marked
2. Calculate and update progress percentage
3. Sync completed lessons with student view

### Phase 4: Student UI
1. Update CourseContentView to show completed lessons
2. Add completion badges/indicators
3. Show progress bar
4. Display completion dates

### Phase 5: Additional Features
1. Attendance history view
2. Export attendance to CSV/Excel
3. Attendance analytics (attendance rate per student)
4. Notifications for completed lessons
5. Bulk operations (mark entire class present)

## File Structure
```
src/
├── components/
│   └── instructor/
│       ├── AttendanceSheet.jsx          # Main attendance marking component
│       ├── AttendanceStudentRow.jsx     # Individual student row
│       ├── AttendanceStats.jsx          # Statistics display
│       └── AttendanceLessonList.jsx     # List of lessons with attendance
├── pages/
│   ├── instructor/
│   │   ├── CourseAttendance.jsx         # Course attendance overview
│   │   └── LessonAttendance.jsx         # Per-lesson attendance
│   └── student/
│       └── CourseContentView.jsx        # Update to show completion
├── store/
│   └── slices/
│       └── attendanceSlice.js           # Redux state for attendance
└── services/
    └── attendanceService.js             # Firestore attendance operations
```

## API Functions Needed

### attendanceService.js
```javascript
// Mark attendance for a student
markAttendance(courseId, lessonId, studentId, status, notes)

// Get attendance for a lesson
getLessonAttendance(courseId, lessonId)

// Get attendance for a student across all lessons
getStudentAttendance(courseId, studentId)

// Get all attendance records for a course
getCourseAttendance(courseId)

// Update attendance record
updateAttendance(attendanceId, updates)

// Complete lesson for student (updates enrollment)
completeLessonForStudent(enrollmentId, lessonId, attendanceId)

// Get student progress
getStudentProgress(enrollmentId)
```

## UI/UX Considerations
- Clean, minimal table layout for attendance sheet
- Quick toggle buttons for marking attendance
- Confirmation dialog before bulk operations
- Success/error notifications
- Loading states during save
- Optimistic UI updates
- Keyboard shortcuts for faster marking

## Success Criteria
1. Instructor can view all enrolled students for a course
2. Instructor can mark attendance per lesson
3. Attendance automatically marks lesson as complete
4. Student sees completed lessons in their course view
5. Progress percentage updates automatically
6. Attendance data persists correctly in Firestore
7. Security rules prevent unauthorized access/modifications
