# Minimum Width Update for Task Option Cards

## Changes Made
Updated all task option cards across all task types to have a minimum width of 250px for consistency and better visual presentation.

## Files Modified

### 1. Multiple Choice Task
- **StudentMultipleChoiceQuestionCard.jsx**: 
  - Added `minWidth: 250` to RadioGroup container
  - Added `minWidth: 250` to individual FormControlLabel components
- **StudentMultipleChoiceOption.jsx**: 
  - Added `minWidth: 250` to individual option cards

### 2. Fill-in-Blanks Task
- **StudentFillInBlanksOptionList.jsx**: 
  - Added `minWidth: 250` to option buttons

### 3. True/False Task
- **StudentTrueFalseAnswerButtons.jsx**: 
  - Updated `minWidth` from 120 to 250 for both True and False buttons

## Benefits
- **Consistent UI**: All option cards now have the same minimum width
- **Better Visual Hierarchy**: Options are more prominent and easier to interact with
- **Improved Accessibility**: Larger touch targets for mobile users
- **Professional Appearance**: More polished and uniform look across all task types

## Testing
All changes have been tested for linting errors and maintain existing functionality while improving visual consistency.
