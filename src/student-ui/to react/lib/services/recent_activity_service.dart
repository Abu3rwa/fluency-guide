import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../../migrate/lib/models/recent_activity_model.dart';
import 'package:flutter/foundation.dart';

class RecentActivityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'recent_activities';

  // Save or update a recent activity
  Future<void> saveActivity(RecentActivity activity) async {
    try {
      debugPrint('Saving activity: ${activity.title} (${activity.statusText})');
      // Check if activity already exists
      final existingQuery = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: activity.userId)
          .where('targetId', isEqualTo: activity.targetId)
          .where('type', isEqualTo: activity.type.toString().split('.').last)
          .get();

      if (existingQuery.docs.isNotEmpty) {
        // Update existing activity
        debugPrint(
            'Updating existing activity: ${existingQuery.docs.first.id}');
        await existingQuery.docs.first.reference.update(activity.toJson());
      } else {
        // Create new activity
        debugPrint('Creating new activity');
        final docRef =
            await _firestore.collection(_collection).add(activity.toJson());
        debugPrint('New activity created with ID: ${docRef.id}');
      }
    } catch (e) {
      debugPrint('ERROR saving activity: $e');
      throw Exception('Failed to save activity: $e');
    }
  }

  // Get recent activities for a user
  Future<List<RecentActivity>> getRecentActivities(String userId,
      {int limit = 10}) async {
    try {
      final querySnapshot = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .orderBy('lastAccessed', descending: true)
          .limit(limit)
          .get();

      return querySnapshot.docs
          .map((doc) => RecentActivity.fromJson(doc.data(), doc.id))
          .toList();
    } catch (e) {
      throw Exception('Failed to get recent activities: $e');
    }
  }

  // Get incomplete activities for a user
  Future<List<RecentActivity>> getIncompleteActivities(String userId) async {
    try {
      debugPrint('Fetching incomplete activities for user: $userId');
      final querySnapshot = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .where('status', whereIn: ['inProgress', 'failed', 'notStarted'])
          .orderBy('lastAccessed', descending: true)
          .get();

      debugPrint(
          'Found ${querySnapshot.docs.length} incomplete activities in Firestore');

      final activities = querySnapshot.docs
          .map((doc) => RecentActivity.fromJson(doc.data(), doc.id))
          .toList();

      debugPrint('Parsed ${activities.length} activities');
      for (final activity in activities) {
        debugPrint(
            '  - ${activity.title} (${activity.statusText}) - ${(activity.progress * 100).toInt()}%');
      }

      return activities;
    } catch (e) {
      debugPrint('ERROR fetching incomplete activities: $e');
      throw Exception('Failed to get incomplete activities: $e');
    }
  }

  // Update activity progress
  Future<void> updateActivityProgress(
      String activityId, double progress, ActivityStatus status) async {
    try {
      await _firestore.collection(_collection).doc(activityId).update({
        'progress': progress,
        'status': status.toString().split('.').last,
        'lastAccessed': Timestamp.fromDate(DateTime.now()),
        if (status == ActivityStatus.completed)
          'completedAt': Timestamp.fromDate(DateTime.now()),
      });
    } catch (e) {
      throw Exception('Failed to update activity progress: $e');
    }
  }

  // Mark activity as completed
  Future<void> markActivityCompleted(String activityId,
      {int? score, int? timeSpent}) async {
    try {
      final updateData = {
        'status': ActivityStatus.completed.toString().split('.').last,
        'completedAt': Timestamp.fromDate(DateTime.now()),
        'progress': 1.0,
        'lastAccessed': Timestamp.fromDate(DateTime.now()),
      };

      if (score != null) updateData['score'] = score;
      if (timeSpent != null) updateData['timeSpent'] = timeSpent;

      await _firestore
          .collection(_collection)
          .doc(activityId)
          .update(updateData);
    } catch (e) {
      throw Exception('Failed to mark activity as completed: $e');
    }
  }

  // Delete an activity
  Future<void> deleteActivity(String activityId) async {
    try {
      await _firestore.collection(_collection).doc(activityId).delete();
    } catch (e) {
      throw Exception('Failed to delete activity: $e');
    }
  }

  // Clear old completed activities (keep only last 30 days)
  Future<void> clearOldCompletedActivities(String userId) async {
    try {
      final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));

      final querySnapshot = await _firestore
          .collection(_collection)
          .where('userId', isEqualTo: userId)
          .where('status',
              isEqualTo: ActivityStatus.completed.toString().split('.').last)
          .where('completedAt', isLessThan: Timestamp.fromDate(thirtyDaysAgo))
          .get();

      final batch = _firestore.batch();
      for (final doc in querySnapshot.docs) {
        batch.delete(doc.reference);
      }

      await batch.commit();
    } catch (e) {
      throw Exception('Failed to clear old activities: $e');
    }
  }

  // Get activity by ID
  Future<RecentActivity?> getActivityById(String activityId) async {
    try {
      final doc =
          await _firestore.collection(_collection).doc(activityId).get();
      if (doc.exists) {
        return RecentActivity.fromJson(doc.data()!, doc.id);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to get activity by ID: $e');
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
    final activity = RecentActivity(
      id: '', // Will be set by Firestore
      taskId: taskId,
      userId: userId,
      title: taskTitle,
      description: 'Complete the task to continue your learning journey',
      type: ActivityType.task,
      status: status,
      targetId: targetId,
      lessonId: lessonId,
      courseId: courseId,
      lastAccessed: DateTime.now(),
      progress: progress,
      score: score,
      timeSpent: timeSpent,
      totalQuestions: totalQuestions,
    );

    debugPrint('Activity created with data: ${activity.toJson()}');
    await saveActivity(activity);
    debugPrint('=== END CREATE ACTIVITY FROM TASK ATTEMPT DEBUG ===');
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
    final activity = RecentActivity(
      id: '', // Will be set by Firestore
      userId: userId,
      taskId: taskId,

      title: lessonTitle,
      description: 'Lesson in course',
      type: ActivityType.lesson,
      status: status,
      targetId: lessonId,
      courseId: courseId,
      lastAccessed: DateTime.now(),
      progress: progress,
    );

    await saveActivity(activity);
  }
}
