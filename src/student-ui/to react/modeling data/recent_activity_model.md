# Recent Activity Model

## Overview

Represents a recent activity or event performed by a user, such as lesson completion or quiz attempt.

## Fields

| Field Name   | Type      | Description / Notes                  |
| ------------ | --------- | ------------------------------------ |
| id           | string    | Unique activity ID                   |
| userId       | string    | User who performed the activity      |
| title        | string    | Activity title                       |
| status       | string    | Status (e.g., completed, inProgress) |
| progress     | number    | Progress value (0.0 - 1.0)           |
| lastAccessed | timestamp | Last accessed date                   |
| completedAt  | timestamp | Completion date (if completed)       |
| score        | number    | Score (if applicable)                |
| lessonId     | string    | Associated lesson ID                 |
| courseId     | string    | Associated course ID                 |
| ...          | ...       | ...                                  |

## Relationships

- References user, lesson, and course.

## Usage in React

- Displayed in recent activity feeds, dashboards, and progress tracking.

## Example Object

```json
{
  "id": "act1",
  "userId": "user1",
  "title": "Completed Lesson 1",
  "status": "completed",
  "progress": 1.0,
  "completedAt": "2025-06-16T20:17:09Z",
  "lessonId": "lesson1",
  "courseId": "M0x4zx95Ij47OcUJtv9D"
}
```

## UI/UX Notes

- Show activity title, status, and date.
- Use icons or badges for activity types.
