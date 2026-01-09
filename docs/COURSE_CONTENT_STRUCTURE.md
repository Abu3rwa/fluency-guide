# Course Content Structure

This document explains how the course content system works in Sudanglish.

---

## Overview

The course content is organized in a **hierarchical structure**:

```
Course
  └── Units (Modules)
        └── Lessons
```

---

## 1. Course

A **Course** is the top-level container. It represents a complete learning program.

### Course Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | `{ en: string, ar: string }` | Course title in English and Arabic |
| `description` | `{ en: string, ar: string }` | Course description |
| `category` | `{ en: string, ar: string }` | Course category (e.g., "English", "Business") |
| `level` | `{ en: string, ar: string }` | Difficulty level (e.g., "Beginner", "Advanced") |
| `price` | `number` | Course price |
| `thumbnail` | `string` | URL to course image |
| `instructor` | `{ uid: string, name: string }` | Instructor information |
| `status` | `string` | "published" or "draft" |
| `totalStudents` | `number` | Number of enrolled students |
| `totalRounds` | `number` | Number of course rounds |
| `currentRoundId` | `string` | Reference to active round |

### Firestore Path
```
/courses/{courseId}
```

---

## 2. Units (Modules)

A **Unit** is a section or module within a course. It groups related lessons together.

### Unit Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | `{ en: string, ar: string }` | Unit title in English and Arabic |
| `description` | `{ en: string, ar: string }` | Unit description |
| `order` | `number` | Display order (1, 2, 3, ...) |
| `createdAt` | `Timestamp` | When the unit was created |
| `updatedAt` | `Timestamp` | Last update time |

### Firestore Path
```
/courses/{courseId}/units/{unitId}
```

---

## 3. Lessons

A **Lesson** is an individual learning item within a unit.

### Lesson Types

| Type | Description | Content Fields Used |
|------|-------------|---------------------|
| `video` | Video lesson (YouTube, Meet, Zoom, etc.) | `linkType`, `link` |
| `reading` | Text-based reading material | `text.en`, `text.ar` |
| `assignment` | Task for student to complete | `instructions.en`, `instructions.ar`, `instructorWhatsApp` |

### Lesson Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | `{ en: string, ar: string }` | Lesson title |
| `description` | `{ en: string, ar: string }` | Lesson description |
| `type` | `string` | "video", "reading", or "assignment" |
| `duration` | `number` | Duration in minutes |
| `order` | `number` | Display order within unit |
| `content` | `object` | Type-specific content (see below) |
| `createdAt` | `Timestamp` | When the lesson was created |
| `updatedAt` | `Timestamp` | Last update time |

### Content Object Structure

#### For Video Lessons:
```javascript
{
  linkType: "youtube" | "meet" | "zoom" | "vimeo" | "other",
  link: "https://...",
  videoUrl: "https://..." // Legacy field, kept for compatibility
}
```

#### For Reading Lessons:
```javascript
{
  text: {
    en: "English content...",
    ar: "Arabic content..."
  }
}
```

#### For Assignment Lessons:
```javascript
{
  instructions: {
    en: "English instructions...",
    ar: "Arabic instructions..."
  },
  instructorWhatsApp: "+249123456789"
}
```

### Firestore Path
```
/courses/{courseId}/units/{unitId}/lessons/{lessonId}
```

---

## Visual Structure

```
📚 Course: "English for Beginners"
│
├── 📁 Unit 1: "Introduction"
│   ├── 📹 Lesson 1: "Welcome Video" (video - YouTube)
│   ├── 📄 Lesson 2: "Course Overview" (reading)
│   └── 📝 Lesson 3: "Self Introduction" (assignment)
│
├── 📁 Unit 2: "Basic Grammar"
│   ├── 📹 Lesson 1: "Present Tense" (video - Zoom)
│   ├── 📹 Lesson 2: "Past Tense" (video - YouTube)
│   └── 📝 Lesson 3: "Grammar Quiz" (assignment)
│
└── 📁 Unit 3: "Conversation"
    ├── 📹 Lesson 1: "Daily Phrases" (video - Meet)
    └── 📄 Lesson 2: "Practice Dialogues" (reading)
```

---

## Managing Content

### Creating Content (Instructor Dashboard)

1. **Navigate to Course Content**
   - Go to Instructor Dashboard → Courses Tab
   - Click "Content" button on a course

2. **Add a Unit**
   - Click "Add Unit" button
   - Fill in title (English & Arabic)
   - Optionally add description
   - Click "Save"

3. **Add a Lesson**
   - Expand a unit
   - Click "Add Lesson"
   - Fill in:
     - Title (English & Arabic)
     - Lesson Type (Video/Reading/Assignment)
     - Duration (minutes)
     - Type-specific content:
       - **Video**: Select link type, enter URL
       - **Reading**: Enter text content
       - **Assignment**: Enter instructions + WhatsApp

4. **Edit/Delete**
   - Use the edit (✏️) and delete (🗑️) icons on units/lessons

---

## Link Types for Video Lessons

| Link Type | Example URL | Use Case |
|-----------|-------------|----------|
| YouTube | `https://youtube.com/watch?v=...` | Pre-recorded videos |
| Google Meet | `https://meet.google.com/...` | Live classes |
| Zoom | `https://zoom.us/j/...` | Live classes |
| Vimeo | `https://vimeo.com/...` | Pre-recorded videos |
| Other | Any URL | External resources |

---

## Student View

When students access a course:

1. They see a list of **Units** in order
2. Each unit expands to show **Lessons**
3. Clicking a lesson shows:
   - **Video**: Embedded player or link to join
   - **Reading**: Text content displayed
   - **Assignment**: Instructions + WhatsApp button to submit

---

## File References

| File | Purpose |
|------|---------|
| `src/pages/CourseContentBuilder.jsx` | Instructor content management |
| `src/pages/CourseContentView.jsx` | Student content viewing |
| `src/pages/InstructorDashboard.jsx` | Course management |
| `src/contexts/CourseContext.jsx` | Course data management |
