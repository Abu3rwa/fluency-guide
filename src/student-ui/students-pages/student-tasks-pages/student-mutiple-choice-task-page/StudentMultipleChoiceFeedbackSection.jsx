import React from "react";
import { Box, Typography, Paper, Fade } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const StudentMultipleChoiceFeedbackSection = ({ isCorrect, explanation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Fade in={true} timeout={300}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          mt: 2,
          background: isCorrect
            ? theme.palette.success.main + "10"
            : theme.palette.error.main + "10",
          border: `2px solid ${
            isCorrect
              ? theme.palette.success.main + "30"
              : theme.palette.error.main + "30"
          }`,
          borderRadius: 2,
          boxShadow: theme.shadows[0],
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          sx={{
            animation: "fadeInUp 0.5s ease-out",
            "@keyframes fadeInUp": {
              "0%": {
                opacity: 0,
                transform: "translateY(20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          {isCorrect ? (
            <>
              <CheckCircleIcon
                color="success"
                sx={{
                  mr: 2,
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                  animation: "bounceIn 0.6s ease-out",
                  "@keyframes bounceIn": {
                    "0%": {
                      opacity: 0,
                      transform: "scale(0.3)",
                    },
                    "50%": {
                      opacity: 1,
                      transform: "scale(1.05)",
                    },
                    "70%": {
                      transform: "scale(0.9)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "scale(1)",
                    },
                  },
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  color="success.main"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {t("tasks.correctAnswer")}
                </Typography>
                <Typography
                  variant="body2"
                  color="success.dark"
                  sx={{ opacity: 0.8 }}
                >
                  {t("tasks.correctAnswerMessage")}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <CancelIcon
                color="error"
                sx={{
                  mr: 2,
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                  animation: "shake 0.6s ease-out",
                  "@keyframes shake": {
                    "0%, 100%": { transform: "translateX(0)" },
                    "10%, 30%, 50%, 70%, 90%": {
                      transform: "translateX(-5px)",
                    },
                    "20%, 40%, 60%, 80%": {
                      transform: "translateX(5px)",
                    },
                  },
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  color="error.main"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {t("tasks.incorrectAnswer")}
                </Typography>
                <Typography
                  variant="body2"
                  color="error.dark"
                  sx={{ opacity: 0.8 }}
                >
                  {t("tasks.incorrectAnswerMessage")}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {explanation && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              background: theme.palette.background.paper,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              animation: "slideInUp 0.5s ease-out 0.2s both",
              "@keyframes slideInUp": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: theme.palette.text.secondary,
              }}
            >
              {t("tasks.explanation")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.6,
                color: theme.palette.text.primary,
              }}
            >
              {explanation}
            </Typography>
          </Box>
        )}

        {/* Auto-advance indicator */}
        <Box
          sx={{
            mt: 2,
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("tasks.autoAdvancing")}
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default StudentMultipleChoiceFeedbackSection;
