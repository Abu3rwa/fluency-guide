# User Model

## Overview

Represents a user/student/teacher in the app, including profile, progress, and preferences.

## Fields

| Field Name         | Type      | Description / Notes                        |
| ------------------ | --------- | ------------------------------------------ |
| uid                | string    | Unique user ID                             |
| email              | string    | User’s email address                       |
| displayName        | string    | User’s display name                        |
| name               | string    | Full name                                  |
| photoURL           | string    | Profile image URL                          |
| profileImage       | string    | Alternate profile image URL                |
| isAdmin            | boolean   | Whether the user is an admin               |
| isStudent          | boolean   | Whether the user is a student              |
| emailVerified      | boolean   | Email verification status                  |
| bio                | string    | Short bio                                  |
| phoneNumber        | string    | Phone number (nullable)                    |
| createdAt          | timestamp | Account creation date                      |
| updatedAt          | timestamp | Last update date                           |
| lastLogin          | timestamp | Last login date                            |
| lastStudyDate      | timestamp | Last study session date                    |
| lastActiveCourse   | string    | Last active course ID                      |
| enrolledCourses    | array     | List of enrolled course IDs                |
| completedLessons   | array     | List of completed lesson IDs               |
| pendingEnrollments | array     | List of pending course IDs                 |
| achievements       | array     | List of achievement objects or IDs         |
| preferences        | object    | User preferences (e.g., preferredLanguage) |
| progress           | object    | Progress map (see progress model)          |
| ...                | ...       | ...                                        |

## Relationships

- References to courses, lessons, achievements, and preferences.

## Usage in React

- Used for authentication, profile display, dashboard, and progress tracking.
- Fetched via context or service, displayed in profile/dashboard components.

## Example Object

```json
{
  "uid": "a3mvtyHHrSX4e2PiEpNG9w031vJ3",
  "email": "3bdulhafeez.sd@gmail.com",
  "displayName": "Abdulhafeez Ismael",
  "photoURL": "https://...",
  "isAdmin": true,
  "isStudent": false,
  "emailVerified": true,
  "bio": "",
  "createdAt": "2025-06-16T20:17:09Z",
  "lastLogin": "2025-07-22T22:08:44Z",
  "enrolledCourses": ["M0x4zx95Ij47OcUJtv9D"],
  "completedLessons": [],
  "achievements": [],
  "preferences": { "preferredLanguage": "en" },
  "progress": { "currentStreak": 34, "totalPoints": 50 }
}
```

## UI/UX Notes

- Show avatar, name, and email in header.
- Show badges for admin/student/verified.
- Editable fields: name, bio, profile image, preferences.
