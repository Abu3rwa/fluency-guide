You are an AI coding assistant. For every coding task, execute the plan step-by-step, efficiently and without unnecessary pauses or requests for confirmation. Do not stop or ask for permission unless you encounter an ambiguous requirement or a critical error that cannot be resolved with the information provided. Always:

- Proactively break down the task into actionable steps.
- Implement each step immediately, using best practices and clear, maintainable code.
- Only ask for clarification if absolutely necessary.
- Avoid repeating questions or waiting for user approval between steps.
- Continue until the task is fully completed, tested, and ready for review.
- Summarize what was done at the end, and suggest next steps if relevant: Create Student Course Details Page: Comprehensive Implementation Plan

This plan details how to build a robust, modern, and responsive course details page for students, leveraging React, MUI, and best practices for state management, backend integration, and UI/UX.

---

## 1. **Page Structure & Main Components**

### a. **File Structure & Component Responsibilities**

```
/student-course-details-page/
  StudentCourseDetailsPage.jsx         // Main page, fetches data, manages layout
  components/
    StudentCourseDetailHeaderSection.jsx           // Title, banner, action button, status
    StudentCourseDetailOverviewSection.jsx         // Description, objectives, what you will learn
    StudentCourseDetailProgressStats.jsx           // Progress bar, streak, points, next lesson
    StudentCourseDetailContentOutline.jsx          // Modules, lessons, expand/collapse, progress
    StudentCourseDetailMaterialsDialog.jsx         // Modal for downloadable resources
    StudentCourseDetailInstructorInfo.jsx          // Instructor bio, contact
    StudentCourseDetailReviewsSection.jsx          // Reviews, ratings, add/edit modal
    StudentCourseDetailSupportDialog.jsx           // Modal for support/contact/FAQ
    ... (other modular components)
  styles/
    courseDetailsPage.css       // Custom styles, overrides
  utils/
    useCourseData.js            // Custom hook for fetching course, modules, progress
```

---

## 2. **Context Usage: Accessing Student Data, User, and Theme**

### a. **Import and Use Contexts from `/src/contexts`**

- **User Context**: For current user info, role, and authentication
  ```js
  import { useUser } from "../../contexts/UserContext";
  const { userData, isStudent } = useUser();
  ```
- **Theme Context**: For theme, dark/light mode, and palette
  ```js
  import { useTheme } from "@mui/material/styles";
  const theme = useTheme();
  ```
- **Student Course Context**: For course data and methods
  ```js
  import { useStudentCourse } from "../../contexts/studentCourseContext";
  const { getCourseById, getAllCourses } = useStudentCourse();
  ```
- **Student Module Context**: For modules in the course
  ```js
  import { useStudentModule } from "../../contexts/studentModuleContext";
  const { getModulesByCourse } = useStudentModule();
  ```
- **Student Lesson Context**: For lessons and lesson progress
  ```js
  import { useStudentLesson } from "../../contexts/studentLessonContext";
  const { getLessonsByModule } = useStudentLesson();
  ```
- **Student Task Context**: For tasks/assignments
  ```js
  import { useStudentTask } from "../../contexts/studentTaskContext";
  const { getTasksByLesson } = useStudentTask();
  ```
- **Student Achievement Context**: For achievements and badges
  ```js
  import { useStudentAchievement } from "../../contexts/studentAchievementContext";
  const { getUserAchievements } = useStudentAchievement();
  ```
- **Other Contexts**: Use as needed for notifications, messages, vocabulary, etc.

### b. **Combining Contexts in the Main Page**

