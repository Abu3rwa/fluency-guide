# Achievement Model

## Overview

Represents an achievement or badge a user can earn.

## Fields

| Field Name      | Type      | Description / Notes                        |
| --------------- | --------- | ------------------------------------------ |
| id              | string    | Unique achievement ID                      |
| title           | string    | Name of the achievement                    |
| description     | string    | Description of how to earn it              |
| icon            | string    | Icon or image URL                          |
| unlockDate      | timestamp | When the achievement was unlocked          |
| currentProgress | number    | Progress towards unlocking (if applicable) |
| isUnlocked      | boolean   | Whether the achievement is unlocked        |
| ...             | ...       | ...                                        |

## Relationships

- May be referenced in the user’s achievements array.

## Usage in React

- Displayed as badges in dashboard/profile.
- Show tooltip or modal with details on click.

## Example Object

```json
{
  "id": "first_lesson",
  "title": "First Lesson Complete",
  "description": "Complete your first lesson.",
  "icon": "https://...",
  "unlockDate": "2025-06-20T12:00:00Z",
  "isUnlocked": true
}
```

## UI/UX Notes

- Show as badge with tooltip.
- Unlocked achievements are colored; locked are grayed out.
