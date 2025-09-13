# Session Hooks Architecture

This directory contains custom React hooks that separate business logic from UI components in the session management system. Following the project's architectural patterns, these hooks provide reusable logic for various session-related operations.

## 🏗️ Architecture Overview

The hooks follow the **Separation of Concerns** principle, extracting complex logic from UI components to improve:
- **Maintainability**: Logic is centralized and reusable
- **Testability**: Hooks can be tested independently 
- **Readability**: Components focus purely on presentation
- **Reusability**: Logic can be shared across multiple components

## 📚 Available Hooks

### `useInstructorProfile`
Manages instructor profile form state and operations.

**Purpose**: Handles profile editing, validation, and persistence logic.

**Usage**:
```javascript
import { useInstructorProfile } from '../hooks';

const ProfileComponent = ({ instructor, onSave }) => {
  const {
    isEditing,
    formData,
    setIsEditing,
    handleChange,
    handleArrayChange,
    handleAddField,
    handleRemoveField,
    updateProfileImage,
    saveProfile,
    cancelEdit
  } = useInstructorProfile(instructor);
  
  const handleSave = () => {
    const result = saveProfile(onSave);
    if (!result.success) {
      console.error('Validation errors:', result.errors);
    }
  };
};
```

**Features**:
- Form state management with validation
- Array field operations (qualifications, subjects, specialties)
- Profile image updates
- Form reset and cancellation

---

### `useImageUpload`
Handles image file upload functionality with validation and progress tracking.

**Purpose**: Provides complete image upload workflow with error handling.

**Usage**:
```javascript
import { useImageUpload } from '../hooks';

const ImageUploadComponent = () => {
  const {
    uploading,
    uploadError,
    uploadProgress,
    previewUrl,
    fileInputRef,
    handleFileUpload,
    triggerUpload,
    clearUpload
  } = useImageUpload({
    onUploadSuccess: (imageUrl) => {
      console.log('Upload successful:', imageUrl);
    },
    onUploadError: (error) => {
      console.error('Upload failed:', error);
    },
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png']
  });
};
```

**Features**:
- File type and size validation
- Upload progress tracking
- Preview URL generation
- Error handling and recovery
- Configurable size limits and file types

---

### `useAvailabilityManager`
Manages instructor availability scheduling with conflict detection.

**Purpose**: Handles time slot selection, recurring patterns, and availability conflicts.

**Usage**:
```javascript
import { useAvailabilityManager } from '../hooks';

const AvailabilityComponent = ({ currentAvailability, onSave }) => {
  const {
    selectedDate,
    selectedSlots,
    conflictWarning,
    weekDates,
    TIME_SLOTS,
    handleDateSelect,
    handleSlotSelect,
    isSlotAvailable,
    saveAvailability,
    clearSelections
  } = useAvailabilityManager(currentAvailability);
  
  const handleSave = () => {
    const result = saveAvailability(onSave);
    if (!result.success) {
      console.error('Save failed:', result.error);
    }
  };
};
```

**Features**:
- Time slot conflict detection
- Recurring pattern support
- Timezone handling (Libya/UTC+2)
- Week-based date selection
- Validation and error reporting

---

### `useSessionBooking`
Manages the complete session booking flow from selection to confirmation.

**Purpose**: Handles multi-step booking process with validation and form management.

**Usage**:
```javascript
import { useSessionBooking } from '../hooks';

const BookingComponent = () => {
  const {
    step,
    loading,
    sessionTypes,
    selectedSessionType,
    selectedDate,
    selectedTime,
    guestInfo,
    errors,
    loadSessionTypes,
    handleSessionSelect,
    handleGuestInfoChange,
    setSelectedDate,
    setSelectedTime,
    submitBooking,
    resetBookingForm
  } = useSessionBooking({
    onBookingSuccess: (bookingDetails) => {
      console.log('Booking successful:', bookingDetails);
    },
    onBookingError: (error) => {
      console.error('Booking failed:', error);
    }
  });
  
  useEffect(() => {
    loadSessionTypes();
  }, []);
};
```

