# Quiz Model

## Overview

Represents a quiz associated with a lesson or module, containing questions and scoring.

## Fields

| Field Name   | Type      | Description / Notes             |
| ------------ | --------- | ------------------------------- |
| id           | string    | Unique quiz ID                  |
| title        | string    | Quiz title                      |
| lessonId     | string    | Associated lesson ID            |
| moduleId     | string    | Associated module ID            |
| questions    | array     | List of question IDs or objects |
| totalPoints  | number    | Total points for the quiz       |
| passingScore | number    | Minimum score to pass           |
| createdAt    | timestamp | Creation date                   |
| updatedAt    | timestamp | Last update date                |
| ...          | ...       | ...                             |

## Relationships

- Belongs to a lesson or module.
- Contains questions.

## Usage in React

- Displayed in lesson/module quizzes, progress tracking, and analytics.

## Example Object

```json
{
  "id": "quiz1",
  "title": "Lesson 1 Quiz",
  "lessonId": "lesson1",
  "questions": ["q1", "q2"],
  "totalPoints": 10,
  "passingScore": 7
}
```

## UI/UX Notes

- Show quiz title, questions, and score.
- Show pass/fail status after completion.
