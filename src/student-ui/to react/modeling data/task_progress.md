# Task Progress Model

## Overview

Represents a user's progress on a specific task, including attempts and scores.

## Fields

| Field Name  | Type      | Description / Notes                  |
| ----------- | --------- | ------------------------------------ |
| id          | string    | Unique progress ID                   |
| userId      | string    | User who is progressing              |
| taskId      | string    | Associated task ID                   |
| attempts    | number    | Number of attempts                   |
| bestScore   | number    | Highest score achieved               |
| isPassed    | boolean   | Whether the user has passed the task |
| lastAttempt | timestamp | Date of last attempt                 |
| ...         | ...       | ...                                  |

## Relationships

- References user and task.

## Usage in React

- Displayed in task progress tracking and analytics.

## Example Object

```json
{
  "id": "tp1",
  "userId": "user1",
  "taskId": "task1",
  "attempts": 2,
  "bestScore": 90,
  "isPassed": true,
  "lastAttempt": "2025-06-16T20:17:09Z"
}
```

## UI/UX Notes

- Show attempts, best score, and pass/fail status.
