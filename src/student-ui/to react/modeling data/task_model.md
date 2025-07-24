# Task Model

## Overview

Represents a task or quiz item, including questions, answers, and scoring.

## Fields

| Field Name         | Type      | Description / Notes                           |
| ------------------ | --------- | --------------------------------------------- |
| id                 | string    | Unique task ID                                |
| title              | string    | Task title                                    |
| instructions       | string    | Task instructions                             |
| type               | string    | Task type (e.g., multipleChoice, fillInBlank) |
| timeLimit          | number    | Time limit in seconds                         |
| passingScore       | number    | Minimum score to pass                         |
| attemptsAllowed    | number    | Number of allowed attempts                    |
| difficulty         | string    | Difficulty level                              |
| tags               | array     | List of tags                                  |
| isPublished        | boolean   | If the task is published                      |
| showFeedback       | boolean   | Show feedback after completion                |
| randomizeQuestions | boolean   | Randomize question order                      |
| showCorrectAnswers | boolean   | Show correct answers after completion         |
| allowReview        | boolean   | Allow review after completion                 |
| pointsPerQuestion  | number    | Points per question                           |
| totalPoints        | number    | Total points for the task                     |
| questions          | array     | List of question objects                      |
| lessonId           | string    | Associated lesson ID                          |
| courseId           | string    | Associated course ID                          |
| createdAt          | timestamp | Creation date                                 |
| updatedAt          | timestamp | Last update date                              |
| status             | string    | Status (e.g., draft, published)               |
| metadata           | object    | Additional metadata                           |
| ...                | ...       | ...                                           |

## Relationships

- Belongs to a lesson and course.
- Contains questions and answers.

## Usage in React

- Displayed in quizzes, assignments, and progress tracking.

## Example Object

```json
{
  "id": "task1",
  "title": "Quiz 1",
  "instructions": "Answer all questions.",
  "type": "multipleChoice",
  "questions": ["q1", "q2"],
  "lessonId": "lesson1",
  "courseId": "M0x4zx95Ij47OcUJtv9D",
  "isPublished": true
}
```

## UI/UX Notes

- Show task title, instructions, and questions.
- Show score and feedback after completion.
