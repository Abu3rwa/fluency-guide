import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
} from "@mui/material";

const ResourceDialog = ({
  open,
  onClose,
  mode,
  title,
  fields,
  formData,
  onFormChange,
  onSubmit,
  loading = false,
  validationSchema,
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setTouched({});
    }
  }, [open]);

  const validateField = async (name, value) => {
    if (!validationSchema) return null;

    try {
      await validationSchema.validateAt(name, { [name]: value });
      return null;
    } catch (error) {
      return error.message;
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    const field = fields.find((f) => f.id === name);

    if (field && field.type === "number") {
      processedValue = parseInt(value, 10);
      if (isNaN(processedValue)) {
        processedValue = 0;
      }
    }

    // Update form data
    onFormChange({ ...formData, [name]: processedValue });

    // Validate field if touched
    if (touched[name]) {
      const fieldError = await validateField(name, processedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    const allTouched = {};
    fields.forEach((field) => {
      allTouched[field.id] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    if (validationSchema) {
      try {
        await validationSchema.validate(formData, { abortEarly: false });
        setErrors({});
        onSubmit();
      } catch (validationErrors) {
        const newErrors = {};
        validationErrors.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      }
    } else {
      onSubmit();
    }
  };
  console.log("ResourceDialog formData:", formData);
  const hasErrors = Object.keys(errors).length > 0;
  console.log("ResourceDialog errors:", errors);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="resource-dialog-title"
      aria-describedby="resource-dialog-description"
    >
      <DialogTitle id="resource-dialog-title">
        {`${mode === "create" ? "Create" : "Edit"} ${title}`}
      </DialogTitle>
      <DialogContent id="resource-dialog-description">
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {fields.map((field) => (
            <Grid item xs={12} sm={field.sm || 6} key={field.id}>
              {field.type === "select" ? (
                <FormControl
                  fullWidth
                  error={!!errors[field.id]}
                  required={field.required}
                >
                  <InputLabel id={`${field.id}-label`}>
                    {field.label}
                  </InputLabel>
                  <Select
                    labelId={`${field.id}-label`}
                    name={field.id}
                    value={formData[field.id] || ""}
                    onChange={handleChange}
                    onBlur={() => handleBlur(field.id)}
                    label={field.label}
                    aria-describedby={
                      errors[field.id] ? `${field.id}-error` : undefined
                    }
                  >
                    {field.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[field.id] && (
                    <FormHelperText id={`${field.id}-error`}>
                      {errors[field.id]}
                    </FormHelperText>
                  )}
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  multiline={field.multiline}
                  rows={field.rows}
                  name={field.id}
                  label={field.label}
                  type={field.type || "text"}
                  value={formData[field.id] || ""}
                  onChange={handleChange}
                  onBlur={() => handleBlur(field.id)}
                  error={!!errors[field.id]}
                  helperText={errors[field.id]}
                  required={field.required}
                  disabled={loading}
                  aria-describedby={
                    errors[field.id] ? `${field.id}-error` : undefined
                  }
                />
              )}
            </Grid>
          ))}
        </Grid>
        {hasErrors && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Please fix the errors above before submitting.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} aria-label="Cancel">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || hasErrors}
          aria-label={`${mode === "create" ? "Create" : "Update"} ${title}`}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            `${mode === "create" ? "Create" : "Update"}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ResourceDialog);
