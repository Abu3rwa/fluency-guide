import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const CreateLessonDialog = ({
  open,
  onClose,
  newLesson,
  setNewLesson,
  handleCreateLesson,
  actionLoading,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Lesson</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          type="text"
          fullWidth
          value={newLesson.title}
          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
          disabled={actionLoading}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          minRows={2}
          value={newLesson.description}
          onChange={(e) =>
            setNewLesson({ ...newLesson, description: e.target.value })
          }
          disabled={actionLoading}
        />
        <FormControl fullWidth margin="dense" disabled={actionLoading}>
          <InputLabel>Status</InputLabel>
          <Select
            value={newLesson.status}
            label="Status"
            onChange={(e) =>
              setNewLesson({ ...newLesson, status: e.target.value })
            }
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={actionLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateLesson}
          color="primary"
          variant="contained"
          disabled={actionLoading}
        >
          {actionLoading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLessonDialog;
