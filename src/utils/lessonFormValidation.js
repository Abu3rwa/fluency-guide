/**
 * Validation utilities for lesson form steps
 * Centralized validation logic extracted from CreateLessonForm.jsx
 */

/**
 * Validate step 0 - Basic Information
 * @param {Object} formData - Current form data
 * @param {Function} t - Translation function
 * @returns {Object} errors - Validation errors object
 */
export const validateBasicInfo = (formData, t) => {
  const errors = {};

  if (!formData.title || !formData.title.trim()) {
    errors.title = t("createLessonForm.titleRequired") || "Title is required";
  } else if (formData.title.length > 200) {
    errors.title = t("createLessonForm.titleTooLong") || "Title is too long (max 200 characters)";
  }

  if (!formData.description || !formData.description.trim()) {
    errors.description = t("createLessonForm.descriptionRequired") || "Description is required";
  } else if (formData.description.length > 1000) {
    errors.description = t("createLessonForm.descriptionTooLong") || "Description is too long (max 1000 characters)";
  }

  if (!formData.duration) {
    errors.duration = t("createLessonForm.durationRequired") || "Duration is required";
  } else if (formData.duration <= 0) {
    errors.duration = t("createLessonForm.durationMustBePositive") || "Duration must be positive";
  } else if (formData.duration > 480) {
    errors.duration = t("createLessonForm.durationTooLong") || "Duration cannot exceed 8 hours";
  }

  if (formData.order < 0) {
    errors.order = t("createLessonForm.orderMustBeNonNegative") || "Order must be non-negative";
  }

  return errors;
};

/**
 * Validate step 1 - Content and Objectives
 * @param {Object} formData - Current form data
 * @param {Function} t - Translation function
 * @returns {Object} errors - Validation errors object
 */
export const validateContent = (formData, t) => {
  const errors = {};

  if (!formData.content || !formData.content.trim()) {
    errors.content = t("createLessonForm.contentRequired") || "Content is required";
  } else if (formData.content.length < 50) {
    errors.content = t("createLessonForm.contentTooShort") || "Content must be at least 50 characters";
  }

  if (!formData.objectives || formData.objectives.length === 0) {
    errors.objectives = t("createLessonForm.atLeastOneObjectiveRequired") || "At least one objective is required";
  } else if (formData.objectives.some((obj) => !obj.trim())) {
    errors.objectives = t("createLessonForm.emptyObjectivesNotAllowed") || "Empty objectives are not allowed";
  } else if (formData.objectives.length > 10) {
    errors.objectives = t("createLessonForm.tooManyObjectives") || "Too many objectives (max 10)";
  }

  // Validate resources if provided
  if (formData.resources && formData.resources.length > 0) {
    const invalidResources = formData.resources.filter(
      (resource) => !resource.label?.trim() || !resource.url?.trim()
    );
    if (invalidResources.length > 0) {
      errors.resources = t("createLessonForm.incompleteResources") || "All resources must have both label and URL";
    }

    // Validate URLs
    const invalidUrls = formData.resources.filter((resource) => {
      try {
        new URL(resource.url);
        return false;
      } catch {
        return true;
      }
    });
    if (invalidUrls.length > 0) {
      errors.resources = t("createLessonForm.invalidResourceUrls") || "Some resource URLs are invalid";
    }
  }

  return errors;
};

/**
 * Validate step 2 - Media (optional step, mostly file format validation)
 * @param {Object} formData - Current form data
 * @param {Function} t - Translation function
 * @returns {Object} errors - Validation errors object
 */
export const validateMedia = (formData, t) => {
  const errors = {};

  // Media is optional, but if provided, validate formats
  const allowedVideoFormats = ['mp4', 'webm', 'ogg'];
  const allowedAudioFormats = ['mp3', 'wav', 'ogg'];
  const allowedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];

  // Validate video format if provided
  if (formData.video && formData.video.url) {
    const videoExtension = formData.video.url.split('.').pop()?.toLowerCase();
    if (videoExtension && !allowedVideoFormats.includes(videoExtension)) {
      errors.video = t("createLessonForm.invalidVideoFormat") || 
        `Invalid video format. Allowed: ${allowedVideoFormats.join(', ')}`;
    }
  }

  // Validate audio format if provided
  if (formData.audio && formData.audio.url) {
    const audioExtension = formData.audio.url.split('.').pop()?.toLowerCase();
    if (audioExtension && !allowedAudioFormats.includes(audioExtension)) {
      errors.audio = t("createLessonForm.invalidAudioFormat") || 
        `Invalid audio format. Allowed: ${allowedAudioFormats.join(', ')}`;
    }
  }

  // Validate image format if provided
  if (formData.image && formData.image.url) {
    const imageExtension = formData.image.url.split('.').pop()?.toLowerCase();
    if (imageExtension && !allowedImageFormats.includes(imageExtension)) {
      errors.image = t("createLessonForm.invalidImageFormat") || 
        `Invalid image format. Allowed: ${allowedImageFormats.join(', ')}`;
    }
  }

  // Validate materials if provided
  if (formData.materials && formData.materials.length > 20) {
    errors.materials = t("createLessonForm.tooManyMaterials") || "Too many materials (max 20)";
  }

  return errors;
};

