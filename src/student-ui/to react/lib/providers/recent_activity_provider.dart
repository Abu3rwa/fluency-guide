import 'package:flutter/foundation.dart';
import '../../../../../migrate/lib/models/recent_activity_model.dart';
import '../services/recent_activity_service.dart';
import 'dart:async';

class RecentActivityProvider with ChangeNotifier {
  final RecentActivityService _activityService = RecentActivityService();

  List<RecentActivity> _recentActivities = [];
  List<RecentActivity> _incompleteActivities = [];
  bool _isLoading = false;
  String? _error;

  // Debouncing for progress updates
  Timer? _progressUpdateTimer;
  Map<String, double> _pendingProgressUpdates = {};

  List<RecentActivity> get recentActivities => _recentActivities;
  List<RecentActivity> get incompleteActivities => _incompleteActivities;
  bool get isLoading => _isLoading;
  String? get error => _error;

  @override
  void dispose() {
    _progressUpdateTimer?.cancel();
    _pendingProgressUpdates.clear();
    super.dispose();
  }

  // Load recent activities for a user - MANUAL ONLY
  Future<void> loadRecentActivities(String userId) async {
    // Only load if explicitly requested - no automatic refreshing
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _recentActivities =
          await _activityService.getRecentActivities(userId, limit: 10);
    } catch (e) {
      _error = 'Failed to load recent activities: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load incomplete activities for a user - MANUAL ONLY
  Future<void> loadIncompleteActivities(String userId) async {
    // Only load if explicitly requested - no automatic refreshing
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      debugPrint('Loading incomplete activities for user: $userId');
      _incompleteActivities =
          await _activityService.getIncompleteActivities(userId);
    } catch (e) {
      _error = 'Failed to load incomplete activities: $e';
      debugPrint('ERROR loading incomplete activities: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Save or update an activity
  Future<void> saveActivity(RecentActivity activity) async {
    try {
      await _activityService.saveActivity(activity);

      // Update local lists
      final recentIndex =
          _recentActivities.indexWhere((a) => a.id == activity.id);
      if (recentIndex != -1) {
        _recentActivities[recentIndex] = activity;
      } else {
        _recentActivities.insert(0, activity);
        if (_recentActivities.length > 10) {
          _recentActivities.removeLast();
        }
      }

      final incompleteIndex =
          _incompleteActivities.indexWhere((a) => a.id == activity.id);
      if (incompleteIndex != -1) {
        if (activity.status == ActivityStatus.completed) {
          _incompleteActivities.removeAt(incompleteIndex);
        } else {
          _incompleteActivities[incompleteIndex] = activity;
        }
      } else if (activity.status != ActivityStatus.completed) {
        _incompleteActivities.insert(0, activity);
      }

      notifyListeners();
    } catch (e) {
      _error = 'Failed to save activity: $e';
      notifyListeners();
    }
  }

  // Update activity progress with throttling
  Future<void> updateActivityProgress(
      String activityId, double progress, ActivityStatus status) async {
    try {
      // Check if progress change is significant enough to update
      final currentActivity = _recentActivities.firstWhere(
        (a) => a.id == activityId,
        orElse: () => _incompleteActivities.firstWhere(
          (a) => a.id == activityId,
          orElse: () => throw Exception('Activity not found'),
        ),
      );

      final progressDifference = (progress - currentActivity.progress).abs();
      const minProgressChange = 0.05; // 5% minimum change

      if (progressDifference < minProgressChange &&
          currentActivity.status == status) {
        debugPrint(
            'Progress change too small ($progressDifference), skipping update');
        return;
      }

      // Throttle updates to prevent excessive calls
      const throttleDelay = Duration(milliseconds: 2000);

      // Cancel previous timer if exists
      _progressUpdateTimer?.cancel();

      // Store pending update
      _pendingProgressUpdates[activityId] = progress;

      // Set timer to process updates
      _progressUpdateTimer = Timer(throttleDelay, () async {
        await _processPendingProgressUpdates(status);
      });
    } catch (e) {
      debugPrint('ERROR updating activity progress: $e');
      _error = 'Failed to update activity progress: $e';
      notifyListeners();
    }
  }

  // Process pending progress updates
  Future<void> _processPendingProgressUpdates(ActivityStatus status) async {
    try {
      debugPrint('=== PROCESSING PENDING PROGRESS UPDATES ===');
      debugPrint('Pending updates: $_pendingProgressUpdates');

      for (final entry in _pendingProgressUpdates.entries) {
        final activityId = entry.key;
        final progress = entry.value;

        debugPrint(
            'Processing update for activity $activityId: ${(progress * 100).toStringAsFixed(1)}%');

        // Find the activity in the list
        final activityIndex =
            _recentActivities.indexWhere((a) => a.id == activityId);
        if (activityIndex != -1) {
          debugPrint(
              'Found activity in recent activities at index: $activityIndex');
          _recentActivities[activityIndex] =
              _recentActivities[activityIndex].copyWith(
            progress: progress,
            status: status,
            lastAccessed: DateTime.now(),
          );
        } else {
          final incompleteIndex =
              _incompleteActivities.indexWhere((a) => a.id == activityId);
          if (incompleteIndex != -1) {
            debugPrint(
                'Found activity in incomplete activities at index: $incompleteIndex');
            _incompleteActivities[incompleteIndex] =
                _incompleteActivities[incompleteIndex].copyWith(
              progress: progress,
              status: status,
              lastAccessed: DateTime.now(),
            );
          } else {
            debugPrint('ERROR: Activity not found in either list');
            continue;
          }
        }

        // Save to Firestore
        debugPrint('Saving updated activity to Firestore...');
        await _activityService.saveActivity(_recentActivities.firstWhere(
            (a) => a.id == activityId,
            orElse: () =>
                _incompleteActivities.firstWhere((a) => a.id == activityId)));
        debugPrint('Activity saved to Firestore successfully');
      }

      // Clear pending updates
      _pendingProgressUpdates.clear();

      // Notify listeners only once after all updates
      notifyListeners();
      debugPrint('=== END PROCESSING PENDING PROGRESS UPDATES ===');
    } catch (e) {
      debugPrint('ERROR processing pending progress updates: $e');
      _error = 'Failed to process progress updates: $e';
      notifyListeners();
    }
  }

  // Mark activity as completed
  Future<void> markActivityCompleted(String activityId,
      {int? score, int? timeSpent}) async {
    try {
      await _activityService.markActivityCompleted(activityId,
          score: score, timeSpent: timeSpent);

      // Update local lists
      _updateActivityInLists(activityId,
          status: ActivityStatus.completed, score: score, timeSpent: timeSpent);
      notifyListeners();
    } catch (e) {
      _error = 'Failed to mark activity as completed: $e';
      notifyListeners();
    }
  }

  // Create activity from task attempt
  Future<void> createActivityFromTaskAttempt(
      String taskId,
      String userId,
      String targetId,
      String taskTitle,
      String lessonId,
      String courseId,
      ActivityStatus status,
      {double progress = 0.0,
      int? score,
      int? timeSpent,
      int? totalQuestions}) async {
    try {
      debugPrint('Provider: Creating activity from task attempt');
      debugPrint('Provider: Total questions: $totalQuestions');

      await _activityService.createActivityFromTaskAttempt(
        taskId,
        userId,
        targetId,
        taskTitle,
        lessonId,
        courseId,
        status,
        progress: progress,
        score: score,
        timeSpent: timeSpent,
        totalQuestions: totalQuestions,
      );

      // NO AUTOMATIC REFRESH - only create the activity
      debugPrint('Activity created without automatic refresh');
    } catch (e) {
      debugPrint('ERROR in provider createActivityFromTaskAttempt: $e');
      _error = 'Failed to create activity from task attempt: $e';
      notifyListeners();
    }
  }

  // Create activity from lesson
  Future<void> createActivityFromLesson(
      String taskId,
      String userId,
      String lessonId,
      String lessonTitle,
      String courseId,
      ActivityStatus status,
      {double progress = 0.0}) async {
    try {
      await _activityService.createActivityFromLesson(
        taskId,
        userId,
        lessonId,
        lessonTitle,
        courseId,
        status,
        progress: progress,
      );

      // Reload activities to get the updated list
      await loadRecentActivities(userId);
      await loadIncompleteActivities(userId);
    } catch (e) {
      _error = 'Failed to create activity from lesson: $e';
      notifyListeners();
    }
  }

  // Clear old completed activities
  Future<void> clearOldCompletedActivities(String userId) async {
    try {
      await _activityService.clearOldCompletedActivities(userId);
      // NO AUTOMATIC REFRESH - only clear old activities
      debugPrint('Old activities cleared without automatic refresh');
    } catch (e) {
      _error = 'Failed to clear old activities: $e';
      notifyListeners();
    }
  }

  // Helper method to update activity in local lists
  void _updateActivityInLists(
    String activityId, {
    double? progress,
    ActivityStatus? status,
    int? score,
    int? timeSpent,
  }) {
    // Update in recent activities
    final recentIndex = _recentActivities.indexWhere((a) => a.id == activityId);
    if (recentIndex != -1) {
      final activity = _recentActivities[recentIndex];
      _recentActivities[recentIndex] = activity.copyWith(
        progress: progress,
        status: status,
        score: score,
        timeSpent: timeSpent,
        lastAccessed: DateTime.now(),
        completedAt: status == ActivityStatus.completed
            ? DateTime.now()
            : activity.completedAt,
      );
    }

    // Update in incomplete activities
    final incompleteIndex =
        _incompleteActivities.indexWhere((a) => a.id == activityId);
    if (incompleteIndex != -1) {
      if (status == ActivityStatus.completed) {
        _incompleteActivities.removeAt(incompleteIndex);
      } else {
        final activity = _incompleteActivities[incompleteIndex];
        _incompleteActivities[incompleteIndex] = activity.copyWith(
          progress: progress,
          status: status,
          score: score,
          timeSpent: timeSpent,
          lastAccessed: DateTime.now(),
        );
      }
    }
  }

  // Get activity by ID from local lists
  RecentActivity? getActivityById(String activityId) {
    return _recentActivities.firstWhere(
      (activity) => activity.id == activityId,
      orElse: () => _incompleteActivities.firstWhere(
        (activity) => activity.id == activityId,
        orElse: () => throw Exception('Activity not found'),
      ),
    );
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Manual refresh method - call this when you want to refresh
  Future<void> manualRefresh(String userId) async {
    debugPrint('Manual refresh requested');
    await loadRecentActivities(userId);
    await loadIncompleteActivities(userId);
  }
}
