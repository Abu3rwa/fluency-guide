# Import Path Fix Plan

## Problem Analysis

The React build system is failing with the following errors:

```
Module not found: Error: You attempted to import ../../../../../services/student-services/studentAudioService which falls outside of the project src/ directory. Relative imports outside of src/ are not supported.
```

## Root Cause

Two components are using incorrect relative import paths that attempt to navigate outside the `src/` directory:

### File 1: StudentVocabularyWordCard.js

- **Location**: `src/student-ui/students-pages/student-vocabulary-building-page/components/StudentVocabularyWordCard.js`
- **Current Import** (Line 35): `../../../../../services/student-services/studentAudioService`
- **Issue**: This path goes: `components/` → `student-vocabulary-building-page/` → `students-pages/` → `student-ui/` → `src/` → `root/` → `services/` (exits src/)

### File 2: StudentPronunciationDialog.js

- **Location**: `src/student-ui/students-pages/student-vocabulary-building-page/components/dialogs/StudentPronunciationDialog.js`
- **Current Import** (Line 38): `../../../../../../services/student-services/studentAudioService`
- **Issue**: This path goes: `dialogs/` → `components/` → `student-vocabulary-building-page/` → `students-pages/` → `student-ui/` → `src/` → `root/` → `services/` (exits src/)

## Solution

The target service exists at the correct location within src/:

- **Target**: `src/services/student-services/studentAudioService.js`

### Correct Import Paths

**For StudentVocabularyWordCard.js:**

```javascript
// Change from:
import studentAudioService from "../../../../../services/student-services/studentAudioService";

// To:
import studentAudioService from "../../../../services/student-services/studentAudioService";
```

**For StudentPronunciationDialog.js:**

```javascript
// Change from:
import studentAudioService from "../../../../../../services/student-services/studentAudioService";

// To:
import studentAudioService from "../../../../../services/student-services/studentAudioService";
```

## Path Calculation Logic

### For StudentVocabularyWordCard.js:

- From: `src/student-ui/students-pages/student-vocabulary-building-page/components/`
- To: `src/services/student-services/`
- Steps: `components/` → `student-vocabulary-building-page/` → `students-pages/` → `student-ui/` → `src/` → `services/student-services/`
- Path: `../../../../services/student-services/studentAudioService`

### For StudentPronunciationDialog.js:

- From: `src/student-ui/students-pages/student-vocabulary-building-page/components/dialogs/`
- To: `src/services/student-services/`
- Steps: `dialogs/` → `components/` → `student-vocabulary-building-page/` → `students-pages/` → `student-ui/` → `src/` → `services/student-services/`
- Path: `../../../../../services/student-services/studentAudioService`

## Implementation Steps

1. ✅ Analyze current incorrect import paths
2. ✅ Calculate correct relative import paths
3. 🔄 Fix import path in StudentVocabularyWordCard.js
4. 🔄 Fix import path in StudentPronunciationDialog.js
5. 🔄 Verify corrected import paths are valid
6. 🔄 Test compilation to ensure errors are resolved
7. 🔄 Document the fix for future reference

## Best Practices for Future Imports

1. **Always stay within src/**: Ensure all relative imports remain within the `src/` directory
2. **Use absolute imports**: Consider using absolute imports from `src/` root for deeply nested components
3. **Verify paths**: Double-check import paths by counting directory levels carefully
4. **Test compilation**: Always test that imports work before committing changes

## Alternative Solutions

If relative paths become too complex, consider:

1. **Absolute imports**: Configure path mapping in `jsconfig.json` or `tsconfig.json`
2. **Barrel exports**: Create index files to simplify import paths
3. **Move services**: Relocate commonly used services to reduce path complexity
