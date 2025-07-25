import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link,
  Skeleton,
  Fade,
} from "@mui/material";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const StudentCourseDetailSupportDialog = ({
  open,
  onClose,
  support = {},
  faq = [],
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
        aria-labelledby="support-dialog-title"
      >
        <DialogTitle
          id="support-dialog-title"
          sx={{
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
        >
          {t("studentCourseDetails.supportDialog.title")}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ bgcolor: theme.palette.background.default }}
        >
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            {t("studentCourseDetails.supportDialog.contactSupport")}
          </Typography>
          {support.email && (
            <Typography variant="body2">
              {t("studentCourseDetails.supportDialog.email")}:{" "}
              <Link href={`mailto:${support.email}`}>{support.email}</Link>
            </Typography>
          )}
          {support.hours && (
            <Typography variant="body2">
              {t("studentCourseDetails.supportDialog.hours")}: {support.hours}
            </Typography>
          )}
          {support.responseTime && (
            <Typography variant="body2">
              {t("studentCourseDetails.supportDialog.responseTime")}:{" "}
              {support.responseTime}
            </Typography>
          )}
          {faq.length > 0 && (
            <>
              <Typography
                variant="subtitle1"
                fontWeight={500}
                mt={3}
                gutterBottom
              >
                {t("studentCourseDetails.supportDialog.faq")}
              </Typography>
              <List>
                {faq.map((item, idx) => (
                  <ListItem key={idx} alignItems="flex-start">
                    <ListItemText
                      primary={item.question}
                      secondary={item.answer}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: theme.palette.background.paper }}>
          <Button onClick={onClose} color="primary">
            {t("studentCourseDetails.supportDialog.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Fade>
  );
};

export default StudentCourseDetailSupportDialog;
