import 'package:just_audio/just_audio.dart';

class AudioService {
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;
  AudioService._internal();

  // Audio players for different sounds
  late AudioPlayer _correctPlayer;
  late AudioPlayer _incorrectPlayer;
  late AudioPlayer _congratulationsPlayer;
  late AudioPlayer _clockTickingPlayer;

  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Initialize audio players
      _correctPlayer = AudioPlayer();
      _incorrectPlayer = AudioPlayer();
      _congratulationsPlayer = AudioPlayer();
      _clockTickingPlayer = AudioPlayer();

      // Set audio sources
      await _correctPlayer.setAsset('assets/audios/correct.mp3');
      await _incorrectPlayer.setAsset('assets/audios/inCorrect.mp3');
      await _congratulationsPlayer
          .setAsset('assets/audios/congratulations.mp3');
      await _clockTickingPlayer.setAsset('assets/audios/clock-ticking.mp3');

      // Set volume levels
      _correctPlayer.setVolume(0.7);
      _incorrectPlayer.setVolume(0.7);
      _congratulationsPlayer.setVolume(0.8);
      _clockTickingPlayer.setVolume(0.5);

      _isInitialized = true;
    } catch (e) {
      print('Error initializing audio service: $e');
    }
  }

  // Play correct answer sound
  Future<void> playCorrect() async {
    if (!_isInitialized) await initialize();
    try {
      print('Playing correct sound...');
      await _correctPlayer.seek(Duration.zero);
      await _correctPlayer.play();
      print('Correct sound started playing');
    } catch (e) {
      print('Error playing correct sound: $e');
    }
  }

  // Play incorrect answer sound
  Future<void> playIncorrect() async {
    if (!_isInitialized) await initialize();
    try {
      print('Playing incorrect sound...');
      await _incorrectPlayer.seek(Duration.zero);
      await _incorrectPlayer.play();
      print('Incorrect sound started playing');
    } catch (e) {
      print('Error playing incorrect sound: $e');
    }
  }

  // Play congratulations sound
  Future<void> playCongratulations() async {
    if (!_isInitialized) await initialize();
    try {
      await _congratulationsPlayer.seek(Duration.zero);
      await _congratulationsPlayer.play();
    } catch (e) {
      print('Error playing congratulations sound: $e');
    }
  }

  // Start clock ticking sound (looped)
  Future<void> startClockTicking() async {
    if (!_isInitialized) await initialize();
    try {
      await _clockTickingPlayer.setLoopMode(LoopMode.one);
      await _clockTickingPlayer.play();
    } catch (e) {
      print('Error starting clock ticking: $e');
    }
  }

  // Stop clock ticking sound
  Future<void> stopClockTicking() async {
    if (!_isInitialized) return;
    try {
      await _clockTickingPlayer.stop();
    } catch (e) {
      print('Error stopping clock ticking: $e');
    }
  }

  // Pause clock ticking sound
  Future<void> pauseClockTicking() async {
    if (!_isInitialized) return;
    try {
      await _clockTickingPlayer.pause();
    } catch (e) {
      print('Error pausing clock ticking: $e');
    }
  }

  // Resume clock ticking sound
  Future<void> resumeClockTicking() async {
    if (!_isInitialized) return;
    try {
      await _clockTickingPlayer.play();
    } catch (e) {
      print('Error resuming clock ticking: $e');
    }
  }

  // Dispose all audio players
  Future<void> dispose() async {
    if (!_isInitialized) return;
    try {
      await _correctPlayer.dispose();
      await _incorrectPlayer.dispose();
      await _congratulationsPlayer.dispose();
      await _clockTickingPlayer.dispose();
      _isInitialized = false;
    } catch (e) {
      print('Error disposing audio players: $e');
    }
  }

  // Check if audio is playing
  bool get isClockTickingPlaying => _clockTickingPlayer.playing;

  // Test all audio files
  Future<void> testAllAudio() async {
    if (!_isInitialized) await initialize();

    print('Testing all audio files...');

    try {
      print('Testing correct sound...');
      await _correctPlayer.seek(Duration.zero);
      await _correctPlayer.play();
      await Future.delayed(const Duration(seconds: 1));
      await _correctPlayer.stop();

      print('Testing incorrect sound...');
      await _incorrectPlayer.seek(Duration.zero);
      await _incorrectPlayer.play();
      await Future.delayed(const Duration(seconds: 1));
      await _incorrectPlayer.stop();

      print('Testing congratulations sound...');
      await _congratulationsPlayer.seek(Duration.zero);
      await _congratulationsPlayer.play();
      await Future.delayed(const Duration(seconds: 1));
      await _congratulationsPlayer.stop();

      print('All audio files tested successfully!');
    } catch (e) {
      print('Error testing audio files: $e');
    }
  }
}
