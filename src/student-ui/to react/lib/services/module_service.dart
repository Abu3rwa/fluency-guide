import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../../../../../migrate/lib/models/module_model.dart';
import '../../../../../migrate/lib/models/lesson_model.dart';

class ModuleService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _modulesCollection = 'modules';

  // Get all modules for a course
  Future<List<Module>> getModulesByCourse(String courseId) async {
    try {
      debugPrint('=== Fetching Modules ===');
      debugPrint('Course ID: $courseId');

      final querySnapshot = await _firestore
          .collection(_modulesCollection)
          .where('courseId', isEqualTo: courseId)
          .get();

      debugPrint(
        'Query completed. Documents found: ${querySnapshot.docs.length}',
      );

      if (querySnapshot.docs.isEmpty) {
        debugPrint('No modules found for course: $courseId');
        return [];
      }

      final modules = querySnapshot.docs.map((doc) {
        debugPrint('Processing module document: ${doc.id}');
        debugPrint('Module data: ${doc.data()}');
        return Module.fromFirestore(doc);
      }).toList();

      // Sort modules by order after fetching
      modules.sort((a, b) => a.order.compareTo(b.order));

      debugPrint('Successfully processed ${modules.length} modules');
      return modules;
    } catch (e, stackTrace) {
      debugPrint('Error getting modules: $e');
      debugPrint('Stack trace: $stackTrace');
      rethrow;
    }
  }

  // Get a single module
  Future<Module?> getModule(String moduleId) async {
    try {
      final doc = await _firestore
          .collection(_modulesCollection)
          .doc(moduleId)
          .get();
      if (!doc.exists) return null;
      return Module.fromFirestore(doc);
    } catch (e) {
      debugPrint('Error getting module: $e');
      rethrow;
    }
  }

  // Create a new module
  Future<Module> createModule(String courseId, Module module) async {
    try {
      final docRef = await _firestore
          .collection(_modulesCollection)
          .add(module.toMap());
      final doc = await docRef.get();
      return Module.fromFirestore(doc);
    } catch (e) {
      debugPrint('Error creating module: $e');
      rethrow;
    }
  }

  // Update an existing module
  Future<Module> updateModule(String moduleId, Module module) async {
    try {
      final docRef = _firestore.collection(_modulesCollection).doc(moduleId);
      await docRef.update(module.toMap());
      final doc = await docRef.get();
      return Module.fromFirestore(doc);
    } catch (e) {
      debugPrint('Error updating module: $e');
      rethrow;
    }
  }

  // Delete a module
  Future<void> deleteModule(String moduleId) async {
    try {
      await _firestore.collection(_modulesCollection).doc(moduleId).delete();
    } catch (e) {
      debugPrint('Error deleting module: $e');
      rethrow;
    }
  }

  // Get modules stream for real-time updates
  Stream<List<Module>> getModulesStream(String courseId) {
    return _firestore
        .collection(_modulesCollection)
        .where('courseId', isEqualTo: courseId)
        .orderBy('order')
        .snapshots()
        .map(
          (snapshot) =>
              snapshot.docs.map((doc) => Module.fromFirestore(doc)).toList(),
        );
  }

  // Get all lessons for a module
  Stream<List<LessonModel>> getLessons(String courseId, String moduleId) {
    return _firestore
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(moduleId)
        .collection('lessons')
        .orderBy('order')
        .snapshots()
        .map((snapshot) {
          return snapshot.docs
              .map((doc) => LessonModel.fromFirestore(doc))
              .toList();
        });
  }

  // Get a single lesson
  Future<LessonModel?> getLesson(
    String courseId,
    String moduleId,
    String lessonId,
  ) async {
    final doc = await _firestore
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(moduleId)
        .collection('lessons')
        .doc(lessonId)
        .get();

    if (!doc.exists) return null;
    return LessonModel.fromFirestore(doc);
  }
}