**Features**:
- Multi-step booking workflow
- Session type loading with instructor info
- Form validation (date, time, contact info)
- Guest information management
- Booking submission and confirmation

---

### `useSessionTypes`
Manages session types data with filtering and CRUD operations.

**Purpose**: Provides comprehensive session types management functionality.

**Usage**:
```javascript
import { useSessionTypes } from '../hooks';

const SessionTypesComponent = () => {
  const {
    sessionTypes,
    loading,
    error,
    filteredSessionTypes,
    uniqueInstructors,
    loadSessionTypes,
    loadPublicSessionTypes,
    createSessionType,
    updateSessionType,
    deleteSessionType,
    updateFilters,
    clearFilters
  } = useSessionTypes({
    autoLoad: true,
    includeInstructorInfo: true
  });
  
  // Component logic here
};
```

**Features**:
- CRUD operations for session types
- Instructor information integration  
- Advanced filtering capabilities
- Public/active session type queries
- Error handling and loading states

## 🔧 Integration Patterns

### Theme Integration
All hooks properly integrate with the project's theme system:

```javascript
import { useTheme } from '@mui/material/styles';

const Component = () => {
  const theme = useTheme();
  // Use theme.palette.primary.main, theme.shadows, etc.
};
```

### Internationalization
Hooks use the translation system for all user-facing messages:

```javascript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
const errorMessage = t('validation.required', 'This field is required');
```

### Error Handling
Consistent error handling patterns across all hooks:

```javascript
const result = await someOperation();
if (!result.success) {
  console.error('Operation failed:', result.error);
  // Handle error appropriately
}
```

## 🧪 Testing Strategy

Each hook can be tested independently using React Testing Library:

```javascript
import { renderHook, act } from '@testing-library/react';
import { useInstructorProfile } from '../useInstructorProfile';

test('should update form data when handleChange is called', () => {
  const { result } = renderHook(() => useInstructorProfile(mockInstructor));
  
  act(() => {
    result.current.handleChange({ target: { name: 'bio', value: 'New bio' } });
  });
  
  expect(result.current.formData.bio).toBe('New bio');
});
```

## 📁 File Structure

```
src/components/sessions/hooks/
├── index.js                    # Hook exports
├── useInstructorProfile.js     # Profile management
├── useImageUpload.js          # Image upload functionality
├── useAvailabilityManager.js  # Availability scheduling
├── useSessionBooking.js       # Booking workflow
├── useSessionTypes.js         # Session types management
└── README.md                  # This documentation
```

## 🚀 Migration Guide

To convert existing components to use these hooks:

1. **Identify Logic**: Find state management and business logic in components
2. **Extract State**: Move useState calls to appropriate hooks
3. **Extract Handlers**: Move event handlers and operations to hooks  
4. **Import Hook**: Import and use the relevant hook
5. **Update JSX**: Use hook returns in component render

### Before (Component with embedded logic):
```javascript
const Component = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleSave = async () => {
    setLoading(true);
    // Complex save logic here
    setLoading(false);
  };
  
  return <div>{/* JSX */}</div>;
};
```

### After (Component using hook):
```javascript
const Component = () => {
  const { data, loading, saveData } = useCustomHook();
  
  return <div>{/* JSX */}</div>;
};
```

## 🔄 Future Enhancements

- **Real Firebase Integration**: Replace simulated operations with actual Firebase calls
- **Caching**: Add React Query integration for data caching
- **Optimistic Updates**: Implement optimistic UI updates
- **Background Sync**: Add offline support and background synchronization
- **Advanced Validation**: Implement schema-based validation with Yup or Zod

## 📖 Best Practices

1. **Keep Hooks Focused**: Each hook should have a single responsibility
2. **Use TypeScript**: Add type definitions for better development experience  
3. **Handle Loading States**: Always provide loading and error states
4. **Memory Cleanup**: Clean up subscriptions and timeouts in useEffect
5. **Consistent APIs**: Follow similar patterns across all hooks
6. **Documentation**: Document complex logic and API surfaces

This architecture ensures scalable, maintainable, and testable code that follows React and project best practices.