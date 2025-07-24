# StudentDashboardPage Enhancement Prompt

Enhance the `StudentDashboardPage` to deliver a modern, responsive, and accessible student dashboard, combining the best practices from the Home Screen and Profile Screen UI migration plans.

---

## Layout & Components

- Use a responsive grid or flex layout.
- **Header**: Greeting section with user avatar, name, email, and role (side-by-side on desktop, stacked on mobile).
- **Main Sections**:
  - **ProgressSummary**: Visual summary of learning progress, streaks, and goals (progress bars, stats, charts).
  - **AchievementsList**: Responsive grid/list of earned achievements/badges, each clickable for more details.
  - **LearningPathSection**: (Optional) Show current learning path or enrolled courses.
  - **QuickActionsSection**: Shortcuts to profile editing, settings, logout, etc.
- **Side/Bottom**: Quick actions or additional navigation links.

---

## State Management

- Use React Context (or Redux if already in use) for user profile, progress, and achievements data.
- Use local state for UI (e.g., modal open/close).
- Memoize derived data for performance.

---

## Data Fetching

- Fetch user profile, progress, and achievements on mount (or subscribe to context).
- Show loading skeletons/placeholders while fetching.
- Handle errors gracefully with user-friendly messages.

---

## Interactivity

- **Edit Profile**: Modal/dialog with form validation, avatar upload, and save/cancel actions.
- **Achievements**: Clickable for details (modal or tooltip).
- **Settings**: Navigates to settings page.
- **Logout**: Signs out and redirects to login.
- **Cards/Sections**: Clickable for navigation to Profile, Progress, Courses, Lessons, Vocabulary, Achievements, Settings.

---

## Accessibility

- All buttons and links must be keyboard accessible (tab order, aria-labels).
- Alt text for avatar.
- Sufficient color contrast.
- Use semantic HTML (`<section>`, `<header>`, `<main>`, `<button>`, `<nav>`, etc.).
- Announce updates (e.g., profile saved) with ARIA live regions.

---

## Mobile

- Stacked layout for small screens.
- Responsive grid/list for achievements.
- Floating action button (FAB) for edit on mobile.
- Touch-friendly targets.
- Collapsible sections for mobile.

---

## Extensibility & Theming

- Allow for additional profile fields (bio, location, social links).
- Support for dark mode.
- Easy to add new achievement types or progress metrics.

---

## Implementation Steps

1. Scaffold/refactor the `StudentDashboardPage` and subcomponents.
2. Integrate with user context for data.
3. Implement data fetching and loading states.
4. Build Edit Profile modal/dialog.
5. Add interactivity and accessibility features.
6. Test on desktop and mobile.
7. Polish UI and handle edge cases.

---

## Example Wireframe

```
+------------------------------------------------------+
| [Avatar]  Name (Role)         [Edit] [Settings]      |
|           Email                                      |
+------------------------------------------------------+
| Progress: [Progress Bars/Stats/Charts]               |
+------------------------------------------------------+
| Achievements: [Badge1] [Badge2] [Badge3] ...         |
+------------------------------------------------------+
| [Logout]                                             |
+------------------------------------------------------+
```

---

## Goal

Deliver a beautiful, modern, and user-friendly student dashboard that is accessible, responsive, and extensible, following the best practices outlined above.
