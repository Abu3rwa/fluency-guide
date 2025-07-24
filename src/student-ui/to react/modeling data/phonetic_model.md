# Phonetic Model

## Overview

Represents the phonetic transcription and pronunciation of a vocabulary word.

## Fields

| Field Name    | Type   | Description / Notes                |
| ------------- | ------ | ---------------------------------- |
| id            | string | Unique phonetic ID                 |
| wordId        | string | Associated word ID                 |
| transcription | string | Phonetic transcription (IPA, etc.) |
| audioUrl      | string | Audio pronunciation URL            |
| ...           | ...    | ...                                |

## Relationships

- References vocabulary word.

## Usage in React

- Displayed in vocabulary details, flashcards, and pronunciation practice.

## Example Object

```json
{
  "id": "p1",
  "wordId": "word1",
  "transcription": "həˈloʊ",
  "audioUrl": "https://..."
}
```

## UI/UX Notes

- Show transcription and play audio if available.
