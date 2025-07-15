# Lesson Management i18n Translation Prompts

## Missing Translation Keys Audit

- **Audit and Add Missing Translation Keys:**
  - Review all lesson management and course-related UI components for missing i18n translation keys, especially those reported by i18next (see below).
  - Add the following missing keys to all supported languages (en, ar, fr, etc.):
    - `courses.tabs.label`
    - `courses.lessons.selectLesson`
    - `courses.categories.foundation`
    - `lessonManagement.fields.title`
    - `lessonManagement.fields.description`
    - `lessonManagement.fields.status`
    - `lessonManagement.fields.duration`
    - `lessonManagement.fields.lastUpdated`
    - `lessonManagement.fields.actions`
    - `lessonManagement.actions.more`
  - Ensure all new UI strings are added to translation files and referenced via i18n.
  - Consider using automated scripts or CI checks to detect and report missing translation keys in the future.
  - Document the process for adding and testing new translation keys for developers.
