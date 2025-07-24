# Lesson Model

## Overview

Represents a lesson within a module or course, including content, objectives, and metadata.

## Fields

| Field Name    | Type      | Description / Notes                      |
| ------------- | --------- | ---------------------------------------- |
| id            | string    | Unique lesson ID                         |
| title         | string    | Lesson title                             |
| description   | string    | Lesson description                       |
| content       | string    | Main lesson content (text, HTML, etc.)   |
| moduleId      | string    | ID of the parent module                  |
| courseId      | string    | ID of the parent course                  |
| order         | number    | Order within the module                  |
| objectives    | array     | List of learning objectives              |
| resources     | array     | List of resource links or files          |
| videoUrl      | string    | Video URL (if any)                       |
| attachments   | array     | List of attachment URLs                  |
| quizId        | string    | Associated quiz ID                       |
| taskId        | string    | Associated task ID                       |
| duration      | number    | Estimated duration (minutes)             |
| status        | string    | Status (e.g., draft, published)          |
| prerequisites | array     | List of prerequisite lesson IDs          |
| coverImageUrl | string    | Cover image URL                          |
| authorId      | string    | Author's user ID                         |
| tags          | array     | List of tags                             |
| isFreePreview | boolean   | If lesson is available as a free preview |
| visibility    | string    | Visibility (e.g., enrolledOnly, public)  |
| vocabulary    | array     | List of vocabulary words                 |
| grammarFocus  | array     | List of grammar topics                   |
| skills        | array     | List of skills targeted                  |
| assessment    | string    | Assessment info                          |
| keyActivities | array     | List of key activities                   |
| createdAt     | timestamp | Creation date                            |
| updatedAt     | timestamp | Last update date                         |
| ...           | ...       | ...                                      |

## Relationships

- Belongs to a module and course.
- May reference quizzes, tasks, vocabulary, etc.

## Usage in React

- Displayed in lesson views, progress tracking, and course/module breakdowns.

## Example Object

```json
{
  "id": "lesson1",
  "title": "Introduction to English",
  "description": "Overview of the course.",
  "moduleId": "mod1",
  "courseId": "M0x4zx95Ij47OcUJtv9D",
  "order": 1,
  "objectives": ["Understand basics"],
  "resources": [],
  "videoUrl": "https://...",
  "status": "published",
  "createdAt": "2025-06-16T20:17:09Z"
}
```

## UI/UX Notes

- Show title, objectives, and content prominently.
- Show progress/completion status if enrolled.