/**
 * Validate step 3 - Requirements
 * @param {Object} requirements - Requirements configuration
 * @param {boolean} requirementsEnabled - Whether requirements are enabled
 * @param {Function} t - Translation function
 * @returns {Object} errors - Validation errors object
 */
export const validateRequirements = (requirements, requirementsEnabled, t) => {
  const errors = {};

  if (requirementsEnabled) {
    // Check if at least one requirement is specified
    const hasRequirements = 
      requirements.requiredTasks.length > 0 ||
      requirements.requiredContent.length > 0 ||
      requirements.requireVideoCompletion ||
      requirements.requireAudioCompletion ||
      requirements.requireReadingCompletion ||
      requirements.requireTaskCompletion;

    if (!hasRequirements) {
      errors.requirements = t("createLessonForm.atLeastOneRequirementRequired") || 
        "At least one requirement must be specified when requirements are enabled";
    }

    // Validate minimum score
    if (requirements.minimumScore < 0 || requirements.minimumScore > 100) {
      errors.minimumScore = t("createLessonForm.invalidMinimumScore") || 
        "Minimum score must be between 0 and 100";
    }

    // Validate required time spent
    if (requirements.requiredTimeSpent < 0) {
      errors.requiredTimeSpent = t("createLessonForm.invalidRequiredTime") || 
        "Required time spent cannot be negative";
    } else if (requirements.requiredTimeSpent > 480) {
      errors.requiredTimeSpent = t("createLessonForm.requiredTimeTooLong") || 
        "Required time cannot exceed 8 hours";
    }

    // Validate required tasks
    if (requirements.requiredTasks.some(task => !task.trim())) {
      errors.requiredTasks = t("createLessonForm.emptyTasksNotAllowed") || 
        "Empty tasks are not allowed";
    }

    // Validate required content
    if (requirements.requiredContent.some(content => !content.trim())) {
      errors.requiredContent = t("createLessonForm.emptyContentNotAllowed") || 
        "Empty content requirements are not allowed";
    }
  }

  return errors;
};

/**
 * Validate step 4 - Review (final validation)
 * @param {Object} formData - Current form data
 * @param {Object} requirements - Requirements configuration
 * @param {boolean} requirementsEnabled - Whether requirements are enabled
 * @param {Function} t - Translation function
 * @returns {Object} errors - Validation errors object
 */
export const validateReview = (formData, requirements, requirementsEnabled, t) => {
  const errors = {};

  // Run all previous validations
  const basicInfoErrors = validateBasicInfo(formData, t);
  const contentErrors = validateContent(formData, t);
  const mediaErrors = validateMedia(formData, t);
  const requirementsErrors = validateRequirements(requirements, requirementsEnabled, t);

  // Merge all errors
  Object.assign(errors, basicInfoErrors, contentErrors, mediaErrors, requirementsErrors);

  // Additional final checks
  if (!formData.courseId || !formData.moduleId) {
    errors.general = t("createLessonForm.courseModuleRequired") || 
      "Course and module must be selected";
  }

  return errors;
};

/**
 * Validate specific step based on step number
 * @param {number} step - Step number (0-4)
 * @param {Object} formData - Current form data
 * @param {Object} requirements - Requirements configuration
 * @param {boolean} requirementsEnabled - Whether requirements are enabled
 * @param {Function} t - Translation function
 * @returns {Object} errors - Validation errors object
 */
export const validateStep = (step, formData, requirements, requirementsEnabled, t) => {
  switch (step) {
    case 0:
      return validateBasicInfo(formData, t);
    case 1:
      return validateContent(formData, t);
    case 2:
      return validateMedia(formData, t);
    case 3:
      return validateRequirements(requirements, requirementsEnabled, t);
    case 4:
      return validateReview(formData, requirements, requirementsEnabled, t);
    default:
      return {};
  }
};

/**
 * Get validation summary for all steps
 * @param {Object} formData - Current form data
 * @param {Object} requirements - Requirements configuration
 * @param {boolean} requirementsEnabled - Whether requirements are enabled
 * @param {Function} t - Translation function
 * @returns {Object} validation summary with step-by-step errors and overall validity
 */
export const getValidationSummary = (formData, requirements, requirementsEnabled, t) => {
  const stepErrors = {
    0: validateBasicInfo(formData, t),
    1: validateContent(formData, t),
    2: validateMedia(formData, t),
    3: validateRequirements(requirements, requirementsEnabled, t),
    4: validateReview(formData, requirements, requirementsEnabled, t),
  };

  const stepValidities = Object.keys(stepErrors).reduce((acc, step) => {
    acc[step] = Object.keys(stepErrors[step]).length === 0;
    return acc;
  }, {});

  const isAllValid = Object.values(stepValidities).every(valid => valid);

  return {
    stepErrors,
    stepValidities,
    isAllValid,
    totalErrors: Object.values(stepErrors).reduce((total, errors) => 
      total + Object.keys(errors).length, 0
    ),
  };
};