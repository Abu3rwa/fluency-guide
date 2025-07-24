import 'package:flutter/foundation.dart';
import '../../../../../migrate/lib/models/vocabulary_progress.dart';
import '../services/vocabulary_progress_service.dart';

class VocabularyProgressProvider with ChangeNotifier {
  final VocabularyProgressService _service = VocabularyProgressService();

  String? _currentUserId;
  Map<String, VocabularyProgress> _progressMap = {};
  List<VocabularyProgress> _favoriteWords = [];
  Map<String, dynamic> _statistics = {};
  bool _isLoading = false;

  // Getters
  String? get currentUserId => _currentUserId;
  Map<String, VocabularyProgress> get progressMap => _progressMap;
  List<VocabularyProgress> get favoriteWords => _favoriteWords;
  Map<String, dynamic> get statistics => _statistics;
  bool get isLoading => _isLoading;

  // Initialize with user ID
  Future<void> initialize(String userId) async {
    _currentUserId = userId;
    await _loadUserProgress();
    await _loadFavoriteWords();
    await _loadStatistics();
  }

  // Load user progress
  Future<void> _loadUserProgress() async {
    if (_currentUserId == null) return;

    _setLoading(true);
    try {
      final progressList = await _service.getUserProgress(_currentUserId!);
      _progressMap.clear();
      for (var progress in progressList) {
        _progressMap[progress.word] = progress;
      }
    } catch (e) {
      print('Error loading user progress: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Load favorite words
  Future<void> _loadFavoriteWords() async {
    if (_currentUserId == null) return;

    try {
      _favoriteWords = await _service.getFavoriteWords(_currentUserId!);
      notifyListeners();
    } catch (e) {
      print('Error loading favorite words: $e');
    }
  }

  // Load statistics
  Future<void> _loadStatistics() async {
    if (_currentUserId == null) return;

    try {
      _statistics = await _service.getUserStatistics(_currentUserId!);
      notifyListeners();
    } catch (e) {
      print('Error loading statistics: $e');
    }
  }

  // Get progress for a specific word
  VocabularyProgress? getWordProgress(String word) {
    return _progressMap[word];
  }

  // Increment view count
  Future<void> incrementViewCount(String word) async {
    if (_currentUserId == null) return;

    try {
      await _service.incrementViewCount(_currentUserId!, word);

      // Update local state
      final existingProgress = _progressMap[word];
      if (existingProgress != null) {
        _progressMap[word] = existingProgress.copyWith(
          timesViewed: existingProgress.timesViewed + 1,
          lastViewed: DateTime.now(),
          updatedAt: DateTime.now(),
        );
      } else {
        final newProgress = VocabularyProgress(
          userId: _currentUserId!,
          word: word,
          timesViewed: 1,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        _progressMap[word] = newProgress;
      }

      notifyListeners();
    } catch (e) {
      print('Error incrementing view count: $e');
    }
  }

  // Record correct answer
  Future<void> recordCorrectAnswer(String word) async {
    print('=== VOCABULARY PROGRESS PROVIDER: recordCorrectAnswer ===');
    print('Word: $word');
    print('Current user ID: $_currentUserId');

    if (_currentUserId == null) {
      print('ERROR: No current user ID - cannot record progress');
      return;
    }

    try {
      print('Calling service to record correct answer...');
      await _service.recordCorrectAnswer(_currentUserId!, word);
      print('Service call completed successfully');

      // Update local state
      final existingProgress = _progressMap[word];
      print(
          'Existing progress for word "$word": ${existingProgress != null ? "exists" : "not found"}');

      if (existingProgress != null) {
        print(
            'Updating existing progress - timesCorrect: ${existingProgress.timesCorrect} -> ${existingProgress.timesCorrect + 1}');
        _progressMap[word] = existingProgress.copyWith(
          timesCorrect: existingProgress.timesCorrect + 1,
          timesViewed: existingProgress.timesViewed + 1,
          lastViewed: DateTime.now(),
          updatedAt: DateTime.now(),
        );
      } else {
        print('Creating new progress entry for word "$word"');
        final newProgress = VocabularyProgress(
          userId: _currentUserId!,
          word: word,
          timesViewed: 1,
          timesCorrect: 1,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        _progressMap[word] = newProgress;
      }

      print('Notifying listeners of progress update');
      notifyListeners();
      print(
          '=== VOCABULARY PROGRESS PROVIDER: recordCorrectAnswer COMPLETED ===');
    } catch (e) {
      print('ERROR in recordCorrectAnswer: $e');
      rethrow;
    }
  }

  // Record incorrect answer
  Future<void> recordIncorrectAnswer(String word) async {
    if (_currentUserId == null) return;

    try {
      await _service.recordIncorrectAnswer(_currentUserId!, word);

      // Update local state
      final existingProgress = _progressMap[word];
      if (existingProgress != null) {
        _progressMap[word] = existingProgress.copyWith(
          timesIncorrect: existingProgress.timesIncorrect + 1,
          timesViewed: existingProgress.timesViewed + 1,
          lastViewed: DateTime.now(),
          updatedAt: DateTime.now(),
        );
      } else {
        final newProgress = VocabularyProgress(
          userId: _currentUserId!,
          word: word,
          timesViewed: 1,
          timesIncorrect: 1,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        _progressMap[word] = newProgress;
      }

      notifyListeners();
    } catch (e) {
      print('Error recording incorrect answer: $e');
    }
  }

  // Toggle favorite status
  Future<void> toggleFavorite(String word) async {
    if (_currentUserId == null) return;

    try {
      final existingProgress = _progressMap[word];
      final newFavoriteStatus = !(existingProgress?.isFavorite ?? false);

      await _service.toggleFavorite(_currentUserId!, word, newFavoriteStatus);

      // Update local state
      if (existingProgress != null) {
        _progressMap[word] = existingProgress.copyWith(
          isFavorite: newFavoriteStatus,
          updatedAt: DateTime.now(),
        );
      } else {
        final newProgress = VocabularyProgress(
          userId: _currentUserId!,
          word: word,
          isFavorite: newFavoriteStatus,
          lastViewed: DateTime.now(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        _progressMap[word] = newProgress;
      }

      // Update favorite words list
      await _loadFavoriteWords();
      notifyListeners();
    } catch (e) {
      print('Error toggling favorite: $e');
    }
  }

  // Check if word is favorite
  bool isFavorite(String word) {
    return _progressMap[word]?.isFavorite ?? false;
  }

  // Get word accuracy
  double getWordAccuracy(String word) {
    final progress = _progressMap[word];
    return progress?.accuracy ?? 0.0;
  }

  // Get word attempts
  int getWordAttempts(String word) {
    final progress = _progressMap[word];
    return progress?.totalAttempts ?? 0;
  }

  // Refresh all data
  Future<void> refresh() async {
    await _loadUserProgress();
    await _loadFavoriteWords();
    await _loadStatistics();
  }

  // Clear data (for logout)
  void clear() {
    _currentUserId = null;
    _progressMap.clear();
    _favoriteWords.clear();
    _statistics.clear();
    notifyListeners();
  }

  // Set loading state
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}
