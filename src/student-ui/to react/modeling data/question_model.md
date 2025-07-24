# Question Model

## Overview

Represents a question in a quiz, task, or lesson.

## Fields

| Field Name    | Type   | Description / Notes                               |
| ------------- | ------ | ------------------------------------------------- |
| id            | string | Unique question ID                                |
| text          | string | The question text                                 |
| type          | string | Question type (e.g., multipleChoice, fillInBlank) |
| options       | array  | List of answer options (if applicable)            |
| correctAnswer | string | The correct answer (if applicable)                |
| explanation   | string | Explanation for the correct answer                |
| ...           | ...    | ...                                               |

## Relationships

- Used in tasks, quizzes, and lessons.

## Usage in React

- Displayed in quizzes, tasks, and practice screens.

## Example Object

```json
{
  "id": "q1",
  "text": "What is the capital of France?",
  "type": "multipleChoice",
  "options": ["London", "Paris", "Berlin", "Rome"],
  "correctAnswer": "Paris",
  "explanation": "Paris is the capital of France."
}
```

## UI/UX Notes

- Show options as radio buttons or buttons.
- Show explanation after answer is submitted.
