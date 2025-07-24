# Hard Word Model

## Overview

Represents a vocabulary word that is marked as difficult for a user.

## Fields

| Field Name | Type      | Description / Notes              |
| ---------- | --------- | -------------------------------- |
| id         | string    | Unique hard word ID              |
| userId     | string    | User who marked the word as hard |
| wordId     | string    | The vocabulary word ID           |
| addedAt    | timestamp | When the word was marked as hard |
| ...        | ...       | ...                              |

## Relationships

- References user and vocabulary word.

## Usage in React

- Displayed in hard word lists, review, and analytics.

## Example Object

```json
{
  "id": "hw1",
  "userId": "user1",
  "wordId": "word1",
  "addedAt": "2025-06-16T20:17:09Z"
}
```

## UI/UX Notes

- Allow user to unmark as hard.
- Show in a separate section for focused review.
