import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import {
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { getRandomMotivationalMessage } from "../../utils/vocabularyHelpers";

const StudentMotivationDialog = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [motivationalMessage] = React.useState(getRandomMotivationalMessage());

  const handleContinue = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <EmojiEventsIcon sx={{ fontSize: 60, color: "#FF6B35" }} />
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: "bold", color: "#2C3E50" }}
        >
          {t("vocabulary.keepGoing", "Keep Going! 💪")}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center" }}>
        <Box sx={{ mb: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              bgcolor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <LightbulbIcon sx={{ fontSize: 40, color: "#F39C12", mr: 1 }} />
            </Box>

            <Typography variant="h6" sx={{ mb: 2, color: "#2C3E50" }}>
              {t("vocabulary.motivationalTitle", "You're Doing Great!")}
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 2, color: "#34495E", fontStyle: "italic" }}
            >
              "{motivationalMessage}"
            </Typography>
          </Paper>

          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}
          >
            <TrendingUpIcon sx={{ fontSize: 24, color: "#27AE60" }} />
            <Typography variant="body2" color="text.secondary">
              {t(
                "vocabulary.learningTip",
                "Every word you learn brings you closer to fluency"
              )}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: "#7F8C8D" }}>
            {t(
              "vocabulary.consistencyMessage",
              "Remember: Consistency beats perfection. Keep learning a little bit every day!"
            )}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button
          onClick={handleContinue}
          variant="contained"
          sx={{
            bgcolor: "#FF6B35",
            color: "white",
            "&:hover": {
              bgcolor: "#E55A2B",
            },
            px: 4,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          {t("vocabulary.continueLearning", "Continue Learning")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentMotivationDialog;
