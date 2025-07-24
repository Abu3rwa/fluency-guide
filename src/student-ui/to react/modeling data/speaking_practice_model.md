# Speaking Practice Model

## Overview

Represents a speaking practice activity, including prompts and expected responses.

## Fields

| Field Name       | Type   | Description / Notes |
| ---------------- | ------ | ------------------- |
| id               | string | Unique practice ID  |
| prompt           | string | Speaking prompt     |
| expectedResponse | string | Expected response   |
| audioUrl         | string | Audio prompt URL    |
| ...              | ...    | ...                 |

## Relationships

- Used in lessons and pronunciation practice.

## Usage in React

- Displayed in speaking practice activities and feedback.

## Example Object

```json
{
  "id": "sp1",
  "prompt": "Say 'hello'",
  "expectedResponse": "hello",
  "audioUrl": "https://..."
}
```

## UI/UX Notes

- Play audio prompt and record user response.
- Show feedback on correctness.
