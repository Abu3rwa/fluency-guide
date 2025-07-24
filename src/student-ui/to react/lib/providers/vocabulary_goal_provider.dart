import 'package:englishfluencyguide/providers/user_provider.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../../../migrate/lib/models/vocabulary_goal_model.dart';
import '../services/achievement_service.dart';

class VocabularyGoalProvider extends ChangeNotifier {
  VocabularyGoal? _currentGoal;
  bool _isLoading = false;
  String? _error;
  final UserProvider? userProvider;

  VocabularyGoal? get currentGoal => _currentGoal;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasGoal => _currentGoal != null && _currentGoal!.isActive;

  static const String _goalKey = 'vocabulary_goal';

  VocabularyGoalProvider({this.userProvider}) {
    _loadGoal();
  }

  Future<void> _loadGoal() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final goalJson = prefs.getString(_goalKey);

      if (goalJson != null) {
        final goalMap = json.decode(goalJson) as Map<String, dynamic>;
        _currentGoal = VocabularyGoal.fromJson(goalMap);

        // Check if goal is from today, if not reset progress
        _checkAndResetDailyProgress();
      }
    } catch (e) {
      _error = 'Failed to load vocabulary goal: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _saveGoal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_currentGoal != null) {
        final goalJson = json.encode(_currentGoal!.toJson());
        await prefs.setString(_goalKey, goalJson);
      } else {
        await prefs.remove(_goalKey);
      }
    } catch (e) {
      _error = 'Failed to save vocabulary goal: $e';
      notifyListeners();
    }
  }

  void _checkAndResetDailyProgress() {
    if (_currentGoal == null) return;

    final now = DateTime.now();
    final lastUpdated = _currentGoal!.lastUpdated;

    // Check if it's a new day (different date)
    if (now.year != lastUpdated.year ||
        now.month != lastUpdated.month ||
        now.day != lastUpdated.day) {
      _currentGoal = _currentGoal!.copyWith(
        currentProgress: 0,
        lastUpdated: now,
      );
      _saveGoal();
    }
  }

  Future<void> setGoal(int dailyTarget) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentGoal = VocabularyGoal.create(dailyTarget: dailyTarget);
      await _saveGoal();
    } catch (e) {
      _error = 'Failed to set vocabulary goal: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateProgress(int wordsLearned) async {
    if (_currentGoal == null || _currentGoal!.isCompleted) return;

    _isLoading = true;
    notifyListeners();

    try {
      final newProgress = _currentGoal!.currentProgress + wordsLearned;
      final bool wasCompleted = _currentGoal!.isCompleted;

      _currentGoal = _currentGoal!.copyWith(
        currentProgress: newProgress,
        lastUpdated: DateTime.now(),
      );

      final bool isNowCompleted = _currentGoal!.isCompleted;

      if (isNowCompleted && !wasCompleted) {
        await userProvider?.addPoints(25);
        // Award achievement for daily vocabulary goal
        final userId = userProvider?.currentUser?.uid;
        if (userId != null) {
          await AchievementService.awardIfNotExists(
            userId: userId,
            achievementId: 'daily_vocab_goal',
          );
        }
      }

      await _saveGoal();
    } catch (e) {
      _error = 'Failed to update progress: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> resetProgress() async {
    if (_currentGoal == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      _currentGoal = _currentGoal!.copyWith(
        currentProgress: 0,
        lastUpdated: DateTime.now(),
      );
      await _saveGoal();
    } catch (e) {
      _error = 'Failed to reset progress: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> updateGoal(int newDailyTarget) async {
    if (_currentGoal == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentGoal = _currentGoal!.copyWith(
        dailyTarget: newDailyTarget,
        lastUpdated: DateTime.now(),
      );
      await _saveGoal();
    } catch (e) {
      _error = 'Failed to update goal: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteGoal() async {
    _isLoading = true;
    notifyListeners();

    try {
      _currentGoal = null;
      await _saveGoal();
    } catch (e) {
      _error = 'Failed to delete goal: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Helper methods for UI
  double get progressPercentage => _currentGoal?.progressPercentage ?? 0.0;
  int get currentProgress => _currentGoal?.currentProgress ?? 0;
  int get dailyTarget => _currentGoal?.dailyTarget ?? 0;
  int get remainingWords => _currentGoal?.remainingWords ?? 0;
  bool get isCompleted => _currentGoal?.isCompleted ?? false;
}
