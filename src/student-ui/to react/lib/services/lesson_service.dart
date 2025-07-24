import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../../../../../migrate/lib/models/lesson_model.dart';

class LessonService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static const String _lessonsCollection = 'lessons';

  // Get all lessons for a module
  Stream<List<LessonModel>> getLessons(String moduleId) {
    debugPrint('=== Fetching Lessons ===');
    debugPrint('Module ID: $moduleId');

    return _firestore
        .collection(_lessonsCollection)
        .where('moduleId', isEqualTo: moduleId)
        .snapshots()
        .map((snapshot) {
          debugPrint(
            'Found ${snapshot.docs.length} lessons for module $moduleId',
          );
          final lessons = snapshot.docs.map((doc) {
            debugPrint('Processing lesson: ${doc.id}');
            return LessonModel.fromFirestore(doc);
          }).toList();
          debugPrint('Successfully processed ${lessons.length} lessons');
          return lessons;
        });
  }

  // Get a single lesson
  Future<LessonModel?> getLesson(String lessonId) async {
    try {
      debugPrint('=== Fetching Single Lesson ===');
      debugPrint('Lesson ID: $lessonId');

      final doc = await _firestore
          .collection(_lessonsCollection)
          .doc(lessonId)
          .get();

      if (!doc.exists) {
        debugPrint('No lesson found with ID: $lessonId');
        return null;
      }

      debugPrint('Found lesson: ${doc.id}');
      return LessonModel.fromFirestore(doc);
    } catch (e, stackTrace) {
      debugPrint('Error getting lesson: $e');
      debugPrint('Stack trace: $stackTrace');
      rethrow;
    }
  }

  // Create a new lesson
  Future<LessonModel> createLesson(LessonModel lesson) async {
    try {
      debugPrint('=== Creating New Lesson ===');
      debugPrint('Lesson data: ${lesson.toMap()}');

      final docRef = await _firestore
          .collection(_lessonsCollection)
          .add(lesson.toMap());

      debugPrint('Created lesson with ID: ${docRef.id}');
      return lesson.copyWith(id: docRef.id);
    } catch (e, stackTrace) {
      debugPrint('Error creating lesson: $e');
      debugPrint('Stack trace: $stackTrace');
      rethrow;
    }
  }

  // Update an existing lesson
  Future<void> updateLesson(LessonModel lesson) async {
    try {
      debugPrint('=== Updating Lesson ===');
      debugPrint('Lesson ID: ${lesson.id}');
      debugPrint('Update data: ${lesson.toMap()}');

      await _firestore
          .collection(_lessonsCollection)
          .doc(lesson.id)
          .update(lesson.toMap());

      debugPrint('Successfully updated lesson: ${lesson.id}');
    } catch (e, stackTrace) {
      debugPrint('Error updating lesson: $e');
      debugPrint('Stack trace: $stackTrace');
      rethrow;
    }
  }

  // Delete a lesson
  Future<void> deleteLesson(String lessonId) async {
    try {
      debugPrint('=== Deleting Lesson ===');
      debugPrint('Lesson ID: $lessonId');

      await _firestore.collection(_lessonsCollection).doc(lessonId).delete();

      debugPrint('Successfully deleted lesson: $lessonId');
    } catch (e, stackTrace) {
      debugPrint('Error deleting lesson: $e');
      debugPrint('Stack trace: $stackTrace');
      rethrow;
    }
  }
}
