import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Tooltip,
  Box,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LockIcon from "@mui/icons-material/Lock";

const AchievementsList = ({ achievements, onAchievementClick }) => {
  const hasAchievements = achievements && achievements.length > 0;

  return (
    <Card
      sx={{
        mb: 3,
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        boxShadow: 2,
        borderRadius: 3,
      }}
      aria-label="Achievements"
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Achievements
        </Typography>
        {hasAchievements ? (
          <Grid container spacing={2}>
            {achievements.map((ach, idx) => {
              const unlocked = ach.isUnlocked !== false;
              return (
                <Grid item xs={6} sm={4} md={3} key={idx}>
                  <Tooltip
                    title={
                      unlocked
                        ? ach.description ||
                          ach.title ||
                          "Achievement unlocked!"
                        : "Locked achievement"
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: unlocked
                          ? "primary.light"
                          : "grey.200",
                        color: unlocked ? "primary.main" : "grey.500",
                        boxShadow: unlocked ? 2 : 0,
                        minHeight: 120,
                        transition: "background 0.2s, color 0.2s",
                        position: "relative",
                        cursor: onAchievementClick ? "pointer" : "default",
                        outline: "none",
                        "&:focus": {
                          boxShadow: "0 0 0 2px #1976d2",
                        },
                      }}
                      aria-label={
                        unlocked
                          ? `Unlocked achievement: ${ach.title}`
                          : `Locked achievement: ${ach.title}`
                      }
                      tabIndex={onAchievementClick ? 0 : -1}
                      role={onAchievementClick ? "button" : undefined}
                      onClick={
                        onAchievementClick
                          ? () => onAchievementClick(ach)
                          : undefined
                      }
                      onKeyDown={
                        onAchievementClick
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                onAchievementClick(ach);
                              }
                            }
                          : undefined
                      }
                    >
                      {unlocked ? (
                        <EmojiEventsIcon
                          fontSize="large"
                          color="warning"
                          sx={{ mb: 1 }}
                        />
                      ) : (
                        <LockIcon fontSize="large" sx={{ mb: 1 }} />
                      )}
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, textAlign: "center", mb: 0.5 }}
                      >
                        {ach.title || "Achievement"}
                      </Typography>
                      {ach.description && (
                        <Typography
                          variant="body2"
                          sx={{ textAlign: "center", color: "text.secondary" }}
                        >
                          {ach.description}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 120,
              color: "grey.500",
              py: 4,
            }}
          >
            <EmojiEventsIcon fontSize="large" sx={{ mb: 1 }} />
            <Typography variant="body1">No achievements yet.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementsList;
