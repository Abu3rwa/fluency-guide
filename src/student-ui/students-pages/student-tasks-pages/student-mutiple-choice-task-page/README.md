# Student Multiple Choice Task Page - Modular Structure

This directory contains a modular implementation of the multiple choice task page, designed for better maintainability, testability, and code organization.

## 📁 Directory Structure

```
student-mutiple-choice-task-page/
├── components/                    # UI Components
│   ├── index.js                  # Component exports
│   ├── ResumeDialog.jsx          # Resume quiz dialog
│   ├── InstructionsAlert.jsx     # Instructions alert
│   ├── KeyboardShortcuts.jsx     # Keyboard shortcuts help
│   ├── ScreenReaderAnnouncements.jsx # Accessibility announcements
│   ├── NotificationSnackbar.jsx  # Notification system
│   ├── LoadingState.jsx          # Loading and error states
│   └── QuizContent.jsx           # Main quiz content
├── hooks/                        # Custom Hooks
│   └── useMultipleChoiceQuiz.js  # Main quiz logic hook
├── StudentMultipleChoiceTaskPage.jsx  # Main component (refactored)
├── StudentMultipleChoiceQuestionCard.jsx  # Question display
├── StudentMultipleChoiceOption.jsx       # Individual option
├── StudentMultipleChoiceFeedbackSection.jsx # Answer feedback
└── Flutter_to_React_Multiple_Choice_Migration_Plan.md
```

## 🏗️ Architecture Overview

### **Separation of Concerns**

The original monolithic component (879 lines) has been broken down into:

1. **Custom Hook** (`useMultipleChoiceQuiz.js`) - All business logic and state management
2. **UI Components** - Focused, reusable components for specific UI elements
3. **Main Component** (`StudentMultipleChoiceTaskPage.jsx`) - Clean orchestration layer

### **Benefits of Modularization**

✅ **Maintainability**: Each component has a single responsibility
✅ **Testability**: Components can be tested in isolation
✅ **Reusability**: Components can be reused across different task types
✅ **Readability**: Smaller, focused files are easier to understand
✅ **Performance**: Better code splitting and lazy loading opportunities

## 🔧 Components Breakdown

### **Custom Hook: `useMultipleChoiceQuiz`**

**Purpose**: Centralized state management and business logic
**Responsibilities**:

- Task data fetching and caching
- Quiz state management (answers, progress, timer)
- Network status monitoring
- Progress persistence
- Audio feedback
- Navigation logic
- Resume/restart functionality

**Key Features**:

- Comprehensive error handling with retry logic
- Automatic progress saving
- Network status monitoring
- Timer management with auto-submission
- Audio feedback integration

### **UI Components**

#### **`ResumeDialog.jsx`**

- Handles quiz resume functionality
- Clean dialog interface
- Internationalization support

#### **`InstructionsAlert.jsx`**

- Displays contextual instructions
- Mobile/desktop responsive
- Dismissible interface

#### **`KeyboardShortcuts.jsx`**

- Desktop-only keyboard shortcuts help
- Hover-activated display
- Accessibility-focused

#### **`ScreenReaderAnnouncements.jsx`**

- Screen reader accessibility
- Live region updates
- Question progress announcements

#### **`NotificationSnackbar.jsx`**

- Global notification system
- Multiple severity levels
- Auto-dismiss functionality

#### **`LoadingState.jsx`**

- Loading spinner and messages
- Error state handling
- Retry mechanism display

#### **`QuizContent.jsx`**

- Main quiz question display
- Feedback integration
- Question validation

## 🚀 Usage

### **Importing Components**

```javascript
import { useMultipleChoiceQuiz } from "./hooks/useMultipleChoiceQuiz";
import {
  ResumeDialog,
  InstructionsAlert,
  KeyboardShortcuts,
  // ... other components
} from "./components";
```

### **Using the Custom Hook**

```javascript
const {
  // State
  task,
  loading,
  error,
  currentQuestion,
  selectedAnswer,

  // Actions
  handleAnswer,
  handleNext,
  handleSubmit,
  // ... other actions
} = useMultipleChoiceQuiz();
```

## 🧪 Testing Strategy

### **Component Testing**

Each component can be tested independently:

```javascript
// Example: Testing ResumeDialog
import { render, screen } from "@testing-library/react";
import ResumeDialog from "./components/ResumeDialog";

test("renders resume dialog with correct options", () => {
  render(
    <ResumeDialog
      open={true}
      onClose={jest.fn()}
      onResume={jest.fn()}
      onStartOver={jest.fn()}
    />
  );

  expect(screen.getByText("Resume Quiz?")).toBeInTheDocument();
  expect(screen.getByText("Resume")).toBeInTheDocument();
  expect(screen.getByText("Start Over")).toBeInTheDocument();
});
```

### **Hook Testing**

The custom hook can be tested using `@testing-library/react-hooks`:

```javascript
import { renderHook, act } from "@testing-library/react-hooks";
import { useMultipleChoiceQuiz } from "./hooks/useMultipleChoiceQuiz";

test("handles answer selection correctly", () => {
  const { result } = renderHook(() => useMultipleChoiceQuiz());

  act(() => {
    result.current.handleAnswer("question1", "optionA");
  });

  expect(result.current.selectedAnswer).toBe("optionA");
});
```

## 🔄 Migration from Monolithic Structure

The refactoring maintains 100% backward compatibility while providing:

1. **Better Code Organization**: Logic separated from presentation
2. **Improved Maintainability**: Smaller, focused files
3. **Enhanced Testability**: Isolated components and hooks
4. **Future Extensibility**: Easy to add new features or modify existing ones

## 📋 File Size Comparison

| File           | Original Size | New Size  | Reduction |
| -------------- | ------------- | --------- | --------- |
| Main Component | 879 lines     | 157 lines | 82%       |
| Custom Hook    | -             | 350 lines | New       |
| UI Components  | -             | 7 files   | Modular   |

## 🎯 Next Steps

1. **Add Unit Tests**: Create comprehensive test suites for each component
2. **Performance Optimization**: Implement React.memo for pure components
3. **TypeScript Migration**: Add TypeScript for better type safety
4. **Storybook Integration**: Create component stories for documentation
5. **Accessibility Audit**: Ensure all components meet WCAG guidelines

## 🤝 Contributing

When adding new features:

1. **Add to Custom Hook**: Business logic goes in `useMultipleChoiceQuiz`
2. **Create UI Component**: Presentation logic goes in separate components
3. **Update Main Component**: Orchestrate new features in main component
4. **Add Tests**: Ensure new functionality is properly tested
5. **Update Documentation**: Keep this README current
