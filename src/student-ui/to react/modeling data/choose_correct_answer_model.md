# Choose Correct Answer Model

## Overview

Represents a question where the user must choose the correct answer from a set of options.

## Fields

| Field Name   | Type   | Description / Notes                    |
| ------------ | ------ | -------------------------------------- |
| id           | string | Unique question ID                     |
| question     | string | The question text                      |
| options      | array  | List of answer options                 |
| correctIndex | number | Index of the correct answer in options |
| explanation  | string | Explanation for the correct answer     |
| ...          | ...    | ...                                    |

## Relationships

- Used in tasks/quizzes as a question type.

## Usage in React

- Displayed in quizzes, practice, and review screens.

## Example Object

```json
{
  "id": "q1",
  "question": "What is the capital of France?",
  "options": ["London", "Paris", "Berlin", "Rome"],
  "correctIndex": 1,
  "explanation": "Paris is the capital of France."
}
```

## UI/UX Notes

- Show options as radio buttons or buttons.
- Show explanation after answer is submitted.