```js
// StudentCourseDetailsPage.jsx
import { useUser } from "../../contexts/UserContext";
import { useStudentCourse } from "../../contexts/studentCourseContext";
import { useStudentModule } from "../../contexts/studentModuleContext";
import { useStudentLesson } from "../../contexts/studentLessonContext";
import { useStudentTask } from "../../contexts/studentTaskContext";
import { useStudentAchievement } from "../../contexts/studentAchievementContext";
// ...other imports

const StudentCourseDetailsPage = () => {
  const { userData, isStudent } = useUser();
  const { getCourseById } = useStudentCourse();
  const { getModulesByCourse } = useStudentModule();
  const { getLessonsByModule } = useStudentLesson();
  const { getTasksByLesson } = useStudentTask();
  const { getUserAchievements } = useStudentAchievement();
  // ...fetch and manage state as needed
};
```

### c. **Passing Context Data to Subcomponents**

- Fetch data in the main page and pass as props, or let subcomponents use the same context hooks if they need to fetch/manage their own data.
- Example:

```js
<StudentCourseDetailHeaderSection course={course} user={userData} />
<StudentCourseDetailProgressStats progress={progress} achievements={achievements} />
```

---

## 3. **Modals & Dialogs**

- Use MUI's `Dialog`, `Modal`, or `Drawer` for:
  - Viewing/downloading materials/resources
  - Adding/editing reviews
  - Viewing support/contact/FAQ
- Pass data and handlers as props to modals
- Use context or local state to control open/close

---

## 4. **Backend Integration: What to Send**

- **Enroll in Course**: POST `{ studentId, courseId }` to enrollments endpoint
- **Update Progress**: PATCH/POST `{ studentId, courseId, lessonId, status }` to progress endpoint
- **Submit Review**: POST `{ studentId, courseId, rating, review }` to reviews endpoint
- **Request Support**: POST `{ studentId, courseId, message }` to support endpoint
- **Fetch Data**: Use GET endpoints for course, modules, lessons, progress, reviews
- Use async/await and handle errors/loading for all requests

---

## 5. **Responsive & Modern Design Strategy**

- **Mobile-first**: Use MUI's `sx` prop and breakpoints (`xs`, `sm`, `md`, `lg`)
- **Grid/Flex Layouts**: Use MUI `Grid`, `Box`, `Stack` for layout
- **Sticky Header**: Keep course title/action visible on scroll
- **Accessible**: Use semantic HTML, ARIA labels, keyboard navigation
- **Dark/Light Mode**: Integrate with theme context
- **Skeleton Loaders**: Use MUI `Skeleton` for loading states
- **Animations**: Use MUI `Fade`, `Collapse`, or `framer-motion` for smooth transitions
- **Touch-friendly**: Large tap targets, swipeable dialogs
- **Tested on all major devices and browsers**

---

## 6. **Best Practices & Extensibility**

- **Componentization**: Each section is a self-contained component
- **Type Safety**: Use PropTypes or TypeScript
- **i18n**: All text via translation files
- **Error Boundaries**: Wrap main page/components
- **Testing**: Use React Testing Library for unit/integration tests
- **Analytics**: Track key actions (enroll, start lesson, submit review)
- **Easy to add new features**: e.g., certificates, gamification, notifications

---

## 7. **Actionable Steps**

1. **Set up route and page skeleton** (`/student/courses/:courseId`)
2. **Create main container and responsive layout**
3. **Implement and connect contexts/hooks for user, course, progress**
4. **Build HeaderSection with action button and status**
5. **Build OverviewSection with objectives, what you will learn, etc.**
6. **Build ProgressStats with progress bar, streak, points**
7. **Build ContentOutline with modules, lessons, expand/collapse**
8. **Build MaterialsDialog for resources (open from header/overview)**
9. **Build InstructorInfo and SupportDialog**
10. **Build ReviewsSection with add/edit modal**
11. **Integrate backend calls for enroll, progress, review, support**
12. **Add loading, error, and empty states everywhere**
13. **Test responsiveness and accessibility on all devices**
14. **Write unit/integration tests for all components**
15. **Document all components, props, and API calls**

---

## 8. **References**

- See `course_model.md`, `module_model.md`, `lesson_model.md`, `user_model.md` for data structure details
- Use MUI documentation for component patterns
- See `useUser`, `studentCourseContext`, `studentLessonContext`, etc. for context usage

