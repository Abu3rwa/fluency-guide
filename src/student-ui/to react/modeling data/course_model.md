# Course Model

## Overview

Represents a course in the app, including metadata, instructor, and structure.

## Fields

| Field Name       | Type   | Description / Notes            |
| ---------------- | ------ | ------------------------------ |
| id               | string | Unique course ID               |
| title            | string | Course title                   |
| description      | string | Full description               |
| shortDescription | string | Short summary                  |
| category         | string | Category (e.g., English, Math) |
| level            | string | Difficulty level               |
| thumbnail        | string | Image URL                      |
| instructor       | string | Instructor name                |
| modules          | array  | List of module IDs             |
| ...              | ...    | ...                            |

## Relationships

- Contains modules, lessons, quizzes, etc.

## Usage in React

- Displayed in course lists, details, and enrollment flows.

## Example Object

```json
{
  "id": "M0x4zx95Ij47OcUJtv9D",
  "title": "English Fluency Guide",
  "description": "A comprehensive course for English learners.",
  "category": "English",
  "level": "Beginner",
  "thumbnail": "https://...",
  "instructor": "Jane Doe",
  "modules": ["mod1", "mod2"]
}
```

## UI/UX Notes

- Show thumbnail, title, and instructor in course cards.
- Show progress bar if enrolled.
