import React, { useState } from "react";
import {
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon,
  AttachFile as FileIcon,
  Link as LinkIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useCustomTheme } from "../../contexts/ThemeContext";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

/**
 * LessonMediaStep - Step 2 of lesson creation
 * Handles media uploads including video, audio, images, and additional materials
 */
const LessonMediaStep = ({
  formData,
  loading,
  errors,
  onFileChange,
  onUrlUpload,
  onRemoveMaterial,
}) => {
  const { t } = useTranslation();
  const { theme: customTheme } = useCustomTheme();
  
  const [urlDialog, setUrlDialog] = useState({ open: false, type: null });
  const [urlInput, setUrlInput] = useState("");

  const paperSx = {
    p: 3,
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.background.paper,
    border: `1px solid ${customTheme.palette.divider}`,
    textAlign: "center",
  };

  const uploadButtonSx = {
    borderRadius: customTheme.shape.borderRadius,
    bgcolor: customTheme.palette.primary.main,
    color: customTheme.palette.primary.contrastText,
    "&:hover": {
      bgcolor: customTheme.palette.primary.dark,
    },
    minHeight: 120,
    border: `2px dashed ${customTheme.palette.primary.light}`,
    "&:hover": {
      border: `2px dashed ${customTheme.palette.primary.main}`,
    },
  };

  const handleUrlDialogOpen = (type) => {
    setUrlDialog({ open: true, type });
    setUrlInput("");
  };

  const handleUrlDialogClose = () => {
    setUrlDialog({ open: false, type: null });
    setUrlInput("");
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlUpload(urlDialog.type, urlInput.trim());
      handleUrlDialogClose();
    }
  };

  const MediaUploadCard = ({ type, icon: Icon, title, accept, current, error }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Icon sx={{ fontSize: 48, color: "primary.main" }} />
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          
          {current ? (
            <Box sx={{ width: "100%", textAlign: "center" }}>
              {type === "image" && (
                <CardMedia
                  component="img"
                  height="120"
                  image={current.url}
                  alt={title}
                  sx={{ borderRadius: 1, mb: 1 }}
                />
              )}
              {type === "video" && (
                <video
                  controls
                  width="100%"
                  height="120"
                  style={{ borderRadius: 4, marginBottom: 8 }}
                >
                  <source src={current.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {type === "audio" && (
                <audio controls style={{ width: "100%", marginBottom: 8 }}>
                  <source src={current.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <Typography variant="body2" color="text.secondary" noWrap>
                {current.name || "Uploaded file"}
              </Typography>
            </Box>
          ) : (
            <Paper sx={uploadButtonSx}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, p: 2 }}>
                <CloudUploadIcon sx={{ fontSize: 32 }} />
                <Typography variant="body2">
                  {t("createLessonForm.dragDropOrClick", "Drag & drop or click to upload")}
                </Typography>
              </Box>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: "center", gap: 1 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
          disabled={loading}
          size="small"
        >
          {t("createLessonForm.uploadFile", "Upload File")}
          <VisuallyHiddenInput
            type="file"
            accept={accept}
            onChange={onFileChange(type)}
          />
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={() => handleUrlDialogOpen(type)}
          disabled={loading}
          size="small"
        >
          {t("createLessonForm.fromUrl", "From URL")}
        </Button>
        
        {current && (
          <IconButton
            color="error"
            onClick={() => onFileChange(type)({ target: { files: [] } })}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {/* Introduction */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {t("createLessonForm.mediaTitle", "Lesson Media & Materials")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("createLessonForm.mediaDescription", "Add multimedia content to enhance your lesson. All media files are optional.")}
        </Typography>
      </Grid>

      {/* Video Upload */}
      <Grid item xs={12} md={6}>
        <MediaUploadCard
          type="video"
          icon={VideoIcon}
          title={t("createLessonForm.lessonVideo", "Lesson Video")}
          accept="video/*"
          current={formData.video}
          error={errors.video}
        />
      </Grid>

      {/* Audio Upload */}
      <Grid item xs={12} md={6}>
        <MediaUploadCard
          type="audio"
          icon={AudioIcon}
          title={t("createLessonForm.audioContent", "Audio Content")}
          accept="audio/*"
          current={formData.audio}
          error={errors.audio}
        />
      </Grid>

      {/* Image Upload */}
      <Grid item xs={12} md={6}>
        <MediaUploadCard
          type="image"
          icon={ImageIcon}
          title={t("createLessonForm.coverImage", "Cover Image")}
          accept="image/*"
          current={formData.image}
          error={errors.image}
        />
      </Grid>

      {/* Additional Materials */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <FileIcon sx={{ fontSize: 48, color: "primary.main" }} />
              <Typography variant="h6" component="h3">
                {t("createLessonForm.additionalMaterials", "Additional Materials")}
              </Typography>
              
              <Paper sx={uploadButtonSx}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, p: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: 32 }} />
                  <Typography variant="body2">
                    {t("createLessonForm.uploadMultipleFiles", "Upload multiple files")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("createLessonForm.supportedFormats", "PDFs, Documents, Presentations, etc.")}
                  </Typography>
                </Box>
              </Paper>

              {errors.materials && (
                <Alert severity="error" sx={{ width: "100%" }}>
                  {errors.materials}
                </Alert>
              )}
            </Box>
          </CardContent>
          
          <CardActions sx={{ justifyContent: "center" }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
              disabled={loading}
            >
              {t("createLessonForm.uploadMaterials", "Upload Materials")}
              <VisuallyHiddenInput
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                onChange={onFileChange("materials")}
              />
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Materials List */}
      {formData.materials && formData.materials.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("createLessonForm.uploadedMaterials", "Uploaded Materials")}
            </Typography>
            <List>
              {formData.materials.map((material, index) => (
                <ListItem key={index} divider>
                  <FileIcon sx={{ mr: 2, color: "primary.main" }} />
                  <ListItemText
                    primary={material.name}
                    secondary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Chip size="small" label={material.type || "file"} />
                        <Typography variant="caption" color="text.secondary">
                          {material.size ? `${Math.round(material.size / 1024)}KB` : ""}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => onRemoveMaterial(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      )}

      {/* Media Guidelines */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: customTheme.palette.info.light + "10" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "info.main" }}>
            {t("createLessonForm.mediaGuidelines", "Media Guidelines")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {t("createLessonForm.videoGuideline", "Videos: MP4, WebM, or OGG format, max 100MB")}
            <br />
            • {t("createLessonForm.audioGuideline", "Audio: MP3, WAV, or OGG format, max 50MB")}
            <br />
            • {t("createLessonForm.imageGuideline", "Images: JPG, PNG, or WebP format, max 10MB")}
            <br />
            • {t("createLessonForm.materialsGuideline", "Materials: PDF, DOC, PPT, XLS files, max 25MB each")}
          </Typography>
        </Paper>
      </Grid>

      {/* URL Upload Dialog */}
      <Dialog open={urlDialog.open} onClose={handleUrlDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t("createLessonForm.uploadFromUrl", "Upload from URL")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("createLessonForm.mediaUrl", "Media URL")}
            type="url"
            fullWidth
            variant="outlined"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/media-file.mp4"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUrlDialogClose}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button 
            onClick={handleUrlSubmit} 
            variant="contained"
            disabled={!urlInput.trim()}
          >
            {t("createLessonForm.upload", "Upload")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default LessonMediaStep;