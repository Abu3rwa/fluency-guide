// studentElevenlabsService.js
// Ported from migrate/lib/services/elevenlabs_service.dart
// Handles ElevenLabs TTS logic for students (browser fetch + Audio API)

const BASE_URL = "https://api.elevenlabs.io/v1";

// Get available voices
export async function getVoices(apiKey) {
  try {
    const response = await fetch(`${BASE_URL}/voices`, {
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok)
      throw new Error(`Failed to load voices: ${response.status}`);
    const data = await response.json();
    return data.voices || [];
  } catch (e) {
    console.error("Error fetching voices:", e);
    throw e;
  }
}

// Convert text to speech
export async function textToSpeech({
  apiKey,
  text,
  voiceId,
  modelId = "eleven_monolingual_v1",
  stability = 0.5,
  similarityBoost = 0.75,
}) {
  try {
    const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    });
    if (!response.ok)
      throw new Error(`Failed to generate speech: ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } catch (e) {
    console.error("Error generating speech:", e);
    throw e;
  }
}

// Play audio from a URL
export function playAudio(url) {
  const audio = new Audio(url);
  audio.play();
  return audio;
}

// Stop audio playback
export function stopAudio(audioInstance) {
  if (audioInstance && typeof audioInstance.pause === "function") {
    audioInstance.pause();
    audioInstance.currentTime = 0;
  }
}

const studentElevenlabsService = {
  getVoices,
  textToSpeech,
  playAudio,
  stopAudio,
};

export default studentElevenlabsService;
