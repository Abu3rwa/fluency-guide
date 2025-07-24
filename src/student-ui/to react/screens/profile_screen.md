# Profile Screen UI Migration Plan (Enhanced)

## Overview

The Profile Screen provides a comprehensive view of the user's identity, progress, achievements, and quick access to profile management and settings. It is designed to be visually appealing, accessible, and responsive across devices.

---

## Components

- **UserAvatar**: Displays the user's profile picture with alt text and fallback initials.
- **UserInfo**: Shows name, email, role, and optionally a short bio or status.
- **ProgressSummary**: Visual summary (progress bars, stats, charts) of learning progress, streaks, and goals.
- **AchievementsList**: Grid or list of earned achievements/badges, each clickable for more details.
- **EditProfileButton**: Opens a modal/dialog for editing profile info (name, avatar, bio, etc.).
- **SettingsLink**: Navigates to the settings page.
- **LogoutButton**: (Optional) For quick sign-out.
- **MobileFAB**: Floating action button for edit on mobile.

---

## Layout

- **Header**: UserAvatar + UserInfo (side-by-side on desktop, stacked on mobile)
- **Section 1**: ProgressSummary (with tooltips for details)
- **Section 2**: AchievementsList (responsive grid/list)
- **Section 3**: Actions (EditProfileButton, SettingsLink, LogoutButton)

---

## State Management

- Use React Context (or Redux if already in use) for user profile and progress data.
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

---

## Accessibility

- Alt text for avatar.
- All buttons and links keyboard accessible (tab order, aria-labels).
- Sufficient color contrast.
- Use semantic HTML (e.g., `<section>`, `<header>`, `<main>`, `<button>`, `<nav>`).
- Announce updates (e.g., profile saved) with ARIA live regions.

---

## Mobile

- Stacked layout for small screens.
- Responsive grid/list for achievements.
- Floating action button (FAB) for edit.
- Touch-friendly targets.

---

## Extensibility

- Allow for additional profile fields (bio, location, social links).
- Support for dark mode.
- Easy to add new achievement types or progress metrics.

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

## Implementation Steps

1. Scaffold the new ProfileScreen component and subcomponents.
2. Integrate with user context for data.
3. Implement data fetching and loading states.
4. Build Edit Profile modal/dialog.
5. Add interactivity and accessibility features.
6. Test on desktop and mobile.
7. Polish UI and handle edge cases.
