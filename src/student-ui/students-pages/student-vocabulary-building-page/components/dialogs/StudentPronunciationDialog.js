import React, { useState, useRef } from "react";
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
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  VolumeUp as VolumeUpIcon,
  Close as CloseIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StudentPronunciationDialog = ({ open, onClose, word }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
            {t("vocabulary.pronunciation", "Pronunciation")}
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
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
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
                  <InputLabel>{t("vocabulary.speed", "Speed")}</InputLabel>
                  <Select
                    value={playbackRate}
                    onChange={handlePlaybackRateChange}
                    label={t("vocabulary.speed", "Speed")}
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
            </Box>

            {/* Audio Element */}
            {word.audioUrl && (
              <audio
                ref={audioRef}
                src={word.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                style={{ display: "none" }}
              />
            )}

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
              {t(
                "vocabulary.noAudioAvailable",
                "No audio pronunciation available for this word"
              )}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button onClick={onClose} variant="contained">
          {t("common.close", "Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentPronunciationDialog;
