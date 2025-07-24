# Pronunciation Progress Model

## Overview

Represents a user's pronunciation practice and progress for specific words or phrases.

## Fields

| Field Name  | Type      | Description / Notes                       |
| ----------- | --------- | ----------------------------------------- |
| id          | string    | Unique progress ID                        |
| userId      | string    | User who practiced                        |
| word        | string    | Word or phrase practiced                  |
| attempts    | number    | Number of attempts                        |
| bestScore   | number    | Highest score achieved                    |
| isPassed    | boolean   | Whether the user passed the pronunciation |
| lastAttempt | timestamp | Date of last attempt                      |
| confidence  | number    | Confidence score (if available)           |
| ...         | ...       | ...                                       |

## Relationships

- References user and vocabulary word.

## Usage in React

- Displayed in pronunciation practice, progress tracking, and feedback.

## Example Object

```json
{
  "id": "pp1",
  "userId": "user1",
  "word": "hello",
  "attempts": 3,
  "bestScore": 95,
  "isPassed": true,
  "lastAttempt": "2025-06-16T20:17:09Z"
}
```

## UI/UX Notes

- Show word, attempts, and best score.
- Show pass/fail status and feedback.
