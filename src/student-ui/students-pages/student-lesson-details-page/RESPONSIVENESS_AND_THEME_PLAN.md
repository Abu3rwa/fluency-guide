# Responsiveness & Theming Plan for Student Lesson Details Page

## 1. **Overall Goals**

- Ensure the Lesson Details Page is fully responsive (mobile-first, works on all screen sizes).
- Use the app's theme (from ThemeContext.js) for all colors, typography, spacing, and component overrides.
- Maintain accessibility and a modern, visually appealing UI.

---

## 2. **Layout & Structure**

- Use MUI's `Box`, `Grid`, and `Stack` components for layout.
- Main container: `maxWidth="md"` or `lg`, with responsive horizontal padding (`px: { xs: 1, sm: 2, md: 4 }`).
- Sections stack vertically on mobile (`xs`), side-by-side or grouped on `md+` screens where appropriate.
- Use `sx` prop for responsive spacing, e.g. `py: { xs: 2, md: 4 }`.
- Sticky/fixed header: Use `position: 'sticky'`, `top: 0`, and theme background/shadow.

---

## 3. **Theming**

- Use `useTheme()` from MUI to access the app theme in every component.
- All colors, backgrounds, and borders should use `theme.palette` values.
- All font sizes, weights, and families should use `theme.typography` values.
- Use `theme.spacing()` for all margins and paddings.
- Use `theme.shape.borderRadius` for all cards, buttons, and containers.
- Use `theme.shadows` for elevation where needed.
- Support both light and dark modes (no hardcoded colors).

---

## 4. **Component-Specific Recommendations**

### **Header Section**

- Responsive padding and font size.
- Truncate long titles with ellipsis on small screens.
- Use theme colors for background and text.

### **Media Player**

- Media (video/audio) should be 100% width, with max height on mobile.
- Use `borderRadius` and `boxShadow` from theme.
- Stack multiple media vertically with spacing.

### **Objectives, Vocabulary, Grammar, Skills**

- Use `List` with responsive padding.
- Typography should use theme variants.
- On mobile, lists are full width; on desktop, can be in a side panel or grid.

### **Content Section**

- Use `Typography` with theme font and color.
- Responsive font size for readability.
- Images in content should be max-width 100% and responsive.

### **Resources Panel**

- Use `List` or `Grid` for files/links.
- Responsive layout: stack on mobile, grid on desktop.
- Use theme for icons, links, and backgrounds.

### **Actions Bar**

- Buttons should be full width on mobile, inline on desktop.
- Use theme colors, border radius, and spacing.

### **Instructor & Support**

- Card layout with theme background, border radius, and shadow.
- Responsive: stack vertically on mobile, side-by-side on desktop.

---

## 5. **Accessibility & RTL**

- All interactive elements must be keyboard accessible.
- Use semantic HTML and ARIA labels.
- Support RTL layout for Arabic (MUI's direction and theme).
- Ensure color contrast meets accessibility standards.

---

## 6. **Actionable Steps**

1. Audit all components for hardcoded styles; replace with theme values and responsive `sx` props.
2. Use MUI's `useMediaQuery` for any custom breakpoint logic.
3. Test all breakpoints (`xs`, `sm`, `md`, `lg`, `xl`) and RTL mode.
4. Add/adjust `sx` props for spacing, font size, and layout in each component.
5. Use `theme.palette.background.default` and `theme.palette.background.paper` for backgrounds.
6. Use `theme.typography` for all text.
7. Use `theme.spacing()` and `theme.shape.borderRadius` for all spacing and corners.
8. Add visual polish: hover/focus states, shadows, transitions using theme.
9. Test with real data and in both light/dark modes.

---

## 7. **Testing & Review**

- Test on all device sizes (mobile, tablet, desktop).
- Test in both LTR and RTL modes.
- Test with both light and dark themes.
- Use browser dev tools to simulate devices and check for overflow, wrapping, and touch targets.

---

**By following this plan, the Student Lesson Details Page will be fully responsive, visually consistent, and accessible, providing a modern and delightful user experience.**
