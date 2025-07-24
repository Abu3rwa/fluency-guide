# Definition Model

## Overview

Represents a definition of a vocabulary word, possibly with additional metadata.

## Fields

| Field Name   | Type   | Description / Notes               |
| ------------ | ------ | --------------------------------- |
| id           | string | Unique definition ID              |
| wordId       | string | Associated word ID                |
| text         | string | The definition text               |
| partOfSpeech | string | Part of speech (e.g., noun, verb) |
| ...          | ...    | ...                               |

## Relationships

- References vocabulary word.

## Usage in React

- Displayed in vocabulary details, flashcards, and quizzes.

## Example Object

```json
{
  "id": "d1",
  "wordId": "word1",
  "text": "A greeting.",
  "partOfSpeech": "interjection"
}
```

## UI/UX Notes

- Show definition and part of speech in vocabulary details.
