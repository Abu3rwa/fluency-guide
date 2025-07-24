# Vocabulary Goal Model

## Overview

Represents a user's vocabulary learning goal, such as number of words to learn in a period.

## Fields

| Field Name     | Type      | Description / Notes             |
| -------------- | --------- | ------------------------------- |
| id             | string    | Unique goal ID                  |
| userId         | string    | User who set the goal           |
| targetCount    | number    | Number of words to learn        |
| period         | string    | Time period (e.g., week, month) |
| startDate      | timestamp | Goal start date                 |
| endDate        | timestamp | Goal end date                   |
| completedCount | number    | Number of words learned so far  |
| ...            | ...       | ...                             |

## Relationships

- References user and vocabulary words.

## Usage in React

- Displayed in goal tracking, dashboards, and analytics.

## Example Object

```json
{
  "id": "goal1",
  "userId": "user1",
  "targetCount": 50,
  "period": "month",
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-06-30T23:59:59Z",
  "completedCount": 20
}
```

## UI/UX Notes

- Show progress bar toward goal.
- Allow editing or resetting goal.
