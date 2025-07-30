import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  VolumeUp as VolumeUpIcon,
  Close as CloseIcon,
  Speed as SpeedIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { usePronunciationPractice } from "../../hooks/usePronunciationPractice";
import studentAudioService from "../../../../../services/student-services/studentAudioService";

const StudentPronunciationDialog = ({ open, onClose, word }) => {
  const { t } = useTranslation();
  const {
    isListening,
    spokenText,
    pronunciationResult,
    error,
    isAnalyzing,
    practiceWord,
    stopListening,
    reset,
    getFeedbackColor,
    getAccuracyPercentage,
  } = usePronunciationPractice();

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const audioRef = useRef(null);

  // Get audio URL when dialog opens or word changes
  useEffect(() => {
    if (open && word) {
      loadAudioUrl();
    }
  }, [open, word]);

  // Auto-play audio when dialog opens
  useEffect(() => {
    if (open && audioUrl && !isPlaying) {
      // Small delay to ensure audio is loaded
      const timer = setTimeout(() => {
        handlePlayPause();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, audioUrl]);

  // Load audio URL for the word
  const loadAudioUrl = async () => {
    if (!word) return;

    try {
      setAudioLoading(true);
      setAudioError(null);

      // Try to get audio URL from the audio service
      const audioSource = await studentAudioService.getAudioUrl(word.word, {
        preferAccent: "us", // Default to US accent
        fallbackToTTS: true,
      });

      if (audioSource && audioSource.audio) {
        setAudioUrl(audioSource.audio);
        console.log("🎵 Audio URL loaded:", audioSource.audio);
      } else {
        // Fallback to word's audioUrl if available
        if (word.audioUrl) {
          setAudioUrl(word.audioUrl);
          console.log("🎵 Using word's audio URL:", word.audioUrl);
        } else {
          setAudioError("No audio available for this word");
          console.log("❌ No audio available for word:", word.word);
        }
      }
    } catch (error) {
      console.error("Error loading audio URL:", error);
      setAudioError("Failed to load audio");
    } finally {
      setAudioLoading(false);
    }
  };

  // Audio playback handlers
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error playing audio:", error);
      setAudioError("Failed to play audio");
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue;
    }
  };

  const handlePlaybackRateChange = (event) => {
    const newRate = event.target.value;
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = (error) => {
    console.error("Audio error:", error);
    setAudioError("Failed to load audio");
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  // Speech recognition handlers
  const handleStartListening = async () => {
    if (!word) return;

    try {
      await practiceWord(word.word, { lang: "en-US" });
    } catch (error) {
      // Error is already handled by the hook
      console.error("Pronunciation practice failed:", error);
    }
  };

  const handleRetry = () => {
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" component="div">
            {t("vocabulary.pronunciation")}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {word ? (
          <Box sx={{ textAlign: "center" }}>
            {/* Word Display */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 3,
                bgcolor: "primary.light",
                color: "white",
              }}
            >
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {word.word}
              </Typography>

              {word.pronunciation && (
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  /{word.pronunciation}/
                </Typography>
              )}
            </Paper>

            {/* Audio Controls */}
            <Box sx={{ mb: 3 }}>
              {audioError ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {audioError}
                </Alert>
              ) : audioLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <LinearProgress sx={{ width: "100%" }} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Loading audio...
                  </Typography>
                </Box>
              ) : audioUrl ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <IconButton
                      onClick={handlePlayPause}
                      size="large"
                      color="primary"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>

                    <IconButton
                      onClick={handleStop}
                      size="large"
                      color="secondary"
                      variant="outlined"
                    >
                      <StopIcon />
                    </IconButton>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Slider
                      value={currentTime}
                      max={duration}
                      onChange={handleSeek}
                      sx={{ color: "primary.main" }}
                    />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(currentTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(duration)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Volume Control */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <VolumeUpIcon color="action" />
                    <Slider
                      value={volume}
                      onChange={handleVolumeChange}
                      min={0}
                      max={1}
                      step={0.1}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  {/* Playback Speed */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <SpeedIcon color="action" />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>{t("vocabulary.speed")}</InputLabel>
                      <Select
                        value={playbackRate}
                        onChange={handlePlaybackRateChange}
                        label={t("vocabulary.speed")}
                      >
                        <MenuItem value={0.5}>0.5x</MenuItem>
                        <MenuItem value={0.75}>0.75x</MenuItem>
                        <MenuItem value={1}>1x</MenuItem>
                        <MenuItem value={1.25}>1.25x</MenuItem>
                        <MenuItem value={1.5}>1.5x</MenuItem>
                        <MenuItem value={2}>2x</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No audio available for this word
                </Alert>
              )}
            </Box>

            {/* Speech Recognition Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Practice Your Pronunciation
                </Typography>

                {/* Error Display */}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {/* Recording Controls */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color={isListening ? "error" : "primary"}
                    startIcon={isListening ? <MicOffIcon /> : <MicIcon />}
                    onClick={isListening ? stopListening : handleStartListening}
                    disabled={isAnalyzing}
                    size="large"
                  >
                    {isListening ? "Stop Recording" : "Start Recording"}
                  </Button>

                  {pronunciationResult && (
                    <Button
                      variant="outlined"
                      onClick={handleRetry}
                      disabled={isListening}
                    >
                      Try Again
                    </Button>
                  )}
                </Box>

                {/* Recording Status */}
                {isListening && (
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <LinearProgress sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Listening... Speak the word clearly
                    </Typography>
                  </Box>
                )}

                {/* Spoken Text Display */}
                {spokenText && (
                  <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      You said:
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                      "{spokenText}"
                    </Typography>
                  </Paper>
                )}

                {/* Pronunciation Results */}
                {pronunciationResult && (
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h4" color="primary">
                              {getAccuracyPercentage(
                                pronunciationResult.accuracy
                              )}
                              %
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Accuracy
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: "center" }}>
                            <Typography variant="h4" color="secondary">
                              {Math.round(pronunciationResult.similarity * 100)}
                              %
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Similarity
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Feedback */}
                    <Alert
                      severity={getFeedbackColor(pronunciationResult.accuracy)}
                      icon={
                        pronunciationResult.isCorrect ? (
                          <CheckCircleIcon />
                        ) : (
                          <ErrorIcon />
                        )
                      }
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body1">
                        {pronunciationResult.feedback}
                      </Typography>
                    </Alert>

                    {/* Detailed Metrics */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Detailed Analysis:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={`Confidence: ${Math.round(
                            pronunciationResult.confidence * 100
                          )}%`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Duration: ${Math.round(
                            pronunciationResult.speakingDuration / 1000
                          )}s`}
                          size="small"
                          variant="outlined"
                        />
                        {pronunciationResult.mispronouncedWords.length > 0 && (
                          <Chip
                            label={`Mispronounced: ${pronunciationResult.mispronouncedWords.join(
                              ", "
                            )}`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Definition */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: "grey.50" }}>
              <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                {word.definition}
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t("vocabulary.noAudioAvailable")}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button onClick={onClose} variant="contained">
          {t("common.close")}
        </Button>
      </DialogActions>

      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          style={{ display: "none" }}
        />
      )}
    </Dialog>
  );
};

export default StudentPronunciationDialog;
