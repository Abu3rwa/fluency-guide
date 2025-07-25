import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Link,
  Skeleton,
  Fade,
} from "@mui/material";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const StudentCourseDetailMaterialsDialog = ({
  open,
  onClose,
  materials = [],
  loading,
}) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={180}
        sx={{ borderRadius: theme.shape.borderRadius, mb: 3 }}
      />
    );
  }
  return (
    <Fade in={open} timeout={400}>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="materials-dialog-title"
      >
        <DialogTitle
          id="materials-dialog-title"
          sx={{
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {t("studentCourseDetails.materialsDialog.title")}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ bgcolor: theme.palette.background.default }}
        >
          <List>
            {materials.length === 0 && (
              <ListItem>
                <ListItemText
                  primary={t(
                    "studentCourseDetails.materialsDialog.noMaterials"
                  )}
                />
              </ListItem>
            )}
            {materials.map((mat, idx) => (
              <ListItem key={idx} divider>
                <ListItemText primary={mat.name || mat} />
                {mat.url && (
                  <Button
                    component={Link}
                    href={mat.url}
                    target="_blank"
                    rel="noopener"
                    download
                    variant="outlined"
                    size="small"
                    sx={{ color: theme.palette.primary.main }}
                  >
                    {t("studentCourseDetails.materialsDialog.download")}
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ bgcolor: theme.palette.background.paper }}>
          <Button onClick={onClose} color="primary">
            {t("studentCourseDetails.materialsDialog.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Fade>
  );
};

export default StudentCourseDetailMaterialsDialog;
