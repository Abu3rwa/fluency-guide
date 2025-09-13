import React from 'react';
import LessonFormWizard from './lesson-form/LessonFormWizard';

/**
 * CreateLessonForm - Backward compatibility wrapper
 * 
 * This component maintains the same API as the original CreateLessonForm.jsx
 * but uses the new modular LessonFormWizard internally.
 * 
 * This allows for seamless integration without breaking existing code.
 */
const CreateLessonForm = (props) => {
  return <LessonFormWizard {...props} />;
};

export default CreateLessonForm;