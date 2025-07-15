import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const DeleteLessonDialog = ({ open, onClose, onConfirm, lesson }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('lessonManagement.deleteConfirm.title')}</DialogTitle>
      <DialogContent>
        <Typography>
          {t('lessonManagement.deleteConfirm.message', {
            title: lesson?.title,
          })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={onConfirm} color="error">
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLessonDialog;
