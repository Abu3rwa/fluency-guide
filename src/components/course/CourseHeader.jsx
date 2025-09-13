import React from "react";
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  Chip,
  useMediaQuery,
  Fade,
  Paper
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../contexts/ThemeContext";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  Preview as PreviewIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const CourseHeader = ({
  course,
  onBack,
  onPublishToggle,
  onEdit,
  onImport,
  onExport,
  onPreview,
  onShare,
  onDelete,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Fade in timeout={600}>
      <Paper
        elevation={6}
        sx={{
          mb: { xs: 3, md: 4 },
          p: { xs: 2, sm: 3, md: 4 },
          background: mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }
        }}
      >
        {/* Mobile Layout */}
        {isMobile ? (
          <>
            {/* Mobile Header Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                flexWrap: "wrap",
                gap: 1
              }}
            >
              <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0, flex: 1 }}>
                <Tooltip title={t("common.back")} arrow>
                  <IconButton
                    onClick={onBack}
                    size={isSmall ? "small" : "medium"}
                    aria-label={t("common.back")}
                    sx={{
                      backgroundColor: theme.palette.action.hover,
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography 
                    variant={isSmall ? "h6" : "h5"} 
                    component="h1"
                    sx={{
                      fontWeight: 'bold',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {course?.title}
                  </Typography>
                </Box>
              </Box>
              
              {/* Status Chip */}
              <Chip
                label={course?.isPublished ? "Published" : "Draft"}
                color={course?.isPublished ? "success" : "warning"}
                size="small"
                sx={{
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              />
            </Box>

            {/* Mobile Action Buttons */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 1,
                mt: 2
              }}
            >
              <Button
                variant={course?.isPublished ? "outlined" : "contained"}
                startIcon={course?.isPublished ? <VisibilityIcon /> : <VisibilityOffIcon />}
                onClick={onPublishToggle}
                size="small"
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                {course?.isPublished ? "Unpublish" : "Publish"}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEdit}
                size="small"
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Edit
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={onPreview}
                size="small"
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Preview
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={onShare}
                size="small"
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Share
              </Button>
              
              {!isSmall && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<ImportIcon />}
                    onClick={onImport}
                    size="small"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Import
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={onExport}
                    size="small"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Export
                  </Button>
                </>
              )}
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDelete}
                size="small"
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Delete
              </Button>
            </Box>
          </>
        ) : (
          /* Desktop Layout */
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={3} sx={{ minWidth: 0, flex: 1 }}>
              <Tooltip title={t("common.back")} arrow>
                <IconButton
                  onClick={onBack}
                  size="large"
                  aria-label={t("common.back")}
                  sx={{
                    backgroundColor: theme.palette.action.hover,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              
              <Box sx={{ minWidth: 0 }}>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  {course?.title}
                </Typography>
                <Chip
                  label={course?.isPublished ? "Published" : "Draft"}
                  color={course?.isPublished ? "success" : "warning"}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
              <Tooltip
                title={
                  course?.isPublished
                    ? t("courses.details.actions.unpublish")
                    : t("courses.details.actions.publish")
                }
                arrow
              >
                <Button
                  variant={course?.isPublished ? "outlined" : "contained"}
                  startIcon={
                    course?.isPublished ? <VisibilityIcon /> : <VisibilityOffIcon />
                  }
                  onClick={onPublishToggle}
                  aria-label={
                    course?.isPublished
                      ? t("courses.details.actions.unpublish")
                      : t("courses.details.actions.publish")
                  }
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {course?.isPublished
                    ? t("courses.details.actions.unpublish")
                    : t("courses.details.actions.publish")}
                </Button>
              </Tooltip>

              <Tooltip title={t("courses.details.actions.edit")} arrow>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  aria-label={t("courses.details.actions.edit")}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {t("courses.details.actions.edit")}
                </Button>
              </Tooltip>

              <Tooltip title={t("courses.details.actions.import")} arrow>
                <Button
                  variant="outlined"
                  startIcon={<ImportIcon />}
                  onClick={onImport}
                  aria-label={t("courses.details.actions.import")}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {t("courses.details.actions.import")}
                </Button>
              </Tooltip>

              <Tooltip title={t("courses.details.actions.export")} arrow>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={onExport}
                  aria-label={t("courses.details.actions.export")}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {t("courses.details.actions.export")}
                </Button>
              </Tooltip>

              <Tooltip title={t("courses.details.actions.preview")} arrow>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={onPreview}
                  aria-label={t("courses.details.actions.preview")}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {t("courses.details.actions.preview")}
                </Button>
              </Tooltip>

              <Tooltip title={t("courses.details.actions.share")} arrow>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={onShare}
                  aria-label={t("courses.details.actions.share")}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {t("courses.details.actions.share")}
                </Button>
              </Tooltip>

              <Tooltip title={t("courses.details.actions.delete")} arrow>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  aria-label={t("courses.details.actions.delete")}
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {t("courses.details.actions.delete")}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default CourseHeader;
