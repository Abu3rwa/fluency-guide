// Import audio files from assets
import correctSound from '../../../../assets/sounds/correct.mp3';
import incorrectSound from '../../../../assets/sounds/inCorrect.mp3';
import congratulationsSound from '../../../../assets/sounds/congratulations.mp3';
import clockTickingSound from '../../../../assets/sounds/clock-ticking.mp3';

// Audio configuration
const AUDIO_CONFIG = {
  enabled: true,
  volume: 0.3,
  fallbackToSystemSounds: true
};

// Check if audio is supported and files exist
const checkAudioSupport = () => {
  try {
    const audio = new Audio();
    return !!(audio.canPlayType && audio.canPlayType('audio/mpeg'));
  } catch (e) {
    return false;
  }
};

// Create system sound fallback
const createSystemSound = (frequency, duration) => {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(AUDIO_CONFIG.volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn('System sound fallback failed:', e);
  }
};

// Audio file mapping
const AUDIO_FILES = {
  correct: correctSound,
  incorrect: incorrectSound,
  congratulations: congratulationsSound,
  clockTicking: clockTickingSound
};

export const playSound = (type) => {
  if (!AUDIO_CONFIG.enabled) return;
  
  // Get the audio file URL for the requested type
  const audioUrl = AUDIO_FILES[type];
  
  if (!audioUrl) {
    console.warn(`Audio type '${type}' not found`);
    // Fallback to system sounds for unknown types
    if (AUDIO_CONFIG.fallbackToSystemSounds) {
      createSystemSound(400, 0.1); // Medium pitch
    }
    return;
  }
  
  // Try to play audio file
  const audio = new Audio(audioUrl);
  
  audio.volume = AUDIO_CONFIG.volume;
  
  audio.play()
    .then(() => {
      // Audio played successfully
    })
    .catch((error) => {
      console.warn(`Failed to play audio: ${type}`, error);
      
      // Fallback to system sounds
      if (AUDIO_CONFIG.fallbackToSystemSounds) {
        switch (type) {
          case 'correct':
            createSystemSound(800, 0.2); // High pitch, short duration
            break;
          case 'incorrect':
            createSystemSound(200, 0.3); // Low pitch, longer duration
            break;
          case 'congratulations':
            createSystemSound(600, 0.5); // Medium-high pitch, longer duration
            break;
          case 'clockTicking':
            createSystemSound(300, 0.1); // Low-medium pitch, very short
            break;
          default:
            createSystemSound(400, 0.1); // Medium pitch
        }
      }
    });
};

export const playCorrectSound = () => playSound("correct");
export const playIncorrectSound = () => playSound("incorrect");
export const playCongratulationsSound = () => playSound("congratulations");
export const playClockTickingSound = () => playSound("clockTicking");

// Utility to enable/disable audio
export const setAudioEnabled = (enabled) => {
  AUDIO_CONFIG.enabled = enabled;
};

export const setAudioVolume = (volume) => {
  AUDIO_CONFIG.volume = Math.max(0, Math.min(1, volume));
};
