# Student Lesson Details Page Components

This folder contains all components for the Student Lesson Details Page. Each component is prefixed with `Student` for clarity and consistency.

## Planned Components

- **StudentLessonDetailsPage.jsx**

  - The main page container and orchestrator for all lesson details sections.

- **StudentLessonHeaderSection.jsx**

  - Sticky/fixed header with lesson title, navigation, and quick actions (e.g., back, mark complete).

- **StudentLessonMediaPlayer.jsx**

  - Video/audio/media player for lesson content (if available).

- **StudentLessonContentSection.jsx**

  - Displays the main lesson content (rich text, images, etc.).

- **StudentLessonObjectivesList.jsx**

  - Lists the lesson's learning objectives.

- **StudentLessonResourcesPanel.jsx**

  - Downloadable files, links, and other lesson resources.

- **StudentLessonProgressBar.jsx**

  - Shows lesson completion/progress status.

- **StudentLessonActionsBar.jsx**

  - Actions such as mark as complete, start quiz, etc.

- **StudentInstructorInfoCard.jsx**

  - Instructor avatar, name, bio, and contact info.

- **StudentSupportDialog.jsx**

  - Dialog for support/FAQ/help related to the lesson.

- **StudentLessonDetailsPage.styles.js**
  - Centralized styles for the page and its components, using the project theme.

## Notes

- All components must use the project theme (`ThemeContext.js`) for styling.
- All static text must use translation keys (see `/locales`).
- All components must be responsive and accessible.
- Dynamic content should be translated if available.

---

**Next Steps:**

- Scaffold each component file with the correct prefix and structure.
- Implement each section/component iteratively, following the plan in `LESSON_DETAILS_PAGE_PLAN.md`.
