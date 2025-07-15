# Improved Prompts to Fix Issues in CourseDetailsScreen.jsx

## 1. Refactor into Smaller Components

- **Prompt:** Refactor `CourseDetailsScreen.jsx` by extracting the modules tab logic into a new `ModuleList` component, and the task dialog logic into a `TaskDialog` component. Most other sections (CourseHeader, CourseOverview, CourseAnalytics, LessonList, ModuleCard, etc.) already exist as reusable components.
- **Why:** This will further improve readability, maintainability, and testability by ensuring all major sections are modular.
- **How:** Move the JSX and logic for the modules tab (including module listing, creation, editing, and deletion) into `components/course/ModuleList.jsx`. Move the task dialog logic into `components/tasks/TaskDialog.jsx`.

## 2. Use a State Management Library

- **Prompt:** Replace related `useState` hooks in `CourseDetailsScreen.jsx` with a centralized state management solution (such as Context API, Redux, or Zustand) for managing course, module, lesson, and dialog state.
- **Why:** This reduces prop drilling, simplifies state updates, and makes the code easier to scale.
- **How:** Create a context or store for course details and provide it to child components.

## 3. Standardize Error Handling

- **Prompt:** Implement a reusable error handling hook or utility for all async operations in `CourseDetailsScreen.jsx`. Ensure all errors are caught and user-friendly messages are displayed.
- **Why:** Consistent error handling improves user experience and code reliability.
- **How:** Create a `useErrorHandler` hook or error boundary component.

## 4. Enhance Accessibility

- **Prompt:** Audit all dialogs and interactive elements in `CourseDetailsScreen.jsx` for accessibility. Add ARIA labels, ensure keyboard navigation, and test with screen readers.
- **Why:** Accessibility ensures your app is usable by everyone.
- **How:** Use tools like axe or Lighthouse to identify issues, and add missing ARIA attributes.

## 5. Optimize Performance

- **Prompt:** Review all `useEffect` and `useCallback` dependencies in `CourseDetailsScreen.jsx` to avoid unnecessary re-renders or data fetching. Use `React.memo` or `useMemo` for expensive computations and pure components.
- **Why:** This will make the UI more responsive and efficient.
- **How:** Profile renders with React DevTools and memoize where needed.

## 6. Extract Constants and Enums

- **Prompt:** Move all magic numbers and strings (such as tab indices, sort keys, and status values) from `CourseDetailsScreen.jsx` to a separate constants file (e.g., `src/constants/course.js`).
- **Why:** Centralizing constants reduces bugs and makes updates easier.
- **How:** Replace inline values with named imports from the constants file.

## 7. Improve UI/UX

- **Prompt:** Review dialogs and forms in `CourseDetailsScreen.jsx` for clarity and simplicity. Add loading indicators, success/error feedback, and ensure a clean, intuitive layout.
- **Why:** A better UI/UX increases user satisfaction and reduces confusion.
- **How:** Use Material-UI best practices and gather user feedback for improvements.

## 8. Add Comments and Documentation

- **Prompt:** Add comments explaining complex logic and provide a high-level overview at the top of `CourseDetailsScreen.jsx`. Document the purpose and usage of each major function and component.
- **Why:** Good documentation helps future maintainers and collaborators.
- **How:** Use JSDoc or inline comments for functions and components.

## 9. Remove Unused Imports

- **Prompt:** Audit `CourseDetailsScreen.jsx` for unused or redundant imports and remove them. Use a linter or IDE to assist.
- **Why:** This keeps the codebase clean and reduces bundle size.
- **How:** Run `eslint` or use VSCode's "Organize Imports" feature.

## 10. Move Inline Styles to CSS/Theme

- **Prompt:** Refactor all inline styles in `CourseDetailsScreen.jsx` into CSS modules, styled-components, or your theme file for better maintainability and consistency.
- **Why:** This separates concerns and makes styling easier to manage.
- **How:** Create or update CSS files and replace inline `sx` or `style` props with class names or styled components.

---

> _Use these improved prompts as clear, actionable tasks to systematically enhance CourseDetailsScreen.jsx. Each prompt includes a rationale and suggested approach for best results._
