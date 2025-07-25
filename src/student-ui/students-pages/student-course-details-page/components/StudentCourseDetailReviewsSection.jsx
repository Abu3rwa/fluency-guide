import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Stack,
  Skeleton,
  Fade,
  Paper,
} from "@mui/material";
import { useCustomTheme } from "../../../../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

const StudentCourseDetailReviewsSection = ({
  courseId,
  user,
  reviews = [],
  loading,
  onSubmit,
}) => {
  const { theme } = useCustomTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  // Placeholder: handle submit
  const handleSubmit = async () => {
    setSubmitting(true);
    (await onSubmit) && onSubmit(rating, text);
    setSubmitting(false);
    setOpen(false);
    setRating(0);
    setText("");
    // TODO: Refresh reviews
  };

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        height={120}
        sx={{ borderRadius: theme.shape.borderRadius, mb: 3 }}
      />
    );
  }

  return (
    <Fade in timeout={600}>
      <Box sx={{ mb: 3 }} aria-label="Reviews section">
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t("studentCourseDetails.reviews.title")}
        </Typography>
        {avgRating && (
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Rating value={Number(avgRating)} precision={0.1} readOnly />
            <Typography variant="body2">
              {t("studentCourseDetails.reviews.summary", {
                avg: avgRating,
                count: reviews.length,
              })}
            </Typography>
          </Stack>
        )}
        {reviews.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t("studentCourseDetails.reviews.noReviews")}
          </Typography>
        )}
        {reviews.map((r, idx) => (
          <Paper
            key={idx}
            sx={{
              mb: 1,
              p: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={r.rating} readOnly size="small" />
              <Typography variant="subtitle2">
                {r.userName || t("studentCourseDetails.reviews.student")}
              </Typography>
            </Stack>
            <Typography variant="body2">{r.review}</Typography>
          </Paper>
        ))}
        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => setOpen(true)}
        >
          {user
            ? t("studentCourseDetails.reviews.addEdit")
            : t("studentCourseDetails.reviews.loginToReview")}
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t("studentCourseDetails.reviews.submitTitle")}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <Rating value={rating} onChange={(_, v) => setRating(v)} />
              <TextField
                label={t("studentCourseDetails.reviews.yourReview")}
                multiline
                minRows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={submitting}>
              {t("studentCourseDetails.reviews.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !rating || !text}
              variant="contained"
              color="primary"
            >
              {submitting
                ? t("studentCourseDetails.reviews.submitting")
                : t("studentCourseDetails.reviews.submit")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default StudentCourseDetailReviewsSection;
