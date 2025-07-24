import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/audio_service.dart';

class AudioProvider extends ChangeNotifier {
  final AudioService _audioService = AudioService();

  bool _isAudioEnabled = true;
  bool _isClockTicking = false;

  bool get isAudioEnabled => _isAudioEnabled;
  bool get isClockTicking => _isClockTicking;

  // Initialize audio service and load settings
  Future<void> initialize() async {
    await _audioService.initialize();
    await _loadAudioSettings();
  }

  // Load audio settings from SharedPreferences
  Future<void> _loadAudioSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _isAudioEnabled = prefs.getBool('audio_enabled') ?? true;
    print('Audio settings loaded: $_isAudioEnabled');
    notifyListeners();
  }

  // Save audio settings to SharedPreferences
  Future<void> _saveAudioSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('audio_enabled', _isAudioEnabled);
    print('Audio settings saved: $_isAudioEnabled');
  }

  // Toggle audio on/off
  void toggleAudio() {
    _isAudioEnabled = !_isAudioEnabled;
    print('Audio toggled: $_isAudioEnabled');
    if (!_isAudioEnabled) {
      stopClockTicking();
    }
    _saveAudioSettings();
    notifyListeners();
  }

  // Set audio enabled state
  void setAudioEnabled(bool enabled) {
    _isAudioEnabled = enabled;
    print('Audio set to: $_isAudioEnabled');
    if (!enabled) {
      stopClockTicking();
    }
    _saveAudioSettings();
    notifyListeners();
  }

  // Play correct answer sound
  Future<void> playCorrect() async {
    if (!_isAudioEnabled) {
      print('Audio is disabled, skipping correct sound');
      return;
    }
    print('Audio provider: Playing correct sound');
    await _audioService.playCorrect();
  }

  // Play incorrect answer sound
  Future<void> playIncorrect() async {
    if (!_isAudioEnabled) {
      print('Audio is disabled, skipping incorrect sound');
      return;
    }
    print('Audio provider: Playing incorrect sound');
    await _audioService.playIncorrect();
  }

  // Play congratulations sound
  Future<void> playCongratulations() async {
    if (!_isAudioEnabled) return;
    await _audioService.playCongratulations();
  }

  // Start clock ticking
  Future<void> startClockTicking() async {
    if (!_isAudioEnabled) return;
    await _audioService.startClockTicking();
    _isClockTicking = true;
    notifyListeners();
  }

  // Stop clock ticking
  Future<void> stopClockTicking() async {
    await _audioService.stopClockTicking();
    _isClockTicking = false;
    notifyListeners();
  }

  // Pause clock ticking
  Future<void> pauseClockTicking() async {
    if (!_isAudioEnabled) return;
    await _audioService.pauseClockTicking();
    _isClockTicking = false;
    notifyListeners();
  }

  // Resume clock ticking
  Future<void> resumeClockTicking() async {
    if (!_isAudioEnabled) return;
    await _audioService.resumeClockTicking();
    _isClockTicking = true;
    notifyListeners();
  }

  // Test all audio files
  Future<void> testAllAudio() async {
    if (!_isAudioEnabled) {
      print('Audio is disabled, cannot test');
      return;
    }
    print('Audio provider: Testing all audio files');
    await _audioService.testAllAudio();
  }

  // Dispose audio service
  @override
  void dispose() {
    _audioService.dispose();
    super.dispose();
  }
}
