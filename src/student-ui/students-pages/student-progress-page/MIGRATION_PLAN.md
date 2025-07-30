# Production-Ready Migration Plan: Dart Progress Screen to React

This document provides a detailed, production-ready plan for migrating the student progress screen from the existing Dart implementation to a new React page.

## 1. File Structure

The file structure will be as follows:

```
src/student-ui/students-pages/student-progress-page/
├── __tests__/
│   ├── StudentProgressPage.test.js
│   ├── ProgressAchievements.test.js
│   ├── ProgressCourseBars.test.js
│   ├── ProgressGoals.test.js
│   ├── ProgressPronunciationSection.test.js
│   ├── ProgressRecentActivities.test.js
│   └── ProgressTrendChart.test.js
├── StudentProgressPage.jsx
├── StudentProgressPage.styles.js
├── components/
│   ├── ProgressAchievements.jsx
│   ├── ProgressCourseBars.jsx
│   ├── ProgressGoals.jsx
│   ├── ProgressPronunciationSection.jsx
│   ├── ProgressRecentActivities.jsx
│   └── ProgressTrendChart.jsx
└── hooks/
    └── useStudentProgress.js
```

## 2. Data Layer and Services

We will need to either create or verify the existence of the following service functions.

**Data Contracts:**

- **Achievement:** `{ id, name, description, date, icon }`
- **CourseProgress:** `{ id, courseName, progress, totalLessons, completedLessons }`
- **Goal:** `{ id, name, description, status, dueDate }`
- **PronunciationResult:** `{ id, word, score, audioUrl }`
- **RecentActivity:** `{ id, type, description, timestamp }`
- **ProgressTrend:** `{ date, value }`

**Service Functions:**

- `studentAchievementsService.getAchievements(studentId)`
- `studentCourseProgressService.getCourseProgress(studentId)`
- `studentGoalsService.getGoals(studentId)`
- `studentPronunciationService.getPronunciationResults(studentId)`
- `studentActivityService.getRecentActivities(studentId)`
- `studentProgressTrendService.getProgressTrend(studentId, timeRange)`

## 3. `useStudentProgress` Hook

This hook will be the single source of truth for the page's data and state.

**State (`useState` or `useReducer`):**

```javascript
{
  achievements: { data: [], loading: true, error: null },
  courseProgress: { data: [], loading: true, error: null },
  goals: { data: [], loading: true, error: null },
  pronunciationResults: { data: [], loading: true, error: null },
  recentActivities: { data: [], loading: true, error: null },
  progressTrend: { data: [], loading: true, error: null }
}
```

**Exposed Values:**

- The entire state object.
- A `refetch` function to re-trigger all data fetching.

## 4. Component APIs (Props)

- **`ProgressAchievements`**: `({ achievements, loading, error })`
- **`ProgressCourseBars`**: `({ courseProgress, loading, error })`
- **`ProgressGoals`**: `({ goals, loading, error })`
- **`ProgressPronunciationSection`**: `({ pronunciationResults, loading, error })`
- **`ProgressRecentActivities`**: `({ recentActivities, loading, error })`
- **`ProgressTrendChart`**: `({ progressTrend, loading, error })`

Each component will be responsible for displaying its own loading and error states based on the props it receives.

## 5. Styling

- **`StudentProgressPage.styles.js`**: Will use `styled-components` for the main page layout, including a grid or flexbox layout for the components.
- **Component Styles**: Each component will have its own co-located styles file (e.g., `ProgressAchievements.styles.js`) or use `styled-components` directly within the component file for smaller components.
- **Theme:** All styles will use the application's theme for consistent colors, fonts, and spacing.

## 6. Routing

The route will be added to `src/routes/index.jsx`:

```javascript
import StudentProgressPage from "../student-ui/students-pages/student-progress-page/StudentProgressPage";

// ... inside the router component
<PrivateRoute path="/student/progress" component={StudentProgressPage} />;
```

## 7. Error Handling and Loading States

- **`useStudentProgress` Hook**: Will have `try...catch` blocks for all data fetching operations to populate the `error` state.
- **Components**: Each component will render a loading spinner or skeleton UI when `loading` is true, and an error message when `error` is not null.

## 8. Testing Strategy

- **Unit Tests**: Each component will have unit tests to verify that it renders correctly with different props (loading, error, data).
- **Integration Tests**: `StudentProgressPage.test.js` will test the integration of all components, mocking the `useStudentProgress` hook to provide data.
- **Hook Tests**: The `useStudentProgress` hook will be tested to ensure it fetches data correctly and manages state as expected.

## 9. Implementation Steps (Detailed)

1.  **Create File Structure**: Create all the directories and empty files as defined in Section 1.
2.  **Implement Services**: Ensure all service functions listed in Section 2 are implemented and return data in the correct format.
3.  **Build `useStudentProgress` Hook**:
    - Set up the initial state.
    - Use `useEffect` to fetch all data when the component mounts.
    - Implement loading and error handling for each data type.
    - Expose the state and a `refetch` function.
4.  **Develop Components**:
    - For each component, build the UI to display the data.
    - Implement the loading state (e.g., with a skeleton screen).
    - Implement the error state (e.g., with an error message).
5.  **Assemble `StudentProgressPage`**:
    - Use the `useStudentProgress` hook to get the data.
    - Pass the data down to the respective components.
    - Use `StudentProgressPage.styles.js` to create the overall page layout.
6.  **Add Routing**: Add the new route to `src/routes/index.jsx`.
7.  **Write Tests**:
    - Write unit tests for each component.
    - Write tests for the `useStudentProgress` hook.
    - Write integration tests for the `StudentProgressPage`.
8.  **Manual Testing**: Perform manual testing in the browser to ensure everything works as expected.
