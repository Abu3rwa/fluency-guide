import 'package:flutter/material.dart';
import '../services/achievement_service.dart';
import '../../../../../migrate/lib/models/achievement_model.dart';
import '../../../../../migrate/lib/models/user_model.dart';

class AchievementProvider extends ChangeNotifier {
  final AchievementService _achievementService = AchievementService();

  List<UserAchievementModel> _userAchievements = [];
  List<AchievementModel> _achievements = [];
  int _userPoints = 0;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<UserAchievementModel> get userAchievements => _userAchievements;
  List<AchievementModel> get achievements => _achievements;

  bool get isLoading => _isLoading;
  String? get error => _error;

  // Helper to get AchievementModel by id
  AchievementModel? _getAchievementById(String id) {
    final result = _achievements.firstWhere(
      (a) => a.id == id,
      orElse: () => AchievementModel(
        id: '',
        title: '',
        description: '',
        icon: '',
        points: 0,
        type: AchievementType.special,
        rarity: AchievementRarity.common,
        criteria: {},
      ),
    );
    return result.id.isEmpty ? null : result;
  }

  // Get achievement by ID (joined)
  AchievementModel? getAchievementById(String achievementId) {
    return _getAchievementById(achievementId);
  }

  // Get achievement progress (from user achievements)
  double getAchievementProgress(String achievementId) {
    final userAchievement = _userAchievements.firstWhere(
      (a) => a.achievementId == achievementId,
      orElse: () => UserAchievementModel(
        id: '',
        userId: '',
        achievementId: '',
        earnedAt: DateTime.now(),
        progress: 0,
        isUnlocked: false,
      ),
    );
    final achievement = _getAchievementById(achievementId);
    if (userAchievement.achievementId.isEmpty ||
        achievement == null ||
        achievement.maxProgress == null ||
        achievement.maxProgress == 0) {
      return 0.0;
    }
    return ((userAchievement.progress ?? 0) / achievement.maxProgress!)
        .clamp(0.0, 1.0);
  }

  // Get achievements summary by category
  Map<String, int> get achievementsByCategory {
    final Map<String, int> summary = {};
    for (final achievement in _achievements) {
      final category = achievement.category ?? 'other';
      summary[category] = (summary[category] ?? 0) + 1;
    }
    return summary;
  }

  // Get achievements summary by rarity
  Map<AchievementRarity, int> get achievementsByRarity {
    final Map<AchievementRarity, int> summary = {};
    for (final achievement in _achievements) {
      summary[achievement.rarity] = (summary[achievement.rarity] ?? 0) + 1;
    }
    return summary;
  }

  // Initialize achievements
  Future<void> initializeAchievements(userId) async {
    _setLoading(true);
    try {
      await _achievementService.initializeAchievements();
      await loadAchievements(userId);
      _setError(null);
    } catch (e) {
      _setError('Failed to initialize achievements: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadAchievements(String userId) async {
    _setLoading(true);
    await loadUserAchievements(userId);
    _setLoading(false);
  }

  // Load user's achievement progress
  Future<void> loadUserAchievements(String userId) async {
    try {
      _userAchievements = await _achievementService.getUserAchievements(userId);
      debugPrint("========${_userAchievements}");
    } catch (e) {
      _setError('Failed to load user achievements: $e');
    }
  }

  // Load all achievements

  // Award specific achievement
  Future<void> awardAchievement(String userId, String achievementId) async {
    try {
      await AchievementService.awardIfNotExists(
          userId: userId, achievementId: achievementId);
      await loadUserAchievements(userId);
    } catch (e) {
      _setError('Failed to award achievement: $e');
    }
  }

  // Update achievement progress
  Future<void> updateAchievementProgress(
      String userId, String achievementId, int progress) async {
    try {
      await _achievementService.updateAchievementProgress(
          userId, achievementId, progress);
      await loadUserAchievements(userId);
    } catch (e) {
      _setError('Failed to update achievement progress: $e');
    }
  }

  // Get leaderboard

  // Check if user has specific achievement
  bool hasAchievement(String achievementId) {
    return _userAchievements.any((a) => a.id == achievementId && a.isUnlocked);
  }

  // Get total achievements count
  int get totalAchievementsCount => _achievements.length;

  // Get unlocked achievements count
  int get unlockedAchievementsCount =>
      _userAchievements.where((a) => a.isUnlocked).length;

  // Get completion percentage

  // Clear error
  void clearError() {
    _setError(null);
  }

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  // Refresh all data
  Future<void> refresh(String userId) async {
    await loadUserAchievements(userId);
  }
}
