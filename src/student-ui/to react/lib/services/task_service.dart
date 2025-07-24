import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../../../../../migrate/lib/models/task_model.dart';
import '../../../../../migrate/lib/models/task_attempt.dart';
import '../../../../../migrate/lib/models/user_model.dart';
import 'achievement_service.dart';

class TaskService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final CollectionReference taskAttemptsCollection =
      FirebaseFirestore.instance.collection('task_attempts');
  final CollectionReference usersCollection =
      FirebaseFirestore.instance.collection('users');
  final AchievementService _achievementService = AchievementService();

  Future<Task?> getTaskById(String taskId) async {
    try {
      final doc = await _firestore.collection('tasks').doc(taskId).get();
      if (doc.exists) {
        return Task.fromJson({...doc.data()!, 'id': doc.id});
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<List<Task>> getTasksByLessonId(String lessonId) async {
    try {
      final querySnapshot = await _firestore
          .collection('tasks')
          .where('lessonId', isEqualTo: 's05pOvkG8jLco7tnhb3q')
          .get();

      return querySnapshot.docs
          .map((doc) => Task.fromJson({...doc.data(), 'id': doc.id}))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<TaskAttempt> submitTaskAttempt(
    String taskId,
    String userId,
    List<QuestionResponse> responses, {
    VoidCallback? onProgressUpdated,
  }) async {
    try {
      final task = await getTaskById(taskId);
      if (task == null) throw Exception('Task not found');

      int totalPoints = 0;
      int earnedPoints = 0;

      for (var response in responses) {
        final question = task.questions.firstWhere(
          (q) => q.id == response.questionId,
          orElse: () => throw Exception('Question not found'),
        );

        totalPoints += question.points;

        if (task.type == 'multipleChoice') {
          if (response.selectedAnswer == question.correctAnswer) {
            earnedPoints += question.points;
          }
        } else if (task.type == 'trueFalse') {
          if (response.selectedAnswer == question.correctAnswer) {
            earnedPoints += question.points;
          }
        } else if (task.type == 'fillInBlanks') {
          if (response.selectedAnswer.toLowerCase().trim() ==
              question.expectedAnswer?.toLowerCase().trim()) {
            earnedPoints += question.points;
          }
        } else if (task.type == 'shortAnswer') {
          // For short answer, we'll just record the response
          // Manual grading would be needed
          earnedPoints += 0;
        }
      }

      final score =
          totalPoints > 0 ? (earnedPoints / totalPoints * 100).round() : 0;
      final isPassed = score >= task.passingScore;

      final attempt = TaskAttempt(
        id: '',
        taskId: taskId,
        userId: userId,
        responses: responses,
        score: score,
        status: isPassed ? 'passed' : 'failed',
        submittedAt: DateTime.now(),
        isPassed: isPassed,
        correctAnswers: earnedPoints,
        totalQuestions: task.questions.length,
        timeSpent: 0,
      );

      // Save the task attempt
      final docRef =
          await _firestore.collection('taskAttempts').add(attempt.toJson());

      // Update user progress
      final userRef = _firestore.collection('users').doc(userId);
      final userDoc = await userRef.get();

      if (userDoc.exists) {
        final userData = userDoc.data()!;
        final progress = Map<String, dynamic>.from(userData['progress'] ?? {});

        // Update task progress
        progress['taskProgress'] ??= {};
        progress['taskProgress'][taskId] = {
          'lastAttempt': DateTime.now().toIso8601String(),
          'bestScore': score,
          'attempts': FieldValue.increment(1),
          'isPassed': isPassed,
        };

        // Update lesson progress if task is passed
        if (isPassed) {
          progress['completedTasks'] ??= [];
          if (!progress['completedTasks'].contains(taskId)) {
            progress['completedTasks'].add(taskId);
          }
        }

        // Update study statistics
        final currentStudyMinutes = progress['totalStudyMinutes'] ?? 0;
        final newStudyMinutes =
            currentStudyMinutes + 5; // Assuming 5 minutes per task
        progress['totalStudyMinutes'] = newStudyMinutes;

        final now = DateTime.now();
        final today = DateTime(now.year, now.month, now.day);
        progress['lastStudyDate'] = now.toIso8601String();

        // Update streak with better logic
        final lastStudyDateStr = progress['lastStudyDate'];
        final currentStreak = progress['currentStreak'] ?? 0;
        final longestStreak = progress['longestStreak'] ?? 0;

        if (lastStudyDateStr != null) {
          try {
            final lastStudyDate = DateTime.parse(lastStudyDateStr);
            final lastStudyDay = DateTime(
                lastStudyDate.year, lastStudyDate.month, lastStudyDate.day);
            final daysDifference = today.difference(lastStudyDay).inDays;

            if (daysDifference == 0) {
              // Same day, don't increment streak
            } else if (daysDifference == 1) {
              // Consecutive day, increment streak
              final newStreak = currentStreak + 1;
              progress['currentStreak'] = newStreak;
              progress['longestStreak'] =
                  newStreak > longestStreak ? newStreak : longestStreak;
            } else {
              // Break in streak, reset to 1
              progress['currentStreak'] = 1;
            }
          } catch (e) {
            progress['currentStreak'] = 1;
          }
        } else {
          // First time studying
          progress['currentStreak'] = 1;
        }

        // Update user document
        final updateData = {
          'progress': progress,
          'lastStudyDate': DateTime.now(),
          'currentStreak': progress['currentStreak'],
          'longestStreak': progress['longestStreak'],
          'totalStudyMinutes': progress['totalStudyMinutes'],
          'totalPoints': FieldValue.increment(earnedPoints),
        };

        // Update user document
        await userRef.update(updateData);

        // Check and award achievements
        await _checkAndAwardAchievements(
            userId, score, task.questions.length, isPassed);

        // Call the callback to refresh user data
        onProgressUpdated?.call();
      }

      return TaskAttempt.fromJson({
        ...attempt.toJson(),
        'id': docRef.id,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<List<TaskAttempt>> getTaskAttempts(
      String taskId, String userId) async {
    try {
      // First check if the collection exists by checking if any documents exist
      final collectionRef = _firestore.collection('taskAttempts');
      final collectionSnapshot = await collectionRef.limit(1).get();

      if (collectionSnapshot.docs.isEmpty) {
        // Collection exists but is empty, create a dummy document
        await collectionRef.add({
          'taskId': taskId,
          'userId': userId,
          'responses': [],
          'score': 0,
          'status': 'dummy',
          'submittedAt': FieldValue.serverTimestamp(),
          'isPassed': false,
          'correctAnswers': 0,
          'totalQuestions': 0,
          'timeSpent': 0,
        });
      }

      final querySnapshot = await _firestore
          .collection('taskAttempts')
          .where('taskId', isEqualTo: taskId)
          .where('userId', isEqualTo: userId)
          .orderBy('submittedAt', descending: true)
          .get();

      return querySnapshot.docs
          .map((doc) => TaskAttempt.fromJson({...doc.data(), 'id': doc.id}))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<double> getTaskProgress(String taskId, String userId) async {
    try {
      // Get user progress
      final userDoc = await _firestore.collection('users').doc(userId).get();
      if (!userDoc.exists) return 0.0;

      final userData = userDoc.data()!;
      final progress = userData['progress'] as Map<String, dynamic>?;
      if (progress == null) return 0.0;

      final taskProgress =
          progress['taskProgress']?[taskId] as Map<String, dynamic>?;
      if (taskProgress == null) return 0.0;

      // Return progress based on best score
      final bestScore = taskProgress['bestScore'] as int? ?? 0;
      return bestScore / 100.0;
    } catch (e) {
      return 0.0;
    }
  }

  Future<Map<String, dynamic>> getUserProgress(String userId) async {
    try {
      final userDoc = await _firestore.collection('users').doc(userId).get();
      if (!userDoc.exists) return {};

      final userData = userDoc.data()!;
      return userData['progress'] as Map<String, dynamic>? ?? {};
    } catch (e) {
      return {};
    }
  }

  Future<void> _checkAndAwardAchievements(
    String userId,
    int score,
    int totalQuestions,
    bool isPassed,
  ) async {
    try {
      // Award achievements based on performance
      if (score >= 90) {
        await AchievementService.awardIfNotExists(
            userId: userId, achievementId: "high_core");
      }
      if (isPassed) {
        await AchievementService.awardIfNotExists(
            userId: userId, achievementId: 'task_completed');
      }
      if (totalQuestions >= 10) {
        await AchievementService.awardIfNotExists(
            userId: userId, achievementId: 'long_quiz');
      }
    } catch (e) {}
  }

  /// Save quiz results to Firestore
  Future<void> saveQuizResult(Map<String, dynamic> quizResult) async {
    try {
      await _firestore.collection('quiz_results').add(quizResult);
    } catch (e) {
      rethrow;
    }
  }
}
