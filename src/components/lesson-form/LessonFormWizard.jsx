import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";

// Import step components
import LessonBasicInfoStep from "./LessonBasicInfoStep";
import LessonContentStep from "./LessonContentStep";
import LessonMediaStep from "./LessonMediaStep";
import LessonRequirementsStep from "./LessonRequirementsStep";
import LessonPreviewStep from "./LessonPreviewStep";

// Import hooks and utilities
import { useLessonForm } from "../../hooks/useLessonForm";
import { validateStep, getValidationSummary } from "../../utils/lessonFormValidation";
import {
  createLesson,
  createLessonRequirements,
  updateLessonRequirements,
} from "../../services/lessonService";

/**
 * LessonFormWizard - Main orchestrator component for lesson creation/editing
 * Replaces the monolithic CreateLessonForm.jsx with a modular, maintainable structure
 */
const LessonFormWizard = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  courseId,
  moduleId,
  dialogTitle = "Create New Lesson",
  submitLabel = "Create Lesson",
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { theme: customTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  // Use the custom lesson form hook
  const lessonForm = useLessonForm({
    initialData,
    courseId,
    moduleId,
    onSubmit,
    onClose,
  });

  const {
    formData,
    loading,
    setLoading,
    error,
    setError,
    errors,
    setErrors,
    requirementsEnabled,
    requirements,
    // All the handlers are available from the hook
    handleChange,
    handleFileChange,
    handleUrlUpload,
    handleAddObjective,
    handleRemoveObjective,
    handleAddResource,
    handleRemoveResource,
    handleAddVocabulary,
    handleRemoveVocabulary,
    handleAddGrammarFocus,
    handleRemoveGrammarFocus,
    handleAddSkill,
    handleRemoveSkill,
    handleAddActivity,
    handleRemoveActivity,
    handleRequirementsToggle,
    handleRequirementsChange,
    handleRequirementsSwitch,
    handleAddTask,
    handleRemoveTask,
    handleAddContent,
    handleRemoveContent,
    saveDraft,
    loadDraft,
    clearDraft,
    resetForm,
    isUpdate,
    hasUnsavedChanges,
    // New item states
    newObjective,
    setNewObjective,
    newResource,
    setNewResource,
    newVocabulary,
    setNewVocabulary,
    newGrammarFocus,
    setNewGrammarFocus,
    newSkill,
    setNewSkill,
    newActivity,
    setNewActivity,
    newTask,
    setNewTask,
    newContent,
    setNewContent,
  } = lessonForm;

  const steps = [
    t("createLessonForm.basicInfo", "Basic Info"),
    t("createLessonForm.content", "Content"),
    t("createLessonForm.media", "Media"),
    t("createLessonForm.requirements", "Requirements"),
    t("createLessonForm.review", "Review"),
  ];

  // Load draft when dialog opens
  useEffect(() => {
    if (open && !isUpdate) {
      loadDraft();
    }
  }, [open, isUpdate, loadDraft]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setPreviewMode(false);
      if (!isUpdate) {
        resetForm();
      }
    }
  }, [open, isUpdate, resetForm]);

  // Get validation summary for current state
  const validationSummary = getValidationSummary(
    formData,
    requirements,
    requirementsEnabled,
    t
  );

  // Validate current step
  const validateCurrentStep = () => {
    const stepErrors = validateStep(
      activeStep,
      formData,
      requirements,
      requirementsEnabled,
      t
    );
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  // Submit handler
  const handleSubmit = async () => {
    // Final validation
    const finalValidation = getValidationSummary(
      formData,
      requirements,
      requirementsEnabled,
      t
    );

    if (!finalValidation.isAllValid) {
      setError(t("createLessonForm.pleaseFixErrors", "Please fix all errors before submitting"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!formData.courseId || !formData.moduleId) {
        throw new Error(t("createLessonForm.courseIdRequired", "Course ID and Module ID are required"));
      }

      // Prepare lesson data
      const lessonData = {
        ...formData,
        duration: parseInt(formData.duration) || 0,
        order: parseInt(formData.order) || 0,
        objectives: formData.objectives.filter((obj) => obj.trim() !== ""),
        resources: formData.resources.filter((res) => res.label && res.url),
        videoUrl: formData.video?.url || "",
        audioUrl: formData.audio?.url || "",
        coverImageUrl: formData.image?.url || "",
        materials: (formData.materials || []).map((material) => ({
          name: material.name,
          url: material.url,
          type: material.type,
        })),
        updatedAt: new Date().toISOString(),
      };

      // Add creation timestamp for new lessons
      if (!isUpdate) {
        lessonData.createdAt = new Date().toISOString();
      } else {
        lessonData.id = initialData.id;
      }

      // Submit the lesson
      const result = await onSubmit(lessonData);

      if (result) {
        // Handle requirements
        const lessonId = result.id || initialData.id;
        
        if (requirementsEnabled && lessonId) {
          try {
            if (isUpdate) {
              await updateLessonRequirements(lessonId, requirements);
            } else {
              await createLessonRequirements(lessonId, requirements);
            }
          } catch (requirementsError) {
            console.error("Error handling lesson requirements:", requirementsError);
            setError(t("createLessonForm.requirementsError", "Error saving lesson requirements"));
            return;
          }
        } else if (isUpdate && lessonId) {
          // Disable requirements if they were enabled before
          try {
            await updateLessonRequirements(lessonId, { enabled: false });
          } catch (requirementsError) {
            console.error("Error disabling requirements:", requirementsError);
          }
        }

        // Clear draft and close dialog
        clearDraft();
        onClose();
      }
    } catch (err) {
      console.error("Error submitting lesson:", err);
      setError(err.message || t("createLessonForm.errorSaving", "Error saving lesson"));
    } finally {
      setLoading(false);
    }
  };

  // Close handler with draft check
  const handleClose = () => {
    if (hasUnsavedChanges() && !loading) {
      if (window.confirm(t("createLessonForm.unsavedChangesConfirm", "You have unsaved changes. Save as draft?"))) {
        saveDraft();
      }
    }
    onClose();
  };

  // Render step content
  const renderStepContent = () => {
    const commonProps = {
      formData,
      errors,
      loading,
      onFormDataChange: handleChange,
    };

    switch (activeStep) {
      case 0:
        return (
          <LessonBasicInfoStep
            {...commonProps}
            newVocabulary={newVocabulary}
            newGrammarFocus={newGrammarFocus}
            newSkill={newSkill}
            newActivity={newActivity}
            onNewVocabularyChange={(e) => setNewVocabulary(e.target.value)}
            onNewGrammarFocusChange={(e) => setNewGrammarFocus(e.target.value)}
            onNewSkillChange={(e) => setNewSkill(e.target.value)}
            onNewActivityChange={(e) => setNewActivity(e.target.value)}
            onAddVocabulary={handleAddVocabulary}
            onRemoveVocabulary={handleRemoveVocabulary}
            onAddGrammarFocus={handleAddGrammarFocus}
            onRemoveGrammarFocus={handleRemoveGrammarFocus}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onAddActivity={handleAddActivity}
            onRemoveActivity={handleRemoveActivity}
          />
        );

      case 1:
        return (
          <LessonContentStep
            {...commonProps}
            newObjective={newObjective}
            newResource={newResource}
            onNewObjectiveChange={(e) => setNewObjective(e.target.value)}
            onNewResourceChange={setNewResource}
            onAddObjective={handleAddObjective}
            onRemoveObjective={handleRemoveObjective}
            onAddResource={handleAddResource}
            onRemoveResource={handleRemoveResource}
          />
        );

      case 2:
        return (
          <LessonMediaStep
            {...commonProps}
            onFileChange={handleFileChange}
            onUrlUpload={handleUrlUpload}
            onRemoveMaterial={(index) => {
              const updatedMaterials = formData.materials.filter((_, i) => i !== index);
              handleChange("materials")({ target: { value: updatedMaterials } });
            }}
          />
        );

      case 3:
        return (
          <LessonRequirementsStep
            requirementsEnabled={requirementsEnabled}
            requirements={requirements}
            errors={errors}
            newTask={newTask}
            newContent={newContent}
            onRequirementsToggle={handleRequirementsToggle}
            onRequirementsChange={handleRequirementsChange}
            onRequirementsSwitch={handleRequirementsSwitch}
            onNewTaskChange={(e) => setNewTask(e.target.value)}
            onNewContentChange={(e) => setNewContent(e.target.value)}
            onAddTask={handleAddTask}
            onRemoveTask={handleRemoveTask}
            onAddContent={handleAddContent}
            onRemoveContent={handleRemoveContent}
          />
        );

      case 4:
        return (
          <LessonPreviewStep
            formData={formData}
            requirements={requirements}
            requirementsEnabled={requirementsEnabled}
            validationSummary={validationSummary}
            onStepChange={handleStepClick}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : customTheme.shape.borderRadius,
            maxHeight: "90vh",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${customTheme.palette.divider}`,
            pb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {dialogTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("createLessonForm.stepProgress", "Step {{current}} of {{total}}", {
                current: activeStep + 1,
                total: steps.length,
              })}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!isMobile && (
              <>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={saveDraft}
                  disabled={loading}
                  size="small"
                >
                  {t("createLessonForm.saveDraft", "Save Draft")}
                </Button>
                <Button
                  startIcon={<PreviewIcon />}
                  onClick={() => setPreviewMode(!previewMode)}
                  disabled={loading}
                  size="small"
                >
                  {t("createLessonForm.preview", "Preview")}
                </Button>
              </>
            )}
            <IconButton onClick={handleClose} disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Progress Bar */}
        {loading && <LinearProgress />}

        {/* Stepper */}
        <Box sx={{ px: 3, pt: 2 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
          >
            {steps.map((label, index) => (
              <Step 
                key={label}
                completed={validationSummary?.stepValidities?.[index]}
              >
                <StepLabel 
                  error={!validationSummary?.stepValidities?.[index] && index < activeStep}
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: "pointer" }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <DialogContent sx={{ pt: 3 }}>
          {renderStepContent()}
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            borderTop: `1px solid ${customTheme.palette.divider}`,
            px: 3,
            py: 2,
            gap: 1,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {activeStep === steps.length - 1 && !validationSummary?.isAllValid && (
              <Typography variant="body2" color="error">
                {t("createLessonForm.fixErrorsBeforeSubmit", "Please fix all errors before submitting")}
              </Typography>
            )}
          </Box>

          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
            startIcon={<ArrowBackIcon />}
          >
            {t("common.back", "Back")}
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !validationSummary?.isAllValid}
              startIcon={loading ? null : <CheckCircleIcon />}
            >
              {loading ? t("common.saving", "Saving...") : submitLabel}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={loading}
              endIcon={<ArrowForwardIcon />}
            >
              {t("common.next", "Next")}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LessonFormWizard;