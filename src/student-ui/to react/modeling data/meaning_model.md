# Meaning Model

## Overview

Represents a meaning or definition of a vocabulary word.

## Fields

| Field Name | Type   | Description / Notes       |
| ---------- | ------ | ------------------------- |
| id         | string | Unique meaning ID         |
| wordId     | string | Associated word ID        |
| definition | string | The meaning or definition |
| example    | string | Example sentence          |
| ...        | ...    | ...                       |

## Relationships

- References vocabulary word.

## Usage in React

- Displayed in vocabulary details, flashcards, and quizzes.

## Example Object

```json
{
  "id": "m1",
  "wordId": "word1",
  "definition": "A greeting.",
  "example": "Hello, how are you?"
}
```

## UI/UX Notes

- Show definition and example in vocabulary details.
