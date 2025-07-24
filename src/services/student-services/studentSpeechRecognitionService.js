// studentSpeechRecognitionService.js
// Ported from migrate/lib/services/speech_recognition_service.dart
// Handles speech recognition logic for students (browser Web Speech API)

// Start speech recognition (returns a Promise that resolves with the transcript)
export function startSpeechRecognition({ lang = "en-US" } = {}) {
  return new Promise((resolve, reject) => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      reject(new Error("Speech recognition not supported in this browser."));
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    recognition.onerror = (event) => {
      reject(event.error);
    };
    recognition.start();
  });
}

// Stop speech recognition (not always needed, but provided for completeness)
export function stopSpeechRecognition(recognitionInstance) {
  if (recognitionInstance && typeof recognitionInstance.stop === "function") {
    recognitionInstance.stop();
  }
}

const studentSpeechRecognitionService = {
  startSpeechRecognition,
  stopSpeechRecognition,
};

export default studentSpeechRecognitionService;
