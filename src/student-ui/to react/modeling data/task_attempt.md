# Task Attempt Model

## Overview

Represents a user's attempt at a task or quiz, including answers, score, and status.

## Fields

| Field Name     | Type      | Description / Notes                  |
| -------------- | --------- | ------------------------------------ |
| id             | string    | Unique attempt ID                    |
| userId         | string    | User who attempted the task          |
| taskId         | string    | Associated task ID                   |
| answers        | array     | List of answer objects or IDs        |
| score          | number    | Score achieved                       |
| status         | string    | Status (e.g., completed, inProgress) |
| submittedAt    | timestamp | Submission date                      |
| isPassed       | boolean   | Whether the attempt was a pass       |
| correctAnswers | number    | Number of correct answers            |
| totalQuestions | number    | Total number of questions            |
| ...            | ...       | ...                                  |

## Relationships

- References user, task, and answers.

## Usage in React

- Displayed in task/quiz results, analytics, and progress tracking.

## Example Object

```json
{
  "id": "attempt1",
  "userId": "user1",
  "taskId": "task1",
  "answers": ["ans1", "ans2"],
  "score": 8,
  "status": "completed",
  "submittedAt": "2025-06-16T20:17:09Z",
  "isPassed": true,
  "correctAnswers": 8,
  "totalQuestions": 10
}
```

## UI/UX Notes

- Show score, pass/fail, and answer review.
- Allow user to review or retry if allowed.
