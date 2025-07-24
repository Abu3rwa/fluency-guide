# Vocabulary Word Model

## Overview

Represents a vocabulary word, including its spelling, meaning, and related data.

## Fields

| Field Name    | Type   | Description / Notes               |
| ------------- | ------ | --------------------------------- |
| id            | string | Unique word ID                    |
| word          | string | The vocabulary word               |
| meaning       | string | Main meaning or definition        |
| partOfSpeech  | string | Part of speech (e.g., noun, verb) |
| example       | string | Example sentence                  |
| pronunciation | string | Pronunciation guide               |
| audioUrl      | string | Audio pronunciation URL           |
| ...           | ...    | ...                               |

## Relationships

- May reference meanings, definitions, or phonetics.

## Usage in React

- Displayed in vocabulary lists, flashcards, and quizzes.

## Example Object

```json
{
  "id": "word1",
  "word": "hello",
  "meaning": "A greeting.",
  "partOfSpeech": "interjection",
  "example": "Hello, how are you?",
  "pronunciation": "həˈloʊ"
}
```

## UI/UX Notes

- Show word, meaning, and example.
- Play audio if available.
