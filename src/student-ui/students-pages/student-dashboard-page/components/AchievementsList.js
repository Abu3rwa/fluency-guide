import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Tooltip,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";

const AchievementsList = ({
  achievements,
  onAchievementClick,
  horizontalScroll = false,
  showAll = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localShowAll, setLocalShowAll] = useState(showAll);

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalShowAll(showAll);
  }, [showAll]);

  const hasAchievements = achievements && achievements.length > 0;
  const displayAchievements = localShowAll
    ? achievements
    : achievements?.slice(0, 8);

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
    onAchievementClick?.(achievement);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return theme.palette.grey[500];
      case "uncommon":
        return theme.palette.success.main;
      case "rare":
        return theme.palette.info.main;
      case "epic":
        return theme.palette.warning.main;
      case "legendary":
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "Common";
      case "uncommon":
        return "Uncommon";
      case "rare":
        return "Rare";
      case "epic":
        return "Epic";
      case "legendary":
        return "Legendary";
      default:
        return "Standard";
    }
  };

  return (
    <>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Achievements
            </Typography>
            {hasAchievements && achievements.length > 8 && (
              <Button
                variant="text"
                size="small"
                onClick={() => setLocalShowAll(!localShowAll)}
                sx={{ textTransform: "none" }}
              >
                {localShowAll
                  ? "Show Less"
                  : `View All (${achievements.length})`}
              </Button>
            )}
          </Box>

          {hasAchievements ? (
            horizontalScroll ? (
              // Horizontal scrollable layout
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": {
                    height: 6,
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: theme.palette.divider,
                    borderRadius: 3,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 3,
                  },
                }}
              >
                {displayAchievements.map((ach, idx) => {
                  const unlocked = ach.isUnlocked !== false;
                  const rarityColor = getRarityColor(ach.rarity);

                  return (
                    <Box
                      key={idx}
                      sx={{
                        minWidth: 140,
                        flexShrink: 0,
                      }}
                    >
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
                              ? rarityColor + "15"
                              : "grey.200",
                            color: unlocked ? rarityColor : "grey.500",
                            boxShadow: unlocked ? 2 : 0,
                            minHeight: 120,
                            transition: "all 0.2s ease-in-out",
                            position: "relative",
                            cursor: "pointer",
                            outline: "none",
                            border: unlocked
                              ? `2px solid ${rarityColor}30`
                              : "1px solid transparent",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: unlocked ? 4 : 1,
                            },
                            "&:focus": {
                              boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                            },
                          }}
                          aria-label={
                            unlocked
                              ? `Unlocked achievement: ${ach.title}`
                              : `Locked achievement: ${ach.title}`
                          }
                          tabIndex={0}
                          role="button"
                          onClick={() => handleAchievementClick(ach)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleAchievementClick(ach);
                            }
                          }}
                        >
                          {unlocked ? (
                            <EmojiEventsIcon
                              fontSize="large"
                              sx={{
                                mb: 1,
                                color: rarityColor,
                              }}
                            />
                          ) : (
                            <LockIcon fontSize="large" sx={{ mb: 1 }} />
                          )}
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              textAlign: "center",
                              mb: 0.5,
                              fontSize: "0.875rem",
                            }}
                          >
                            {ach.title || "Achievement"}
                          </Typography>
                          {ach.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                textAlign: "center",
                                color: "text.secondary",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {ach.description}
                            </Typography>
                          )}
                          {unlocked && ach.rarity && (
                            <Chip
                              label={getRarityLabel(ach.rarity)}
                              size="small"
                              sx={{
                                mt: 1,
                                fontSize: "0.625rem",
                                height: 20,
                                backgroundColor: rarityColor + "20",
                                color: rarityColor,
                                border: `1px solid ${rarityColor}40`,
                              }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              // Grid layout
              <Grid container spacing={2}>
                {displayAchievements.map((ach, idx) => {
                  const unlocked = ach.isUnlocked !== false;
                  const rarityColor = getRarityColor(ach.rarity);

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
                              ? rarityColor + "15"
                              : "grey.200",
                            color: unlocked ? rarityColor : "grey.500",
                            boxShadow: unlocked ? 2 : 0,
                            minHeight: 120,
                            transition: "all 0.2s ease-in-out",
                            position: "relative",
                            cursor: "pointer",
                            outline: "none",
                            border: unlocked
                              ? `2px solid ${rarityColor}30`
                              : "1px solid transparent",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: unlocked ? 4 : 1,
                            },
                            "&:focus": {
                              boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                            },
                          }}
                          aria-label={
                            unlocked
                              ? `Unlocked achievement: ${ach.title}`
                              : `Locked achievement: ${ach.title}`
                          }
                          tabIndex={0}
                          role="button"
                          onClick={() => handleAchievementClick(ach)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleAchievementClick(ach);
                            }
                          }}
                        >
                          {unlocked ? (
                            <EmojiEventsIcon
                              fontSize="large"
                              sx={{
                                mb: 1,
                                color: rarityColor,
                              }}
                            />
                          ) : (
                            <LockIcon fontSize="large" sx={{ mb: 1 }} />
                          )}
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              textAlign: "center",
                              mb: 0.5,
                            }}
                          >
                            {ach.title || "Achievement"}
                          </Typography>
                          {ach.description && (
                            <Typography
                              variant="body2"
                              sx={{
                                textAlign: "center",
                                color: "text.secondary",
                              }}
                            >
                              {ach.description}
                            </Typography>
                          )}
                          {unlocked && ach.rarity && (
                            <Chip
                              label={getRarityLabel(ach.rarity)}
                              size="small"
                              sx={{
                                mt: 1,
                                backgroundColor: rarityColor + "20",
                                color: rarityColor,
                                border: `1px solid ${rarityColor}40`,
                              }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </Grid>
            )
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

      {/* Achievement Detail Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {selectedAchievement?.title || "Achievement Details"}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAchievement && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor:
                    getRarityColor(selectedAchievement.rarity) + "20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  border: `3px solid ${getRarityColor(
                    selectedAchievement.rarity
                  )}`,
                }}
              >
                {selectedAchievement.isUnlocked !== false ? (
                  <EmojiEventsIcon
                    sx={{
                      fontSize: 40,
                      color: getRarityColor(selectedAchievement.rarity),
                    }}
                  />
                ) : (
                  <LockIcon sx={{ fontSize: 40, color: "grey.500" }} />
                )}
              </Box>

              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                {selectedAchievement.title}
              </Typography>

              {selectedAchievement.description && (
                <Typography
                  variant="body1"
                  sx={{ mb: 2, color: "text.secondary" }}
                >
                  {selectedAchievement.description}
                </Typography>
              )}

              {selectedAchievement.rarity && (
                <Chip
                  icon={<StarIcon />}
                  label={getRarityLabel(selectedAchievement.rarity)}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              )}

              {selectedAchievement.isUnlocked !== false ? (
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{ fontWeight: 600 }}
                >
                  ✓ Achievement Unlocked!
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Keep learning to unlock this achievement!
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AchievementsList;
