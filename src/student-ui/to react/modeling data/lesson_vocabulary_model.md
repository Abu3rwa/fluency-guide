# Lesson Vocabulary Model

## Overview

Represents a vocabulary word included in a specific lesson, with lesson-specific context or notes.

## Fields

| Field Name | Type   | Description / Notes              |
| ---------- | ------ | -------------------------------- |
| id         | string | Unique lesson vocabulary ID      |
| lessonId   | string | Associated lesson ID             |
| wordId     | string | Associated vocabulary word ID    |
| context    | string | Lesson-specific context or usage |
| ...        | ...    | ...                              |

## Relationships

- References lesson and vocabulary word.

## Usage in React

- Displayed in lesson vocabulary lists and flashcards.

## Example Object

```json
{
  "id": "lv1",
  "lessonId": "lesson1",
  "wordId": "word1",
  "context": "Used in greetings."
}
```

## UI/UX Notes

- Show word and context in lesson vocabulary section.
