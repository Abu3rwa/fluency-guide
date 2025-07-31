import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  Alert,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Snackbar,
  SwipeableDrawer,
  Fab,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Mic as MicIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  TouchApp as TouchAppIcon,
  Gesture as GestureIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useStudentVocabulary } from "../../../../contexts/studentVocabularyContext";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  getDifficultyColor,
  getFrequencyDescription,
} from "../utils/vocabularyHelpers";
import studentAudioService from "../../../../services/student-services/studentAudioService";

const StudentVocabularyWordCard = React.memo(
  ({
    word,
    onMarkAsLearned,
    onMarkAsDifficult,
    onToggleFavorite,
    onPronunciationClick,
    onNavigateNext,
    onNavigatePrevious,
  }) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { currentUser } = useAuth();
    const {
      getWordProgress,
      markWordAsLearned,
      markWordAsDifficult,
      toggleFavorite,
    } = useStudentVocabulary();
    const [expanded, setExpanded] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioError, setAudioError] = useState(null);

    // Optimistic state for immediate UI updates
    const [optimisticStatus, setOptimisticStatus] = useState(null);
    const [optimisticFavorite, setOptimisticFavorite] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");

    // Navigation state
    const [focusedElement, setFocusedElement] = useState("word");
    const [showNavigationHint, setShowNavigationHint] = useState(false);

    // Mobile navigation state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [showMobileActions, setShowMobileActions] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState(null);

    const audioRef = useRef(null);
    const cardRef = useRef(null);
    const actionButtonsRef = useRef(null);

    // Language direction detection
    const isRTL = i18n.language === "ar" || i18n.dir() === "rtl";
    const isArabic = i18n.language === "ar";

    // Get current word progress from context
    const wordProgress = useMemo(
      () => getWordProgress(word.id),
      [getWordProgress, word.id]
    );

    // Use optimistic state if available, otherwise use context state
    const currentStatus =
      optimisticStatus !== null ? optimisticStatus : wordProgress?.status;
    const currentFavorite =
      optimisticFavorite !== null
        ? optimisticFavorite
        : wordProgress?.isFavorite;

    const isFavorite = useMemo(
      () => currentFavorite || false,
      [currentFavorite]
    );
    const isLearned = useMemo(
      () => currentStatus === "learned",
      [currentStatus]
    );
    const isDifficult = useMemo(
      () => currentStatus === "difficult",
      [currentStatus]
    );

    // Reset optimistic state when context updates
    useEffect(() => {
      if (wordProgress) {
        setOptimisticStatus(null);
        setOptimisticFavorite(null);
      }
    }, [wordProgress]);

    // Mobile touch handlers
    const handleTouchStart = useCallback((e) => {
      setTouchStart(e.targetTouches[0].clientX);
      setTouchEnd(null);

      // Start long press timer
      const timer = setTimeout(() => {
        setShowMobileActions(true);
        setUpdateMessage("Mobile actions available");
        setTimeout(() => setUpdateMessage(""), 2000);
      }, 500);
      setLongPressTimer(timer);
    }, []);

    const handleTouchMove = useCallback(
      (e) => {
        setTouchEnd(e.targetTouches[0].clientX);

        // Cancel long press if user moves finger
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      },
      [longPressTimer]
    );

    const handleTouchEnd = useCallback(() => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      // Cancel long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (isLeftSwipe) {
        // Navigate to next word
        if (onNavigateNext) {
          onNavigateNext();
          setUpdateMessage("Next word");
          setTimeout(() => setUpdateMessage(""), 1500);
        }
      } else if (isRightSwipe) {
        // Navigate to previous word
        if (onNavigatePrevious) {
          onNavigatePrevious();
          setUpdateMessage("Previous word");
          setTimeout(() => setUpdateMessage(""), 1500);
        }
      }

      setTouchStart(null);
      setTouchEnd(null);
    }, [
      touchStart,
      touchEnd,
      onNavigateNext,
      onNavigatePrevious,
      longPressTimer,
    ]);

    // Keyboard navigation handler (desktop only)
    const handleKeyDown = useCallback(
      (event) => {
        if (isMobile) return; // Disable keyboard navigation on mobile

        const { key, ctrlKey, shiftKey, altKey } = event;

        // Prevent default for navigation keys
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
            "Enter",
            " ",
          ].includes(key)
        ) {
          event.preventDefault();
        }

        switch (key) {
          case "ArrowUp":
            if (focusedElement === "word") {
              setFocusedElement("audio");
            } else if (focusedElement === "audio") {
              setFocusedElement("pronunciation");
            } else if (focusedElement === "pronunciation") {
              setFocusedElement("favorite");
            } else if (focusedElement === "favorite") {
              setFocusedElement("word");
            }
            break;

          case "ArrowDown":
            if (focusedElement === "word") {
              setFocusedElement("favorite");
            } else if (focusedElement === "favorite") {
              setFocusedElement("pronunciation");
            } else if (focusedElement === "pronunciation") {
              setFocusedElement("audio");
            } else if (focusedElement === "audio") {
              setFocusedElement("word");
            }
            break;

          case "ArrowLeft":
            if (isRTL) {
              // Navigate to next word
              if (onNavigateNext) {
                onNavigateNext();
              }
            } else {
              // Navigate to previous word
              if (onNavigatePrevious) {
                onNavigatePrevious();
              }
            }
            break;

          case "ArrowRight":
            if (isRTL) {
              // Navigate to previous word
              if (onNavigatePrevious) {
                onNavigatePrevious();
              }
            } else {
              // Navigate to next word
              if (onNavigateNext) {
                onNavigateNext();
              }
            }
            break;

          case "Enter":
          case " ":
            // Activate focused element
            if (focusedElement === "audio") {
              handleQuickAudioPlay();
            } else if (focusedElement === "pronunciation") {
              handlePronunciation();
            } else if (focusedElement === "favorite") {
              handleToggleFavorite();
            } else if (focusedElement === "learned") {
              handleMarkAsLearned();
            } else if (focusedElement === "difficult") {
              handleMarkAsDifficult();
            }
            break;

          case "Tab":
            // Allow default tab behavior but show navigation hint
            setShowNavigationHint(true);
            setTimeout(() => setShowNavigationHint(false), 3000);
            break;

          case "Escape":
            // Close any open dialogs or return to word focus
            setFocusedElement("word");
            break;

          case "h":
          case "H":
            if (ctrlKey) {
              // Show help
              setShowNavigationHint(true);
              setTimeout(() => setShowNavigationHint(false), 5000);
            }
            break;
        }
      },
      [focusedElement, isRTL, onNavigateNext, onNavigatePrevious, isMobile]
    );

    // Focus management
    useEffect(() => {
      const card = cardRef.current;
      if (card && !isMobile) {
        card.focus();
      }
    }, [isMobile]);

    // Memoized status helpers
    const statusColor = useMemo(() => {
      if (isLearned) return "success";
      if (isDifficult) return "warning";
      return "default";
    }, [isLearned, isDifficult]);

    const statusIcon = useMemo(() => {
      if (isLearned) return <CheckCircleIcon />;
      if (isDifficult) return <WarningIcon />;
      return null;
    }, [isLearned, isDifficult]);

    const statusText = useMemo(() => {
      if (isLearned) return t("vocabulary.learned", "Learned");
      if (isDifficult) return t("vocabulary.difficult", "Difficult");
      return t("vocabulary.new", "New");
    }, [isLearned, isDifficult, t]);

    // Memoized difficulty color
    const difficultyColor = useMemo(
      () => getDifficultyColor(word.difficulty_level || word.level),
      [word.difficulty_level, word.level]
    );

    // Memoized frequency description
    const frequencyDescription = useMemo(
      () => (word.frequency ? getFrequencyDescription(word.frequency) : null),
      [word.frequency]
    );

    // Memoized examples to show
    const examplesToShow = useMemo(() => {
      const examples = word.example ? [word.example] : word.examples || [];
      return examples.slice(0, expanded ? examples.length : 2);
    }, [word.example, word.examples, expanded]);

    // Memoized action handlers
    const handleToggleExpand = useCallback(() => {
      setExpanded((prev) => !prev);
    }, []);

    const handlePronunciation = useCallback(() => {
      if (onPronunciationClick) {
        onPronunciationClick(word);
      }
    }, [onPronunciationClick, word]);

    // Quick audio playback
    const handleQuickAudioPlay = useCallback(async () => {
      if (isPlayingAudio) {
        // Stop current audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlayingAudio(false);
        return;
      }

      try {
        setAudioError(null);
        setIsPlayingAudio(true);

        // Try to get audio URL
        let audioUrl = null;

        if (word.audioUrl) {
          audioUrl = word.audioUrl;
        } else {
          // Try to get from audio service
          try {
            const audioSource = await studentAudioService.getAudioUrl(
              word.word,
              {
                preferAccent: "us",
                fallbackToTTS: true,
              }
            );
            audioUrl = audioSource?.audio;
          } catch (error) {
            console.error("Error getting audio URL:", error);
          }
        }

        if (audioUrl) {
          // Create audio element
          const audio = new Audio(audioUrl);
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => {
            setAudioError("Failed to play audio");
            setIsPlayingAudio(false);
          };

          audioRef.current = audio;
          await audio.play();
        } else {
          setAudioError("No audio available");
          setIsPlayingAudio(false);
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        setAudioError("Failed to play audio");
        setIsPlayingAudio(false);
      }
    }, [isPlayingAudio, word]);

    // Enhanced handlers with optimistic updates
    const handleMarkAsLearned = useCallback(async () => {
      if (isUpdating) return;

      try {
        setIsUpdating(true);
        setOptimisticStatus("learned");
        setUpdateMessage("Marking as learned...");

        // Call the context function
        if (markWordAsLearned) {
          await markWordAsLearned(word.id);
        } else if (onMarkAsLearned) {
          await onMarkAsLearned(word.id);
        }

        setUpdateMessage("Word marked as learned!");
        setTimeout(() => setUpdateMessage(""), 2000);
      } catch (error) {
        console.error("Error marking word as learned:", error);
        setOptimisticStatus(null); // Revert optimistic update
        setUpdateMessage("Failed to mark as learned");
        setTimeout(() => setUpdateMessage(""), 3000);
      } finally {
        setIsUpdating(false);
      }
    }, [isUpdating, markWordAsLearned, onMarkAsLearned, word.id]);

    const handleMarkAsDifficult = useCallback(async () => {
      if (isUpdating) return;

      try {
        setIsUpdating(true);
        setOptimisticStatus("difficult");
        setUpdateMessage("Marking as difficult...");

        // Call the context function
        if (markWordAsDifficult) {
          await markWordAsDifficult(word.id);
        } else if (onMarkAsDifficult) {
          await onMarkAsDifficult(word.id);
        }

        setUpdateMessage("Word marked as difficult!");
        setTimeout(() => setUpdateMessage(""), 2000);
      } catch (error) {
        console.error("Error marking word as difficult:", error);
        setOptimisticStatus(null); // Revert optimistic update
        setUpdateMessage("Failed to mark as difficult");
        setTimeout(() => setUpdateMessage(""), 3000);
      } finally {
        setIsUpdating(false);
      }
    }, [isUpdating, markWordAsDifficult, onMarkAsDifficult, word.id]);

    const handleToggleFavorite = useCallback(async () => {
      if (isUpdating) return;

      try {
        setIsUpdating(true);
        setOptimisticFavorite(!isFavorite);
        setUpdateMessage(
          isFavorite ? "Removing from favorites..." : "Adding to favorites..."
        );

        // Validate required data
        if (!word.id) {
          throw new Error("Word ID is missing");
        }

        // Call the context function
        if (toggleFavorite) {
          console.log(
            "🔄 Toggling favorite for word:",
            word.id,
            "Current status:",
            isFavorite
          );
          await toggleFavorite(word.id);
          console.log("✅ Favorite toggle successful");
        } else if (onToggleFavorite) {
          console.log("🔄 Using prop function for favorite toggle");
          await onToggleFavorite(word.id);
        } else {
          throw new Error("No toggle function available");
        }

        setUpdateMessage(
          isFavorite ? "Removed from favorites!" : "Added to favorites!"
        );
        setTimeout(() => setUpdateMessage(""), 2000);
      } catch (error) {
        console.error("❌ Error toggling favorite:", error);
        console.error("🔍 Error details:", {
          wordId: word.id,
          wordWord: word.word,
          isFavorite,
          hasToggleFunction: !!toggleFavorite,
          hasOnToggleFavorite: !!onToggleFavorite,
          errorMessage: error.message,
          errorStack: error.stack,
        });

        setOptimisticFavorite(null); // Revert optimistic update
        setUpdateMessage(`Failed to update favorites: ${error.message}`);
        setTimeout(() => setUpdateMessage(""), 5000);
      } finally {
        setIsUpdating(false);
      }
    }, [
      isUpdating,
      toggleFavorite,
      onToggleFavorite,
      word.id,
      isFavorite,
      currentUser,
    ]);

    return (
      <>
        <Card
          ref={cardRef}
          tabIndex={isMobile ? -1 : 0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            mb: 3,
            position: "relative",
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            "&:hover": {
              boxShadow: theme.shadows[4],
              transform: "translateY(-2px)",
              transition: "all 0.3s ease-in-out",
            },
            // Visual feedback for updating state
            ...(isUpdating && {
              opacity: 0.7,
              pointerEvents: "none",
            }),
            // RTL support
            direction: isRTL ? "rtl" : "ltr",
            // Focus styles (desktop only)
            ...(!isMobile && {
              "&:focus": {
                outline: "2px solid",
                outlineColor: theme.palette.primary.main,
                outlineOffset: "2px",
              },
            }),
            // Mobile touch feedback
            ...(isMobile && {
              cursor: "pointer",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "pan-y",
            }),
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            {/* Mobile Navigation Hint */}
            {isMobile && (
              <Box sx={{ mb: 2, textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    fontSize: "0.75rem",
                  }}
                >
                  <GestureIcon fontSize="small" />
                  Swipe left/right to navigate • Long press for actions
                </Typography>
              </Box>
            )}

            {/* Navigation Hint (Desktop) */}
            {!isMobile && showNavigationHint && (
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  fontSize: "0.875rem",
                  "& .MuiAlert-message": {
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  },
                }}
                onClose={() => setShowNavigationHint(false)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ArrowUpIcon fontSize="small" />
                  <ArrowDownIcon fontSize="small" />
                  <ArrowLeftIcon fontSize="small" />
                  <ArrowRightIcon fontSize="small" />
                  <Typography variant="body2">
                    Use arrow keys to navigate, Enter/Space to activate
                  </Typography>
                </Box>
              </Alert>
            )}

            {/* Word Header Section */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    component="h1"
                    sx={{
                      mb: 1,
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                      textAlign: isRTL ? "right" : "left",
                      cursor: isMobile ? "pointer" : "pointer",
                      "&:hover": {
                        color: theme.palette.primary.dark,
                      },
                    }}
                    onClick={() => setFocusedElement("word")}
                  >
                    {word.word}
                  </Typography>

                  {/* Pronunciation */}
                  {word.pronunciation && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        flexDirection: isRTL ? "row-reverse" : "row",
                      }}
                    >
                      <LanguageIcon
                        sx={{
                          mr: isRTL ? 0 : 1,
                          ml: isRTL ? 1 : 0,
                          color: "text.secondary",
                          fontSize: 18,
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily:
                            '"Doulos SIL", "Charis SIL", "Gentium Plus", "DejaVu Sans", "Lucida Sans Unicode", "Arial Unicode MS", "Times New Roman", serif',
                          color: theme.palette.text.secondary,
                          bgcolor: theme.palette.grey[100],
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: "1rem",
                          textAlign: isRTL ? "right" : "left",
                          fontWeight: 500,
                          letterSpacing: "0.5px",
                        }}
                      >
                        /{word.pronunciation}/
                      </Typography>
                    </Box>
                  )}

                  {/* Tags Row */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      mb: 2,
                      justifyContent: isRTL ? "flex-end" : "flex-start",
                    }}
                  >
                    {word.difficulty_level && (
                      <Chip
                        label={word.difficulty_level}
                        size="small"
                        sx={{
                          bgcolor: difficultyColor,
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    )}

                    {word.part_of_speech && (
                      <Chip
                        label={word.part_of_speech}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}

                    {word.category && (
                      <Chip
                        label={word.category}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    )}

                    {word.frequency && (
                      <Chip
                        label={word.frequency}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    )}

                    <Chip
                      icon={isRTL ? null : statusIcon}
                      label={
                        isRTL ? (
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {statusText}
                            <Box component="span" sx={{ ml: 0.5 }}>
                              {statusIcon}
                            </Box>
                          </Box>
                        ) : (
                          statusText
                        )
                      }
                      size="small"
                      color={statusColor}
                      variant={isLearned || isDifficult ? "filled" : "outlined"}
                    />
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box
                  ref={actionButtonsRef}
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: "column",
                    ml: isRTL ? 0 : 1,
                    mr: isRTL ? 1 : 0,
                  }}
                >
                  {/* Quick Audio Play Button */}
                  <Tooltip
                    title={isPlayingAudio ? "Stop audio" : "Play pronunciation"}
                  >
                    <IconButton
                      onClick={handleQuickAudioPlay}
                      color={isPlayingAudio ? "error" : "primary"}
                      size={isMobile ? "medium" : "small"}
                      disabled={isUpdating}
                      sx={{
                        bgcolor: isPlayingAudio
                          ? "error.light"
                          : "primary.light",
                        "&:hover": {
                          bgcolor: isPlayingAudio
                            ? "error.main"
                            : "primary.main",
                        },
                        ...(focusedElement === "audio" &&
                          !isMobile && {
                            outline: "2px solid",
                            outlineColor: theme.palette.primary.main,
                            outlineOffset: "2px",
                          }),
                      }}
                      onFocus={() => !isMobile && setFocusedElement("audio")}
                    >
                      {isPlayingAudio ? <PlayArrowIcon /> : <VolumeUpIcon />}
                    </IconButton>
                  </Tooltip>

                  {/* Practice Pronunciation Button */}
                  <Tooltip title="Practice pronunciation">
                    <IconButton
                      onClick={handlePronunciation}
                      color="primary"
                      size={isMobile ? "medium" : "small"}
                      disabled={isUpdating}
                      sx={{
                        bgcolor: "secondary.light",
                        "&:hover": {
                          bgcolor: "secondary.main",
                        },
                        ...(focusedElement === "pronunciation" &&
                          !isMobile && {
                            outline: "2px solid",
                            outlineColor: theme.palette.primary.main,
                            outlineOffset: "2px",
                          }),
                      }}
                      onFocus={() =>
                        !isMobile && setFocusedElement("pronunciation")
                      }
                    >
                      <MicIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip
                    title={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <IconButton
                      onClick={handleToggleFavorite}
                      color={isFavorite ? "secondary" : "default"}
                      size={isMobile ? "medium" : "small"}
                      disabled={isUpdating}
                      sx={{
                        ...(focusedElement === "favorite" &&
                          !isMobile && {
                            outline: "2px solid",
                            outlineColor: theme.palette.primary.main,
                            outlineOffset: "2px",
                          }),
                      }}
                      onFocus={() => !isMobile && setFocusedElement("favorite")}
                    >
                      {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Audio Error Display */}
              {audioError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {audioError}
                </Alert>
              )}
            </Box>

            {/* Meanings Section */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Arabic Meaning */}
              {word.meaning_arabic && (
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.secondary.light}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1,
                        flexDirection: "row-reverse", // Always RTL for Arabic
                      }}
                    >
                      <TranslateIcon
                        sx={{
                          mr: 1,
                          color: "secondary.main",
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ textAlign: "right" }}
                      >
                        المعنى بالعربية
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.6,
                        direction: "rtl",
                        textAlign: "right",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {word.meaning_arabic}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>

            {/* Examples Section */}
            {examplesToShow.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexDirection: isRTL ? "row-reverse" : "row",
                    justifyContent: isRTL ? "flex-end" : "flex-start",
                  }}
                >
                  <SchoolIcon color="primary" />
                  {t("vocabulary.examples", "Examples")}
                </Typography>

                <List dense>
                  {examplesToShow.map((example, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        px: 0,
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          width: "100%",
                          borderRadius: 2,
                          bgcolor: "background.paper",
                        }}
                      >
                        {/* English Example */}
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: "italic",
                            color: "text.primary",
                            mb: 1,
                            textAlign: isRTL ? "right" : "left",
                          }}
                        >
                          "{example}"
                        </Typography>

                        {/* Arabic Translation */}
                        {word.example_meaning_arabic && index === 0 && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              direction: "rtl",
                              textAlign: "right",
                              fontFamily: "Arial, sans-serif",
                              fontStyle: "italic",
                            }}
                          >
                            "{word.example_meaning_arabic}"
                          </Typography>
                        )}
                      </Paper>
                    </ListItem>
                  ))}
                </List>

                {word.examples && word.examples.length > 2 && (
                  <Button
                    onClick={handleToggleExpand}
                    size="small"
                    endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{
                      mt: 1,
                      alignSelf: isRTL ? "flex-end" : "flex-start",
                    }}
                  >
                    {expanded
                      ? t("vocabulary.showLess", "Show Less")
                      : t("vocabulary.showMore", "Show More")}
                  </Button>
                )}
              </Box>
            )}

            {/* Frequency Information */}
            {frequencyDescription && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {frequencyDescription}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 2,
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isRTL ? "flex-end" : "flex-start",
              }}
            >
              <Button
                variant={isLearned ? "outlined" : "contained"}
                color="success"
                size={isMobile ? "large" : "medium"}
                onClick={handleMarkAsLearned}
                disabled={isLearned || isUpdating}
                fullWidth={isMobile}
                sx={{
                  minWidth: isMobile ? "auto" : 120,
                  height: isMobile ? 56 : "auto",
                  fontSize: isMobile ? "1.1rem" : "inherit",
                  ...(focusedElement === "learned" &&
                    !isMobile && {
                      outline: "2px solid",
                      outlineColor: theme.palette.primary.main,
                      outlineOffset: "2px",
                    }),
                }}
                onFocus={() => !isMobile && setFocusedElement("learned")}
              >
                {isLearned
                  ? t("vocabulary.learned", "Learned")
                  : t("vocabulary.markAsLearned", "Mark as Learned")}
              </Button>

              <Button
                variant={isDifficult ? "outlined" : "contained"}
                color="warning"
                size={isMobile ? "large" : "large"}
                onClick={handleMarkAsDifficult}
                disabled={isDifficult || isUpdating}
                fullWidth={isMobile}
                startIcon={<WarningIcon />}
                sx={{
                  minWidth: isMobile ? "auto" : 160,
                  height: isMobile ? 56 : 48,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: isMobile ? "1.1rem" : "1rem",
                  boxShadow: isDifficult ? "none" : theme.shadows[3],
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[6],
                  },
                  transition: "all 0.2s ease-in-out",
                  ...(focusedElement === "difficult" &&
                    !isMobile && {
                      outline: "2px solid",
                      outlineColor: theme.palette.primary.main,
                      outlineOffset: "2px",
                    }),
                }}
                onFocus={() => !isMobile && setFocusedElement("difficult")}
              >
                {isDifficult
                  ? t("vocabulary.difficult", "Difficult")
                  : t("vocabulary.markAsDifficult", "Mark as Difficult")}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Mobile Navigation FABs */}
        {isMobile && (
          <>
            <Fab
              size="small"
              color="primary"
              onClick={onNavigatePrevious}
              sx={{
                position: "fixed",
                left: 16,
                bottom: 80,
                zIndex: 1000,
              }}
            >
              <NavigateBeforeIcon />
            </Fab>
            <Fab
              size="small"
              color="primary"
              onClick={onNavigateNext}
              sx={{
                position: "fixed",
                right: 16,
                bottom: 80,
                zIndex: 1000,
              }}
            >
              <NavigateNextIcon />
            </Fab>
          </>
        )}

        {/* Enhanced Success/Error Messages */}
        <Snackbar
          open={!!updateMessage}
          autoHideDuration={3000}
          onClose={() => setUpdateMessage("")}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setUpdateMessage("")}
            severity={updateMessage.includes("Failed") ? "error" : "success"}
            sx={{
              width: "100%",
              borderRadius: 2,
              fontWeight: 500,
              "& .MuiAlert-icon": {
                fontSize: "1.2rem",
              },
            }}
          >
            {updateMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }
);

StudentVocabularyWordCard.displayName = "StudentVocabularyWordCard";

export default StudentVocabularyWordCard;