---

**This plan ensures a scalable, maintainable, accessible, and modern course details page for students, ready for production and future growth.**
....more:
Context Usage: Accessing Student Data, User, and Theme
a. Import and Use Contexts from /src/contexts
User Context: For current user info, role, and authentication
Apply to COURSE_DETAI...
Theme Context: For theme, dark/light mode, and palette
Apply to COURSE_DETAI...
Student Course Context: For course data and methods
Apply to COURSE_DETAI...
Student Module Context: For modules in the course
Apply to COURSE_DETAI...
Student Lesson Context: For lessons and lesson progress
Apply to COURSE_DETAI...
Student Task Context: For tasks/assignments
Apply to COURSE_DETAI...
Student Achievement Context: For achievements and badges
Apply to COURSE_DETAI...
Other Contexts: Use as needed for notifications, messages, vocabulary, etc.
b. Combining Contexts in the Main Page
Apply to COURSE_DETAI...
c. Passing Context Data to Subcomponents
Fetch data in the main page and pass as props, or let subcomponents use the same context hooks if they need to fetch/manage their own data.
Example:
Apply to COURSE_DETAI... 3. Modals & Dialogs
Use MUI's Dialog, Modal, or Drawer for:
Viewing/downloading materials/resources
Adding/editing reviews
Viewing support/contact/FAQ
Pass data and handlers as props to modals
Use context or local state to control open/close 4. Backend Integration: What to Send
Enroll in Course: POST { studentId, courseId } to enrollments endpoint
Update Progress: PATCH/POST { studentId, courseId, lessonId, status } to progress endpoint
Submit Review: POST { studentId, courseId, rating, review } to reviews endpoint
Request Support: POST { studentId, courseId, message } to support endpoint
Fetch Data: Use GET endpoints for course, modules, lessons, progress, reviews
Use async/await and handle errors/loading for all requests 5. Responsive & Modern Design Strategy
Mobile-first: Use MUI's sx prop and breakpoints (xs, sm, md, lg)
Grid/Flex Layouts: Use MUI Grid, Box, Stack for layout
Sticky Header: Keep course title/action visible on scroll
Accessible: Use semantic HTML, ARIA labels, keyboard navigation
Dark/Light Mode: Integrate with theme context
Skeleton Loaders: Use MUI Skeleton for loading states
Animations: Use MUI Fade, Collapse, or framer-motion for smooth transitions
Touch-friendly: Large tap targets, swipeable dialogs
Tested on all major devices and browsers 6. Best Practices & Extensibility
Componentization: Each section is a self-contained component
Type Safety: Use PropTypes or TypeScript
i18n: All text via translation files
Error Boundaries: Wrap main page/components
Testing: Use React Testing Library for unit/integration tests
Analytics: Track key actions (enroll, start lesson, submit review)
Easy to add new features: e.g., certificates, gamification, notifications 7. Actionable Steps
Set up route and page skeleton (/student/courses/:courseId)
Create main container and responsive layout
Implement and connect contexts/hooks for user, course, progress
Build HeaderSection with action button and status
Build OverviewSection with objectives, what you will learn, etc.
Build ProgressStats with progress bar, streak, points
Build ContentOutline with modules, lessons, expand/collapse
Build MaterialsDialog for resources (open from header/overview)
Build InstructorInfo and SupportDialog
Build ReviewsSection with add/edit modal
Integrate backend calls for enroll, progress, review, support
Add loading, error, and empty states everywhere
Test responsiveness and accessibility on all devices
Write unit/integration tests for all components
Document all components, props, and API calls 8. References
See course_model.md, module_model.md, lesson_model.md, user_model.md for data structure details
Use MUI documentation for component patterns
See useUser, studentCourseContext, studentLessonContext, etc. for context usage
This plan ensures a scalable, maintainable, accessible, and modern course details page for students, ready for production and future growth.
