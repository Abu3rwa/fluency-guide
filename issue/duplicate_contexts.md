## Duplicate Contexts

There appear to be duplicate or redundant React context files:
- `src/contexts/AuthContext.js`
- `src/contexts/AuthContext.jsx`
- `src/contexts/ThemeContext.js`
- `src/theme/ThemeContext.js`

This can lead to confusion about which context to use and potential state management issues.

**Recommendation:** Consolidate these into a single source of truth for each context.