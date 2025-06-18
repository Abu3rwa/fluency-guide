import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const ContentValidationDialog = ({ open, onClose, validationResults }) => {
  const { t } = useTranslation();

  const getIcon = (type) => {
    switch (type) {
      case "error":
        return <ErrorIcon color="error" />;
      case "warning":
        return <WarningIcon color="warning" />;
      case "success":
        return <CheckCircleIcon color="success" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("courses.validation.title")}</DialogTitle>
      <DialogContent>
        {validationResults ? (
          <List>
            {validationResults.map((result, index) => (
              <ListItem key={index}>
                <ListItemIcon>{getIcon(result.type)}</ListItemIcon>
                <ListItemText
                  primary={result.message}
                  secondary={result.details}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box display="flex" justifyContent="center" p={3}>
            <Typography>{t("courses.validation.noResults")}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContentValidationDialog;
