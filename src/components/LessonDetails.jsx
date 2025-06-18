import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getLesson, deleteLesson } from "../services/lessonService";
import CreateLessonForm from "./CreateLessonForm";

const LessonDetails = ({ lessonId, courseId }) => {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [mediaState, setMediaState] = useState({
    video: { playing: false, muted: false },
    audio: { playing: false, muted: false },
  });

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const data = await getLesson(lessonId);
      setLesson(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleDelete = async () => {
    try {
      await deleteLesson(lessonId);
      setNotification({
        open: true,
        message: "Lesson deleted successfully",
        severity: "success",
      });
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || "Failed to delete lesson",
        severity: "error",
      });
    }
    setDeleteConfirmOpen(false);
  };

  const handleMediaControl = (type, action) => {
    setMediaState((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [action]: !prev[type][action],
      },
    }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Lesson not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              {lesson.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Duration: {lesson.duration} minutes
            </Typography>
          </Box>
          <Box>
            <IconButton color="primary" onClick={handleEdit} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph>
          {lesson.description}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Content
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {lesson.content}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Learning Objectives
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {lesson.objectives.map((objective, index) => (
            <Chip key={index} label={objective} color="primary" />
          ))}
        </Box>

        <Typography variant="h6" gutterBottom>
          Resources
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {lesson.resources.map((resource, index) => (
            <Chip key={index} label={resource} />
          ))}
        </Box>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {lesson.video && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="video"
                  controls
                  src={lesson.video.url}
                  sx={{ height: 200 }}
                />
                <CardContent>
                  <Typography variant="subtitle2">Video</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {lesson.audio && (
            <Grid item xs={12} md={4}>
              <Card>
                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">Audio</Typography>
                    <Box>
                      <IconButton
                        onClick={() => handleMediaControl("audio", "playing")}
                      >
                        {mediaState.audio.playing ? (
                          <PauseIcon />
                        ) : (
                          <PlayIcon />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => handleMediaControl("audio", "muted")}
                      >
                        {mediaState.audio.muted ? (
                          <VolumeOffIcon />
                        ) : (
                          <VolumeUpIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                  <audio
                    src={lesson.audio.url}
                    controls
                    style={{ width: "100%" }}
                  />
                </Box>
              </Card>
            </Grid>
          )}
          {lesson.image && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  image={lesson.image.url}
                  sx={{ height: 200, objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="subtitle2">Image</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editMode}
        onClose={() => setEditMode(false)}
        maxWidth="md"
        fullWidth
      >
        <CreateLessonForm
          courseId={courseId}
          initialData={lesson}
          mode="edit"
          onSuccess={() => {
            setEditMode(false);
            fetchLesson();
            setNotification({
              open: true,
              message: "Lesson updated successfully",
              severity: "success",
            });
          }}
          onCancel={() => setEditMode(false)}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Lesson</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this lesson? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonDetails;
