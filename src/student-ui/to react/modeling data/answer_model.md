# Answer Model

## Overview

Represents an answer to a question in a quiz or task.

## Fields

| Field Name | Type    | Description / Notes            |
| ---------- | ------- | ------------------------------ |
| id         | string  | Unique answer ID               |
| questionId | string  | Associated question ID         |
| value      | string  | The answer value/text          |
| isCorrect  | boolean | Whether this answer is correct |
| ...        | ...     | ...                            |

## Relationships

- References question.

## Usage in React

- Displayed in answer review, feedback, and analytics.

## Example Object

```json
{
  "id": "ans1",
  "questionId": "q1",
  "value": "Paris",
  "isCorrect": true
}
```

## UI/UX Notes

- Show correct/incorrect status visually.
