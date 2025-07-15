import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  item,
  submitting,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
        {t("management.delete.confirmTitle")}
      </DialogTitle>
      <DialogContent id="delete-dialog-description" sx={{ pb: 2 }}>
        <Typography>
          {t("management.delete.confirmMessage", {
            type: item?.type,
            name: item?.title || item?.name,
          })}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ borderRadius: 2, px: 3 }}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={submitting}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t("common.delete")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;