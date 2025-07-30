import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Save,
  RestoreFromTrash,
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

/**
 * Draft Recovery Notification Component
 * Shows when a saved draft is found and allows user to restore or dismiss it
 */
export const DraftRecoveryNotification = ({
  notification,
  onRestore,
  onDismiss,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!notification || !notification.show) {
    return null;
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("tasks.draft.justNow");
    if (diffMins < 60) return t("tasks.draft.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("tasks.draft.hoursAgo", { count: diffHours });
    return t("tasks.draft.daysAgo", { count: diffDays });
  };

  const getFormTypeLabel = (formType) => {
    switch (formType) {
      case "multipleChoice":
        return t("tasks.form.multipleChoice");
      case "trueFalse":
        return t("tasks.form.trueFalse");
      case "fillInBlanks":
        return t("tasks.form.fillInBlanks");
      default:
        return formType;
    }
  };

  return (
    <Alert
      severity="info"
      sx={{
        mb: 2,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onClose}
        >
          <Close fontSize="inherit" />
        </IconButton>
      }
    >
      <AlertTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <RestoreFromTrash fontSize="small" />
          {t("tasks.draft.recoveryTitle")}
        </Box>
      </AlertTitle>

      <Typography variant="body2" sx={{ mb: 2 }}>
        {t("tasks.draft.recoveryMessage", {
          formType: getFormTypeLabel(notification.formType),
          time: formatTimestamp(notification.timestamp),
        })}
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap">
        <Button
          variant="contained"
          size="small"
          startIcon={<RestoreFromTrash />}
          onClick={onRestore}
          sx={{ minWidth: "auto" }}
        >
          {t("tasks.draft.restore")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onDismiss}
          sx={{ minWidth: "auto" }}
        >
          {t("tasks.draft.startFresh")}
        </Button>
      </Box>
    </Alert>
  );
};

/**
 * Auto-Save Status Component
 * Shows current auto-save status (saving, saved, error)
 */
export const AutoSaveStatus = ({ status, className }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!status) {
    return null;
  }

  const { saving, lastSaved, error } = status;

  const getStatusConfig = () => {
    if (saving) {
      return {
        color: "info",
        icon: <Save fontSize="small" />,
        text: t("tasks.draft.saving"),
        variant: "outlined",
      };
    }

    if (error) {
      return {
        color: "error",
        icon: <Error fontSize="small" />,
        text: t("tasks.draft.saveError"),
        variant: "filled",
      };
    }

    if (lastSaved) {
      const savedTime = new Date(lastSaved);
      const now = new Date();
      const diffMs = now - savedTime;
      const diffMins = Math.floor(diffMs / 60000);

      let timeText;
      if (diffMins < 1) {
        timeText = t("tasks.draft.savedJustNow");
      } else if (diffMins < 60) {
        timeText = t("tasks.draft.savedMinutesAgo", { count: diffMins });
      } else {
        timeText = savedTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return {
        color: "success",
        icon: <CheckCircle fontSize="small" />,
        text: t("tasks.draft.savedAt", { time: timeText }),
        variant: "outlined",
      };
    }

    return null;
  };

  const statusConfig = getStatusConfig();

  if (!statusConfig) {
    return null;
  }

  return (
    <Chip
      icon={statusConfig.icon}
      label={statusConfig.text}
      color={statusConfig.color}
      variant={statusConfig.variant}
      size="small"
      className={className}
      sx={{
        "& .MuiChip-icon": {
          fontSize: "16px",
        },
        fontSize: "0.75rem",
        height: 24,
      }}
    />
  );
};

/**
 * Storage Error Notification Component
 * Shows storage-related errors (quota exceeded, etc.)
 */
export const StorageErrorNotification = ({ error, onClose }) => {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }

  const getSeverity = (errorType) => {
    switch (errorType) {
      case "quota":
        return "warning";
      case "save":
      case "load":
        return "error";
      default:
        return "info";
    }
  };

  const getErrorMessage = (error) => {
    if (error.message.includes("quota")) {
      return t("tasks.draft.quotaExceeded");
    }

    switch (error.type) {
      case "save":
        return t("tasks.draft.saveError");
      case "load":
        return t("tasks.draft.loadError");
      case "initialization":
        return t("tasks.draft.initError");
      default:
        return error.message || t("tasks.draft.unknownError");
    }
  };

  return (
    <Snackbar
      open={true}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        onClose={onClose}
        severity={getSeverity(error.type)}
        sx={{ width: "100%" }}
      >
        <AlertTitle>{t("tasks.draft.storageError")}</AlertTitle>
        {getErrorMessage(error)}
      </Alert>
    </Snackbar>
  );
};

/**
 * Draft Status Summary Component
 * Shows overall draft status and metadata
 */
export const DraftStatusSummary = ({
  draftInfo,
  autoSaveStatus,
  hasUnsavedChanges,
  validationStatus,
  onManualSave,
  onClearDraft,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!draftInfo && !autoSaveStatus?.lastSaved) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.50",
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        mb: 2,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {t("tasks.draft.status")}
        </Typography>

        <Box display="flex" gap={1} alignItems="center">
          <AutoSaveStatus status={autoSaveStatus} />

          {hasUnsavedChanges && (
            <Chip
              icon={<Warning fontSize="small" />}
              label={t("tasks.draft.unsavedChanges")}
              color="warning"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>

      {validationStatus && (
        <Box display="flex" gap={1} mb={1} flexWrap="wrap">
          <Chip
            label={t("tasks.draft.questions", {
              count: validationStatus.questionCount,
            })}
            size="small"
            variant="outlined"
            color={validationStatus.hasQuestions ? "success" : "default"}
          />

          {validationStatus.isValid && (
            <Chip
              icon={<CheckCircle fontSize="small" />}
              label={t("tasks.draft.readyToSubmit")}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      )}

      <Box display="flex" gap={1} mt={1}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Save />}
          onClick={onManualSave}
          disabled={autoSaveStatus?.saving}
        >
          {t("tasks.draft.saveNow")}
        </Button>

        <Button
          size="small"
          variant="text"
          color="error"
          onClick={onClearDraft}
        >
          {t("tasks.draft.clearDraft")}
        </Button>
      </Box>
    </Box>
  );
};

export default {
  DraftRecoveryNotification,
  AutoSaveStatus,
  StorageErrorNotification,
  DraftStatusSummary,
};
