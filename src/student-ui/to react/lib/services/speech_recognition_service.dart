import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart' as tts;
import 'package:permission_handler/permission_handler.dart';
import 'pronunciation_progress_service.dart';
import '../../../../../migrate/lib/models/pronunciation_progress.dart';

class SpeechRecognitionService {
  static final SpeechRecognitionService _instance =
      SpeechRecognitionService._internal();
  factory SpeechRecognitionService() => _instance;
  SpeechRecognitionService._internal();

  final stt.SpeechToText _speech = stt.SpeechToText();
  final tts.FlutterTts _tts = tts.FlutterTts();
  final PronunciationProgressService _pronunciationService =
      PronunciationProgressService();

  bool _isInitialized = false;
  bool _isListening = false;
  bool _isTtsInitialized = false;
  bool _isDisposed = false;
  String _lastWords = '';
  double _confidence = 0.0;
  DateTime? _listeningStartTime;

  // Stream controllers for real-time updates
  final StreamController<String> _wordsStreamController =
      StreamController<String>.broadcast();
  final StreamController<double> _confidenceStreamController =
      StreamController<double>.broadcast();
  final StreamController<bool> _listeningStreamController =
      StreamController<bool>.broadcast();
  final StreamController<PronunciationProgress> _pronunciationResultController =
      StreamController<PronunciationProgress>.broadcast();

  // Getters
  bool get isInitialized => _isInitialized;
  bool get isListening => _isListening;
  bool get isTtsInitialized => _isTtsInitialized;
  String get lastWords => _lastWords;
  double get confidence => _confidence;

  // Streams
  Stream<String> get wordsStream => _wordsStreamController.stream;
  Stream<double> get confidenceStream => _confidenceStreamController.stream;
  Stream<bool> get listeningStream => _listeningStreamController.stream;
  Stream<PronunciationProgress> get pronunciationResultStream =>
      _pronunciationResultController.stream;

  /// Request microphone permission explicitly
  Future<bool> requestMicrophonePermission() async {
    try {
      debugPrint('Requesting microphone permission...');

      // Check current permission status
      final status = await Permission.microphone.status;
      debugPrint('Current microphone permission status: $status');

      if (status == PermissionStatus.granted) {
        debugPrint('Microphone permission already granted');
        return true;
      }

      if (status == PermissionStatus.denied) {
        debugPrint('Requesting microphone permission...');
        final result = await Permission.microphone.request();
        debugPrint('Permission request result: $result');
        return result == PermissionStatus.granted;
      }

      if (status == PermissionStatus.permanentlyDenied) {
        debugPrint('Microphone permission permanently denied');
        // Show dialog to open app settings
        return false;
      }

      return false;
    } catch (e) {
      debugPrint('Error requesting microphone permission: $e');
      return false;
    }
  }

  /// Check if microphone permission is granted
  Future<bool> hasMicrophonePermission() async {
    final status = await Permission.microphone.status;
    return status == PermissionStatus.granted;
  }

