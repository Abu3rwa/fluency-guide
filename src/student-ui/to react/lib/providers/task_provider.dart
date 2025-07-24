import 'package:flutter/foundation.dart';
import '../../../../../migrate/lib/models/task_model.dart';
import '../../../../../migrate/lib/models/task_attempt.dart';
import '../../../../../migrate/lib/models/recent_activity_model.dart';
import '../services/task_service.dart';
import '../services/recent_activity_service.dart';
import '../services/achievement_service.dart';

class TaskProvider with ChangeNotifier {
  final TaskService _taskService = TaskService();
  final RecentActivityService _activityService = RecentActivityService();
  List<Task> _tasks = [];
  Task? _currentTask;
  bool _isLoading = false;
  String? _error;

  List<Task> get tasks => _tasks;
  Task? get currentTask => _currentTask;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadTasks(String lessonId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _tasks = await _taskService.getTasksByLessonId(lessonId);
      print('tasks loaded: ${_tasks.length}');
    } catch (e) {
      _error = 'Failed to load tasks: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadTask(String taskId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentTask = await _taskService.getTaskById(taskId);
      if (_currentTask == null) {
        _error = 'Task not found';
      }
    } catch (e) {
      _error = 'Failed to load task: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<TaskAttempt?> submitTaskAttempt(
      String taskId, String userId, List<QuestionResponse> responses) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final attempt =
          await _taskService.submitTaskAttempt(taskId, userId, responses);

      // Create or update recent activity for this task
      if (attempt != null && _currentTask != null) {
        final status =
            attempt.isPassed ? ActivityStatus.completed : ActivityStatus.failed;
        final progress = attempt.isPassed
            ? 1.0
            : (attempt.correctAnswers / attempt.totalQuestions);

        await _activityService.createActivityFromTaskAttempt(
          _currentTask!.type,
          userId,
          _currentTask!.id,
          _currentTask!.title,
          _currentTask!.lessonId,
          _currentTask!.courseId,
          status,
          progress: progress,
          score: attempt.score,
          timeSpent: attempt.timeSpent,
        );
        // Award achievement if task is completed
        if (attempt.isPassed) {
          await AchievementService.awardIfNotExists(
            userId: userId,
            achievementId: 'task_finisher',
          );
        }
      }

      return attempt;
    } catch (e) {
      _error = 'Failed to submit task attempt: $e';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<double> getTaskProgress(String taskId, String userId) async {
    try {
      return await _taskService.getTaskProgress(taskId, userId);
    } catch (e) {
      _error = 'Failed to get task progress: $e';
      return 0.0;
    }
  }

  // Create activity when user starts a task
  Future<void> startTask(String taskId, String userId, String taskTitle,
      String lessonId, String courseId) async {
    try {
      await _activityService.createActivityFromTaskAttempt(
        _currentTask!.type,
        userId,
        taskId,
        taskTitle,
        lessonId,
        courseId,
        ActivityStatus.inProgress,
        progress: 0.0,
      );
    } catch (e) {
      _error = 'Failed to create task activity: $e';
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
