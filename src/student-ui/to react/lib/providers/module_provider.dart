import 'package:flutter/foundation.dart';
import '../../../../../migrate/lib/models/module_model.dart';
import '../services/module_service.dart';

class ModuleProvider with ChangeNotifier {
  final ModuleService _moduleService = ModuleService();
  List<Module> _modules = [];
  bool _isLoading = false;
  String? _error;
  String? _currentCourseId;

  // Getters
  List<Module> get modules => _modules;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get currentCourseId => _currentCourseId;

  // Load modules for a course
  Future<void> loadModules(String courseId) async {
    if (_isLoading) return;
    if (_currentCourseId == courseId && _modules.isNotEmpty) return;

    try {
      _isLoading = true;
      _error = null;
      _currentCourseId = courseId;
      notifyListeners();

      debugPrint('Loading modules for course: $courseId');
      _modules = await _moduleService.getModulesByCourse(courseId);
      debugPrint('Loaded ${_modules.length} modules');
    } catch (e) {
      debugPrint('Error loading modules: $e');
      _error = e.toString();
      _modules = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get modules by course ID
  Future<List<Module>> getModulesByCourse(String courseId) async {
    try {
      return await _moduleService.getModulesByCourse(courseId);
    } catch (e) {
      debugPrint('Error getting modules: $e');
      rethrow;
    }
  }

  // Create a new module
  Future<Module> createModule(String courseId, Module module) async {
    try {
      final newModule = await _moduleService.createModule(courseId, module);
      if (_currentCourseId == courseId) {
        _modules.add(newModule);
        notifyListeners();
      }
      return newModule;
    } catch (e) {
      debugPrint('Error creating module: $e');
      rethrow;
    }
  }

  // Update an existing module
  Future<Module> updateModule(String moduleId, Module module) async {
    try {
      final updatedModule = await _moduleService.updateModule(moduleId, module);
      final index = _modules.indexWhere((m) => m.id == moduleId);
      if (index != -1) {
        _modules[index] = updatedModule;
        notifyListeners();
      }
      return updatedModule;
    } catch (e) {
      debugPrint('Error updating module: $e');
      rethrow;
    }
  }

  // Delete a module
  Future<void> deleteModule(String moduleId) async {
    try {
      await _moduleService.deleteModule(moduleId);
      _modules.removeWhere((m) => m.id == moduleId);
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting module: $e');
      rethrow;
    }
  }

  // Clear the current state
  void clear() {
    _modules = [];
    _error = null;
    _currentCourseId = null;
    notifyListeners();
  }
}