  /// Initialize speech recognition and TTS
  Future<bool> initialize() async {
    if (_isInitialized && _isTtsInitialized) return true;

    try {
      debugPrint('Starting speech recognition and TTS initialization...');

      // Request microphone permission
      final hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        debugPrint('Microphone permission not granted');
        return false;
      }

      // Initialize speech recognition
      _isInitialized = await _speech.initialize(
        onError: (error) {
          debugPrint('Speech recognition error: ${error.errorMsg}');
          _isListening = false;
          if (!_listeningStreamController.isClosed) {
            _listeningStreamController.add(false);
          }
        },
        onStatus: (status) {
          debugPrint('Speech recognition status: $status');
          if (status == 'done' || status == 'notListening') {
            _isListening = false;
            if (!_listeningStreamController.isClosed) {
              _listeningStreamController.add(false);
            }
          }
        },
        debugLogging: true,
      );
      debugPrint('Speech recognition initialized: $_isInitialized');

      // Initialize TTS
      await _initializeTts();

      // Add a small delay to ensure proper initialization
      if (_isInitialized && _isTtsInitialized) {
        await Future.delayed(const Duration(milliseconds: 500));
        debugPrint('Initialization delay completed');

        // Test punctuation removal
        debugPrint('Testing punctuation removal:');
        _testPunctuationRemoval();
      }

      return _isInitialized && _isTtsInitialized;
    } catch (e, stackTrace) {
      debugPrint('Error initializing speech services: $e');
      debugPrint('Stack trace: $stackTrace');
      return false;
    }
  }

  /// Initialize Text-to-Speech
  Future<void> _initializeTts() async {
    try {
      // Set language to Australian English
      await _tts.setLanguage("en-US");

      // Set the Australian English voice "Karen"
      await _tts.setVoice({"name": "Mike", "locale": "en-US"});

      // Optimize for natural speech with best available voice
      await optimizeForNaturalSpeech();

      _isTtsInitialized = true;
      debugPrint('TTS initialized successfully with Karen voice (en-AU)');
    } catch (e) {
      debugPrint('Error initializing TTS: $e');
      _isTtsInitialized = false;
    }
  }

  /// Speak text using TTS
  Future<void> speak(String text) async {
    if (!_isTtsInitialized) {
      await _initializeTts();
    }

    try {
      await _tts.speak(text);
      debugPrint('Speaking: $text');
    } catch (e) {
      debugPrint('Error speaking text: $e');
    }
  }

  /// Stop TTS
  Future<void> stopSpeaking() async {
    try {
      await _tts.stop();
      debugPrint('Stopped speaking');
    } catch (e) {
      debugPrint('Error stopping TTS: $e');
    }
  }

  /// Safely add event to stream controller
  void _safeAddToStream<T>(StreamController<T> controller, T event) {
    if (!_isDisposed && !controller.isClosed) {
      try {
        controller.add(event);
      } catch (e) {
        debugPrint('Error adding event to stream: $e');
      }
    }
  }

  /// Start listening for speech
  Future<bool> startListening({
    String? localeId,
    Duration? listenFor,
    Duration? pauseFor,
    bool? partialResults,
    bool? onDevice,
  }) async {
    debugPrint('=== SPEECH SERVICE START LISTENING ===');
    debugPrint('Current initialization status: $_isInitialized');

    if (!_isInitialized) {
      debugPrint('Not initialized, attempting to initialize...');
      final initialized = await initialize();
      debugPrint('Initialization result: $initialized');
      if (!initialized) {
        debugPrint('Failed to initialize, returning false');
        return false;
      }
    }

    if (_isListening) {
      debugPrint('Already listening, stopping first...');
      await stopListening();
    }

    try {
      debugPrint('Setting up listening state...');
      _isListening = true;
      _listeningStartTime = DateTime.now();
      _safeAddToStream(_listeningStreamController, true);

      debugPrint('Starting speech.listen with parameters:');
      debugPrint('localeId: ${localeId ?? 'en_US'}');
      debugPrint('listenFor: ${listenFor ?? const Duration(seconds: 10)}');
      debugPrint('pauseFor: ${pauseFor ?? const Duration(seconds: 3)}');

      await _speech.listen(
        onResult: (result) {
          _lastWords = result.recognizedWords;
          _confidence = result.confidence;

          _safeAddToStream(_wordsStreamController, _lastWords);
          _safeAddToStream(_confidenceStreamController, _confidence);

          debugPrint('Recognized: $_lastWords (confidence: $_confidence)');
        },
        localeId: localeId ?? 'en_US',
        listenFor: listenFor ?? const Duration(seconds: 10),
        pauseFor: pauseFor ?? const Duration(seconds: 3),
        partialResults: partialResults ?? true,
        onDevice: onDevice ?? false,
      );

      debugPrint('Speech.listen completed successfully');
      debugPrint('Final listening status: $_isListening');
      return _isListening;
    } catch (e) {
      debugPrint('Error starting speech recognition: $e');
      _isListening = false;
      _listeningStartTime = null;
      _safeAddToStream(_listeningStreamController, false);
      return false;
    }
  }

  /// Stop listening
  Future<void> stopListening() async {
    if (!_isListening) return;

    try {
      await _speech.stop();
      _isListening = false;
      _safeAddToStream(_listeningStreamController, false);
      debugPrint('Stopped listening');
    } catch (e) {
      debugPrint('Error stopping speech recognition: $e');
    }
  }

  /// Cancel listening
  Future<void> cancelListening() async {
    try {
      await _speech.cancel();
      _isListening = false;
      _lastWords = '';
      _confidence = 0.0;
      _safeAddToStream(_listeningStreamController, false);
      _safeAddToStream(_wordsStreamController, '');
      _safeAddToStream(_confidenceStreamController, 0.0);
      debugPrint('Cancelled listening');
    } catch (e) {
      debugPrint('Error cancelling speech recognition: $e');
    }
  }

  /// Test punctuation removal (for debugging)
  void _testPunctuationRemoval() {
    final testCases = [
      'Hello, world!',
      'How are you?',
      'This is a test.',
      'No punctuation here',
      'Multiple... punctuation... marks...',
      'Quotes: "Hello" and \'world\'',
    ];

    for (final testCase in testCases) {
      final cleaned = _removePunctuation(testCase);
      debugPrint('Original: "$testCase" -> Cleaned: "$cleaned"');
    }
  }

  /// Remove punctuation from text for comparison
  String _removePunctuation(String text) {
    return text.replaceAll(RegExp(r'[^\w\s]'), '').trim();
  }

  /// Compare pronunciation with target word
  double comparePronunciation(String targetWord, String spokenWord) {
    if (spokenWord.isEmpty) return 0.0;

    // Remove punctuation and convert to lowercase for comparison
    final target = _removePunctuation(targetWord.toLowerCase());
    final spoken = _removePunctuation(spokenWord.toLowerCase());

    debugPrint('Comparing pronunciation:');
    debugPrint('Original target: "$targetWord"');
    debugPrint('Original spoken: "$spokenWord"');
    debugPrint('Cleaned target: "$target"');
    debugPrint('Cleaned spoken: "$spoken"');

    // Exact match
    if (target == spoken) return 1.0;

    // Check if target word is contained in spoken words
    if (spoken.contains(target)) return 0.9;

    // Check if spoken word is contained in target
    if (target.contains(spoken)) return 0.8;

    // Calculate similarity using simple character matching
    int matches = 0;
    int totalLength = target.length;

    for (int i = 0; i < target.length && i < spoken.length; i++) {
      if (target[i] == spoken[i]) {
        matches++;
      }
    }

    // Add bonus for length similarity
    double lengthSimilarity =
        1.0 - (target.length - spoken.length).abs() / target.length;

    // Calculate final similarity
    double characterSimilarity = matches / totalLength;
    double finalSimilarity =
        (characterSimilarity * 0.7) + (lengthSimilarity * 0.3);

    debugPrint('Pronunciation comparison result: $finalSimilarity');
    return finalSimilarity.clamp(0.0, 1.0);
  }

  /// Get pronunciation feedback
  String getPronunciationFeedback(
      String targetWord, String spokenWord, double similarity) {
    if (spokenWord.isEmpty) {
      return 'Please speak the word clearly';
    }

    if (similarity >= 0.9) {
      return 'Excellent pronunciation! 🎉';
    } else if (similarity >= 0.7) {
      return 'Good pronunciation! Try to speak more clearly';
    } else if (similarity >= 0.5) {
      return 'Fair pronunciation. Listen to the correct pronunciation and try again';
    } else {
      return 'Try again. Listen to the correct pronunciation carefully';
    }
  }

  /// Check if speech recognition is available
  Future<bool> isAvailable() async {
    if (!_isInitialized) {
      return await initialize();
    }
    return _isInitialized;
  }

  /// Check if speech recognition is supported on this device
  Future<bool> isSupported() async {
    try {
      debugPrint('Checking speech recognition support...');

      // First try to initialize if not already done
      if (!_isInitialized) {
        final initialized = await initialize();
        if (!initialized) {
          debugPrint('Failed to initialize speech recognition');
          return false;
        }
      }

      // For flutter_speech, we assume it's supported if initialization succeeds
      return _isInitialized;
    } catch (e) {
      debugPrint('Error checking speech recognition support: $e');
      return false;
    }
  }

  /// Get available locales (simplified for flutter_speech)
  Future<List<Map<String, String>>> get availableLocales async {
    // flutter_speech doesn't provide locale information in the same way
    // Return a default list of supported locales
    return [
      {'localeId': 'en_US', 'name': 'English (US)'},
      {'localeId': 'en_GB', 'name': 'English (UK)'},
    ];
  }

  /// Analyze pronunciation and create progress record
  Future<PronunciationProgress> analyzePronunciation(
    String userId,
    String targetWord,
    String spokenText,
    double confidence,
  ) async {
    final accuracy = _pronunciationService.calculateAccuracy(
        targetWord, spokenText, confidence);
    final similarity = comparePronunciation(targetWord, spokenText);
    final isCorrect = accuracy >= 0.8; // Threshold for correct pronunciation
    final mispronouncedWords =
        _pronunciationService.analyzeMispronouncedWords(targetWord, spokenText);
    final correctWords = _getCorrectWords(targetWord, spokenText);
    final speakingDuration = _listeningStartTime != null
        ? DateTime.now().difference(_listeningStartTime!)
        : Duration.zero;

    // Get attempt number from existing progress
    final existingSummary =
        await _pronunciationService.getPronunciationSummary(userId, targetWord);
    final attemptNumber = (existingSummary?.totalAttempts ?? 0) + 1;

    final progress = PronunciationProgress(
      userId: userId,
      word: targetWord,
      spokenText: spokenText,
      confidence: confidence,
      similarity: similarity,
      isCorrect: isCorrect,
      mispronouncedWords: mispronouncedWords,
      correctWords: correctWords,
      accuracy: accuracy,
      attemptNumber: attemptNumber,
      timestamp: DateTime.now(),
      speakingDuration: speakingDuration,
      feedback: _pronunciationService.generateFeedback(
        PronunciationProgress(
          userId: userId,
          word: targetWord,
          spokenText: spokenText,
          confidence: confidence,
          similarity: similarity,
          isCorrect: isCorrect,
          mispronouncedWords: mispronouncedWords,
          correctWords: correctWords,
          accuracy: accuracy,
          attemptNumber: attemptNumber,
          timestamp: DateTime.now(),
          speakingDuration: speakingDuration,
          feedback: '',
        ),
      ),
      additionalMetrics: {
        'targetWordLength': targetWord.length,
        'spokenTextLength': spokenText.length,
        'wordCount': spokenText.split(' ').length,
        'confidenceLevel': _getConfidenceLevel(confidence),
        'accuracyLevel': _getAccuracyLevel(accuracy),
      },
    );

    // Emit the result
    _pronunciationResultController.add(progress);

    return progress;
  }

  /// Get correct words from spoken text
  List<String> _getCorrectWords(String targetWord, String spokenText) {
    final target = _removePunctuation(targetWord.toLowerCase());
    final spoken = _removePunctuation(spokenText.toLowerCase());

    if (target == spoken) return [target];

    final targetWords = target.split(' ');
    final spokenWords = spoken.split(' ');
    final correct = <String>[];

    for (int i = 0; i < targetWords.length; i++) {
      if (i < spokenWords.length && targetWords[i] == spokenWords[i]) {
        correct.add(spokenWords[i]);
      }
    }

    return correct;
  }

  /// Get confidence level description
  String _getConfidenceLevel(double confidence) {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    if (confidence >= 0.3) return 'Low';
    return 'Very Low';
  }

  /// Get accuracy level description
  String _getAccuracyLevel(double accuracy) {
    if (accuracy >= 0.95) return 'Perfect';
    if (accuracy >= 0.85) return 'Excellent';
    if (accuracy >= 0.7) return 'Good';
    if (accuracy >= 0.5) return 'Fair';
    return 'Poor';
  }

  /// Save pronunciation progress to Firebase
  Future<void> savePronunciationProgress(PronunciationProgress progress) async {
    try {
      await _pronunciationService.savePronunciationProgress(progress);
      debugPrint('Pronunciation progress saved successfully');
    } catch (e) {
      debugPrint('Error saving pronunciation progress: $e');
      rethrow;
    }
  }

  /// Get pronunciation summary for a word
  Future<PronunciationSummary?> getPronunciationSummary(
      String userId, String word) async {
    return await _pronunciationService.getPronunciationSummary(userId, word);
  }

  /// Get user's pronunciation statistics
  Future<Map<String, dynamic>> getUserPronunciationStats(String userId) async {
    return await _pronunciationService.getUserPronunciationStats(userId);
  }

  /// Dispose resources
  void dispose() {
    _isDisposed = true;
    _speech.cancel();
    _tts.stop();
    if (!_wordsStreamController.isClosed) {
      _wordsStreamController.close();
    }
    if (!_confidenceStreamController.isClosed) {
      _confidenceStreamController.close();
    }
    if (!_listeningStreamController.isClosed) {
      _listeningStreamController.close();
    }
    if (!_pronunciationResultController.isClosed) {
      _pronunciationResultController.close();
    }
  }

  /// Get available voices
  Future<List<Map<String, dynamic>>> getAvailableVoices() async {
    try {
      final voices = await _tts.getVoices;
      debugPrint('Voices....: $voices');
      if (voices != null) {
        return voices.map((voice) {
          // Convert dynamic to Map<String, dynamic>
          if (voice is Map) {
            final Map<String, dynamic> convertedVoice = {};
            voice.forEach((key, value) {
              convertedVoice[key.toString()] = value;
            });
            return convertedVoice;
          }
          return <String, dynamic>{};
        }).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error getting available voices: $e');
      return [];
    }
  }

  /// Set a specific voice
  Future<bool> setVoice(String voiceName, String locale) async {
    try {
      await _tts.setVoice({"name": voiceName, "locale": locale});
      debugPrint('Voice set to: $voiceName ($locale)');
      return true;
    } catch (e) {
      debugPrint('Error setting voice: $e');
      return false;
    }
  }

  /// Optimize TTS settings for natural speech
  Future<void> optimizeForNaturalSpeech() async {
    try {
      // Optimize speech parameters for Australian English
      await _tts
          .setSpeechRate(0.5); // Natural speaking pace for Australian accent
      await _tts.setVolume(1.0); // Full volume
      await _tts.setPitch(1.0); // Natural pitch for female voice

      debugPrint('TTS optimized for Australian English speech');
    } catch (e) {
      debugPrint('Error optimizing TTS: $e');
    }
  }

  /// Get the TTS instance for debugging
  dynamic get ttsInstance => _tts;
}
