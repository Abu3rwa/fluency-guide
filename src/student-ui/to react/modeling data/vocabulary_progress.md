# Vocabulary Progress Model

## Overview

Represents a user's progress with specific vocabulary words, including study and test results.

## Fields

| Field Name     | Type      | Description / Notes               |
| -------------- | --------- | --------------------------------- |
| id             | string    | Unique progress ID                |
| userId         | string    | User who studied the word         |
| wordId         | string    | Vocabulary word ID                |
| timesViewed    | number    | Number of times viewed            |
| timesCorrect   | number    | Number of correct answers         |
| timesIncorrect | number    | Number of incorrect answers       |
| lastViewed     | timestamp | Last viewed date                  |
| updatedAt      | timestamp | Last update date                  |
| isFavorite     | boolean   | If the word is marked as favorite |
| ...            | ...       | ...                               |

## Relationships

- References user and vocabulary word.

## Usage in React

- Displayed in vocabulary review, progress tracking, and study analytics.

## Example Object

```json
{
  "id": "vp1",
  "userId": "user1",
  "wordId": "word1",
  "timesViewed": 5,
  "timesCorrect": 3,
  "timesIncorrect": 2,
  "lastViewed": "2025-06-16T20:17:09Z",
  "isFavorite": true
}
```

## UI/UX Notes

- Show word, view count, and accuracy.
- Allow marking/unmarking as favorite.
