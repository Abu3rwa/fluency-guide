# Dictionary Models

## Overview

Represents dictionary data structures, such as definitions, meanings, phonetics, and usage examples for vocabulary words.

## Main Models

### 1. DictionaryEntry

| Field Name | Type   | Description / Notes      |
| ---------- | ------ | ------------------------ |
| id         | string | Unique entry ID          |
| word       | string | The vocabulary word      |
| meanings   | array  | List of Meaning objects  |
| phonetics  | array  | List of Phonetic objects |
| ...        | ...    | ...                      |

### 2. Meaning

| Field Name   | Type   | Description / Notes        |
| ------------ | ------ | -------------------------- |
| partOfSpeech | string | Part of speech             |
| definitions  | array  | List of Definition objects |
| ...          | ...    | ...                        |

### 3. Definition

| Field Name | Type   | Description / Notes |
| ---------- | ------ | ------------------- |
| definition | string | The definition text |
| example    | string | Example sentence    |
| ...        | ...    | ...                 |

### 4. Phonetic

| Field Name | Type   | Description / Notes     |
| ---------- | ------ | ----------------------- |
| text       | string | Phonetic transcription  |
| audio      | string | Audio pronunciation URL |
| ...        | ...    | ...                     |

## Relationships

- DictionaryEntry contains meanings and phonetics.
- Meaning contains definitions.

## Usage in React

- Displayed in dictionary lookups, vocabulary details, and flashcards.

## Example Object

```json
{
  "id": "dict1",
  "word": "hello",
  "meanings": [
    {
      "partOfSpeech": "interjection",
      "definitions": [
        { "definition": "A greeting.", "example": "Hello, how are you?" }
      ]
    }
  ],
  "phonetics": [{ "text": "həˈloʊ", "audio": "https://..." }]
}
```

## UI/UX Notes

- Show word, meanings, definitions, and phonetics in dictionary view.
- Play audio if available.
