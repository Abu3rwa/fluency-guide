import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../../migrate/lib/models/lesson_model.dart';
import '../services/lesson_service.dart';

class LessonProvider with ChangeNotifier {
  final LessonService _lessonService = LessonService();
  List<LessonModel> _lessons = [];

  List<LessonModel> get lessons => _lessons;

  Future<LessonModel?> getLesson(String lessonId) async {
    try {
      debugPrint('Getting lesson: $lessonId');
      return await _lessonService.getLesson(lessonId);
    } catch (e) {
      debugPrint('Error getting lesson: $e');
      rethrow;
    }
  }

  Future<List<LessonModel>> getLessonsByModule(String moduleId) async {
    debugPrint('Getting lessons for module: $moduleId');
    try {
      final lessons = await _lessonService.getLessons(moduleId).first;
      return lessons;
    } catch (e) {
      debugPrint('Error getting lessons: $e');
      rethrow;
    }
  }

  Future<void> loadLessons(String moduleId) async {
    try {
      _lessons = await _lessonService.getLessons(moduleId).first;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading lessons: $e');
      rethrow;
    }
  }

  Future<LessonModel> createLesson(LessonModel lesson) async {
    try {
      final newLesson = await _lessonService.createLesson(lesson);
      _lessons.add(newLesson);
      notifyListeners();
      return newLesson;
    } catch (e) {
      debugPrint('Error creating lesson: $e');
      rethrow;
    }
  }

  Future<void> updateLesson(LessonModel lesson) async {
    try {
      await _lessonService.updateLesson(lesson);
      final index = _lessons.indexWhere((l) => l.id == lesson.id);
      if (index != -1) {
        _lessons[index] = lesson;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error updating lesson: $e');
      rethrow;
    }
  }

  Future<void> deleteLesson(String lessonId) async {
    try {
      await _lessonService.deleteLesson(lessonId);
      _lessons.removeWhere((l) => l.id == lessonId);
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting lesson: $e');
      rethrow;
    }
  }
}
