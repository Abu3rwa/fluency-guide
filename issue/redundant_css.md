## Redundant and Poorly Organized CSS

The project has multiple CSS files scattered across different directories, including:
- `bootstrap.min.css`
- `index.css`
- `src/components/courseCard.css`
- `src/components/coursesTable.css`
- `src/components/createTaskForm.css`
- `src/components/spinner.css`
- `src/components/studentsTable.css`
- `src/components/studentStatsCharts.css`
- `src/screens/courseDetails.css`
- `src/screens/dashboard.css`
- `src/screens/landing.css`
- `src/screens/singleCourseScreen.css`
- `src/utils/commonStyle.css`

This makes it difficult to manage styles and can lead to inconsistencies.

**Recommendation:** Refactor the CSS by adopting a more organized approach like CSS-in-JS (e.g., styled-components) or a CSS methodology like BEM.