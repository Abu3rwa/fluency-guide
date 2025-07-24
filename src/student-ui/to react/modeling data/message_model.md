# Message Model

## Overview

Represents a chat or message between users, such as student-teacher or peer-to-peer messages.

## Fields

| Field Name   | Type      | Description / Notes                  |
| ------------ | --------- | ------------------------------------ |
| id           | string    | Unique message ID                    |
| lessonId     | string    | Associated lesson ID (if any)        |
| userId       | string    | Sender user ID                       |
| receiverId   | string    | Receiver user ID                     |
| content      | string    | Message content                      |
| createdAt    | timestamp | Creation date                        |
| participants | array     | List of user IDs in the conversation |
| ...          | ...       | ...                                  |

## Relationships

- References users and lessons.

## Usage in React

- Displayed in chat, inbox, and lesson discussion components.

## Example Object

```json
{
  "id": "msg1",
  "lessonId": "lesson1",
  "userId": "user1",
  "receiverId": "user2",
  "content": "Hello!",
  "createdAt": "2025-06-16T20:17:09Z",
  "participants": ["user1", "user2"]
}
```

## UI/UX Notes

- Show sender, content, and timestamp.
- Group messages by conversation.
