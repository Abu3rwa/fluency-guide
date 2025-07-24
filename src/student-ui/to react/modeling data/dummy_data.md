# Dummy Data Model

## Overview

Represents mock or sample data used for testing and development purposes.

## Fields

- Varies depending on the mock data structure. Typically includes fields from the main models (user, course, lesson, etc.).

## Relationships

- Mimics relationships between real models for testing.

## Usage in React

- Used to populate UI components during development or testing.
- Allows for UI/UX prototyping without backend.

## Example Object

```json
{
  "user": {
    "uid": "user1",
    "displayName": "Test User"
  },
  "course": {
    "id": "course1",
    "title": "Sample Course"
  }
}
```

## UI/UX Notes

- Use only in development/testing environments.
- Replace with real data in production.
