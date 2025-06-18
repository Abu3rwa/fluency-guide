import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Paper,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import CreateLessonForm from "./CreateLessonForm";

const LessonView = ({ lesson, onDelete, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mediaState, setMediaState] = useState({
    video: { playing: false, muted: false },
    audio: { playing: false, muted: false },
  });

  const handleMediaControl = (type, action) => {
    setMediaState((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [action]: !prev[type][action],
      },
    }));
  };

  const handleDelete = async () => {
    try {
      await onDelete(lesson.id);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  const handleMediaPlay = (type) => {
    setMediaState((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const getFileType = (url) => {
    if (!url) return "";
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (["mp4", "webm", "ogg"].includes(extension)) return "video";
    if (["mp3", "wav", "ogg"].includes(extension)) return "audio";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
      return "image";
    if (["pdf"].includes(extension)) return "pdf";
    return "";
  };

  const renderMediaPreview = () => {
    if (!lesson.mediaFiles || lesson.mediaFiles.length === 0) return null;

    return (
      <Grid container spacing={2}>
        {lesson.mediaFiles.map((file, index) => {
          const fileType = getFileType(file.url);
          if (!fileType) return null;

          return (
            <Grid item xs={12} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {file.name}
                </Typography>
                {fileType === "video" && (
                  <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
                    <video
                      controls
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                      src={file.url}
                    />
                  </Box>
                )}
                {fileType === "audio" && (
                  <audio controls style={{ width: "100%" }} src={file.url} />
                )}
                {fileType === "image" && (
                  <Box
                    component="img"
                    src={file.url}
                    alt={file.name}
                    sx={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                    }}
                  />
                )}
                {fileType === "pdf" && (
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdfIcon />}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </Button>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" gutterBottom>
                {lesson.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Duration: {lesson.duration} minutes
              </Typography>
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() => setEditMode(true)}
                sx={{ mr: 1 }}
              >
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

          <Typography variant="body1" paragraph>
            {lesson.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Content
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }} paragraph>
            {lesson.content}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Learning Objectives
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {lesson.objectives.map((objective, index) => (
              <Chip key={index} label={objective} color="primary" />
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>
            Resources
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {lesson.resources.map((resource, index) => (
              <Chip key={index} label={resource} />
            ))}
          </Box>

          {renderMediaPreview()}

          {lesson.materials && lesson.materials.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Course Materials
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {lesson.materials.map((material, index) => (
                  <Chip
                    key={index}
                    label={material.name}
                    onClick={() => window.open(material.url, "_blank")}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editMode}
        onClose={() => setEditMode(false)}
        maxWidth="md"
        fullWidth
      >
        <CreateLessonForm
          courseId={lesson.courseId}
          initialData={lesson}
          mode="edit"
          onSuccess={() => {
            setEditMode(false);
            onUpdate();
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
    </>
  );
};

export default LessonView;
