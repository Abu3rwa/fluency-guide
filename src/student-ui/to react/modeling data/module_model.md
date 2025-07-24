# Module Model

## Overview

Represents a module within a course, grouping related lessons and content.

## Fields

| Field Name  | Type      | Description / Notes     |
| ----------- | --------- | ----------------------- |
| id          | string    | Unique module ID        |
| title       | string    | Module title            |
| description | string    | Module description      |
| courseId    | string    | ID of the parent course |
| order       | number    | Order within the course |
| lessons     | array     | List of lesson IDs      |
| createdAt   | timestamp | Creation date           |
| updatedAt   | timestamp | Last update date        |
| ...         | ...       | ...                     |

## Relationships

- Belongs to a course.
- Contains lessons.

## Usage in React

- Displayed in course breakdowns, navigation, and progress tracking.

## Example Object

```json
{
  "id": "mod1",
  "title": "Basics of English",
  "description": "Covers the basics.",
  "courseId": "M0x4zx95Ij47OcUJtv9D",
  "order": 1,
  "lessons": ["lesson1", "lesson2"]
}
```

## UI/UX Notes

- Show module title and description in course outline.
- Show progress bar for module completion.
