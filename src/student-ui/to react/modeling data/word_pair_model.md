# Word Pair Model

## Overview

Represents a pair of words, such as for matching or synonym/antonym exercises.

## Fields

| Field Name | Type   | Description / Notes                    |
| ---------- | ------ | -------------------------------------- |
| id         | string | Unique word pair ID                    |
| word1      | string | First word                             |
| word2      | string | Second word                            |
| relation   | string | Relation type (e.g., synonym, antonym) |
| ...        | ...    | ...                                    |

## Relationships

- Used in vocabulary exercises and games.

## Usage in React

- Displayed in matching games, synonym/antonym practice, and quizzes.

## Example Object

```json
{
  "id": "wp1",
  "word1": "happy",
  "word2": "joyful",
  "relation": "synonym"
}
```

## UI/UX Notes

- Show both words and relation visually.
