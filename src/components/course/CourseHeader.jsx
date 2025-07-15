import React from "react";
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
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

  return (
    <Box
      sx={{
        mb: 4,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Tooltip title={t("common.back")} arrow>
          <IconButton
            onClick={onBack}
            size="large"
            aria-label={t("common.back")}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1">
          {course?.title}
        </Typography>
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap">
        <Tooltip
          title={
            course?.isPublished
              ? t("courses.details.actions.unpublish")
              : t("courses.details.actions.publish")
          }
          arrow
        >
          <Button
            variant="outlined"
            startIcon={
              course?.isPublished ? <VisibilityIcon /> : <VisibilityOffIcon />
            }
            onClick={onPublishToggle}
            aria-label={
              course?.isPublished
                ? t("courses.details.actions.unpublish")
                : t("courses.details.actions.publish")
            }
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
          >
            {t("courses.details.actions.delete")}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default CourseHeader;
