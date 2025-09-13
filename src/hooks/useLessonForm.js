import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHybridStorage } from "../services/hybridStorageService";
import {
  createLesson,
  createLessonRequirements,
  updateLessonRequirements,
} from "../services/lessonService";

/**
 * Custom hook for managing lesson form state and operations
 * Extracted from CreateLessonForm.jsx for better maintainability
 */
export const useLessonForm = ({
  initialData = {},
  courseId,
  moduleId,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    uploadFile,
    uploadMultipleFiles,
    uploadFromURL,
    getProvider,
    isGoogleDriveAuthenticated,
  } = useHybridStorage();

  // Initialize form data with proper defaults
  const getInitialFormData = useCallback(() => ({
    courseId: courseId || initialData.courseId || "",
    moduleId: moduleId || initialData.moduleId || "",
    title: initialData.title || "",
    description: initialData.description || "",
    content: initialData.content || "",
    duration: initialData.duration || "",
    objectives: initialData.objectives || [],
    resources: initialData.resources || [],
    order: initialData.order || 0,
    video: initialData.video || null,
    audio: initialData.audio || null,
    image: initialData.image || null,
    materials: initialData.materials || [],
    type: initialData.type || "lesson",
    status: initialData.status || "draft",
    vocabulary: initialData.vocabulary || [],
    grammarFocus: initialData.grammarFocus || [],
    skills: initialData.skills || [],
    assessment: initialData.assessment || "",
    keyActivities: initialData.keyActivities || [],
    createdAt: initialData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), [courseId, moduleId, initialData]);

  // Main form state
  const [formData, setFormData] = useState(getInitialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  // Requirements state
  const [requirementsEnabled, setRequirementsEnabled] = useState(false);
  const [requirements, setRequirements] = useState({
    requiredTasks: [],
    minimumScore:  60,
    requiredContent: [],
    requiredTimeSpent: 0,
    requireVideoCompletion: false,
    requireAudioCompletion: false,
    requireReadingCompletion: false,
    requireTaskCompletion: false,
  });

  // New item states for dynamic lists
  const [newObjective, setNewObjective] = useState("");
  const [newResource, setNewResource] = useState({
    type: "link",
    label: "",
    url: "",
  });
  const [newVocabulary, setNewVocabulary] = useState("");
  const [newGrammarFocus, setNewGrammarFocus] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newContent, setNewContent] = useState("");

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData.id) {
      setFormData(getInitialFormData());
    }
  }, [initialData, getInitialFormData]);

  // Draft management
  const getDraftKey = useCallback(() => 
    `lessonDraft_${courseId}_${moduleId}`, [courseId, moduleId]
  );

  const saveDraft = useCallback(() => {
    const draftKey = getDraftKey();
    if (window.confirm(t("createLessonForm.saveDraftConfirmation"))) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [formData, getDraftKey, t]);

  const loadDraft = useCallback(() => {
    const draftKey = getDraftKey();
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        return true;
      } catch (error) {
        console.error("Error loading draft:", error);
        localStorage.removeItem(draftKey);
        return false;
      }
    }
    return false;
  }, [getDraftKey]);

  const clearDraft = useCallback(() => {
    const draftKey = getDraftKey();
    localStorage.removeItem(draftKey);
  }, [getDraftKey]);

  // Form field handlers
  const handleChange = useCallback((field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  }, [errors]);

  // File upload handlers
  const handleFileChange = useCallback((field) => async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (getProvider() === "google-drive" && !isGoogleDriveAuthenticated) {
      return;
    }

    setLoading(true);
    try {
      if (field === "materials") {
        const uploadedFiles = await uploadMultipleFiles(
          Array.from(files),
          `courses/${courseId}/modules/${moduleId}/materials`
        );
        setFormData((prev) => ({
          ...prev,
          materials: [...prev.materials, ...uploadedFiles],
        }));
      } else {
        const uploadedFile = await uploadFile(
          files[0],
          `courses/${courseId}/modules/${moduleId}/${field}`
        );
        setFormData((prev) => ({
          ...prev,
          [field]: uploadedFile,
        }));
      }
    } catch (error) {
      setError(error.message || "File upload failed");
    } finally {
      setLoading(false);
    }
  }, [uploadMultipleFiles, uploadFile, courseId, moduleId, getProvider, isGoogleDriveAuthenticated]);

  const handleUrlUpload = useCallback(async (field, url) => {
    if (getProvider() === "google-drive" && !isGoogleDriveAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      const uploadedFile = await uploadFromURL(
        url,
        `courses/${courseId}/modules/${moduleId}/${field}`
      );
      setFormData((prev) => ({
        ...prev,
        [field]: uploadedFile,
      }));
    } catch (error) {
      setError(error.message || "URL upload failed");
    } finally {
      setLoading(false);
    }
  }, [uploadFromURL, courseId, moduleId, getProvider, isGoogleDriveAuthenticated]);

  // List management handlers
  const handleAddObjective = useCallback(() => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [
          ...prev.objectives.filter((obj) => obj.trim() !== ""),
          newObjective.trim(),
        ],
      }));
      setNewObjective("");
    }
  }, [newObjective]);

  const handleRemoveObjective = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddResource = useCallback(() => {
    if (newResource.label.trim() && newResource.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        resources: [...prev.resources, { ...newResource }],
      }));
      setNewResource({ type: "link", label: "", url: "" });
    }
  }, [newResource]);

  const handleRemoveResource = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddVocabulary = useCallback(() => {
    if (newVocabulary.trim()) {
      setFormData((prev) => ({
        ...prev,
        vocabulary: [...prev.vocabulary, newVocabulary.trim()],
      }));
      setNewVocabulary("");
    }
  }, [newVocabulary]);

  const handleRemoveVocabulary = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddGrammarFocus = useCallback(() => {
    if (newGrammarFocus.trim()) {
      setFormData((prev) => ({
        ...prev,
        grammarFocus: [...prev.grammarFocus, newGrammarFocus.trim()],
      }));
      setNewGrammarFocus("");
    }
  }, [newGrammarFocus]);

  const handleRemoveGrammarFocus = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      grammarFocus: prev.grammarFocus.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  }, [newSkill]);

  const handleRemoveSkill = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddActivity = useCallback(() => {
    if (newActivity.trim()) {
      setFormData((prev) => ({
        ...prev,
        keyActivities: [...prev.keyActivities, newActivity.trim()],
      }));
      setNewActivity("");
    }
  }, [newActivity]);

  const handleRemoveActivity = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      keyActivities: prev.keyActivities.filter((_, i) => i !== index),
    }));
  }, []);

  // Requirements handlers
  const handleRequirementsToggle = useCallback((event) => {
    setRequirementsEnabled(event.target.checked);
  }, []);

  const handleRequirementsChange = useCallback((field) => (event) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  }, []);

  const handleRequirementsSwitch = useCallback((field) => (event) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  }, []);

  const handleAddTask = useCallback(() => {
    if (newTask.trim()) {
      setRequirements((prev) => ({
        ...prev,
        requiredTasks: [...prev.requiredTasks, newTask.trim()],
      }));
      setNewTask("");
    }
  }, [newTask]);

  const handleRemoveTask = useCallback((index) => {
    setRequirements((prev) => ({
      ...prev,
      requiredTasks: prev.requiredTasks.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddContent = useCallback(() => {
    if (newContent.trim()) {
      setRequirements((prev) => ({
        ...prev,
        requiredContent: [...prev.requiredContent, newContent.trim()],
      }));
      setNewContent("");
    }
  }, [newContent]);

  const handleRemoveContent = useCallback((index) => {
    setRequirements((prev) => ({
      ...prev,
      requiredContent: prev.requiredContent.filter((_, i) => i !== index),
    }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setError(null);
    setRequirementsEnabled(false);
    setRequirements({
      requiredTasks: [],
      minimumScore: 70,
      requiredContent: [],
      requiredTimeSpent: 0,
      requireVideoCompletion: false,
      requireAudioCompletion: false,
      requireReadingCompletion: false,
      requireTaskCompletion: false,
    });
    // Reset all new item states
    setNewObjective("");
    setNewResource({ type: "link", label: "", url: "" });
    setNewVocabulary("");
    setNewGrammarFocus("");
    setNewSkill("");
    setNewActivity("");
    setNewTask("");
    setNewContent("");
  }, [getInitialFormData]);

  return {
    // Form data
    formData,
    setFormData,
    loading,
    setLoading,
    errors,
    setErrors,
    error,
    setError,

    // Requirements
    requirementsEnabled,
    setRequirementsEnabled,
    requirements,
    setRequirements,

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

    // Handlers
    handleChange,
    handleFileChange,
    handleUrlUpload,

    // List management
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

    // Requirements
    handleRequirementsToggle,
    handleRequirementsChange,
    handleRequirementsSwitch,
    handleAddTask,
    handleRemoveTask,
    handleAddContent,
    handleRemoveContent,

    // Utilities
    saveDraft,
    loadDraft,
    clearDraft,
    resetForm,

    // Computed properties
    isUpdate: initialData && initialData.id,
    hasUnsavedChanges: () => {
      const initial = getInitialFormData();
      return JSON.stringify(formData) !== JSON.stringify(initial);
    },
  };
};