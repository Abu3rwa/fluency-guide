import 'package:flutter/foundation.dart';
import 'package:englishfluencyguide/models/course_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:englishfluencyguide/providers/user_provider.dart';

class CourseProvider with ChangeNotifier {
  List<CourseModel> _courses = [];
  bool _isLoading = false;
  String? _error;
  String? _selectedCategory;
  bool _isInitialized = false;

  List<CourseModel> get courses {
    if (_selectedCategory != null && _selectedCategory != 'All') {
      return _courses
          .where(
            (course) =>
                course.level.toLowerCase() == _selectedCategory?.toLowerCase(),
          )
          .toList();
    }
    return _courses;
  }

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get selectedCategory => _selectedCategory;
  bool get isInitialized => _isInitialized;

  // Set loading provider reference

  void setCategory(String? category) {
    if (_selectedCategory != category) {
      _selectedCategory = category;
      notifyListeners();
    }
  }

  Future<void> loadCourses() async {
    if (_isLoading) return;

    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      debugPrint('=== Starting to fetch courses ===');
      debugPrint('Checking Firebase instance...');
      if (FirebaseFirestore.instance == null) {
        debugPrint('ERROR: FirebaseFirestore instance is null!');
        throw Exception('FirebaseFirestore instance is null');
      }

      debugPrint('Attempting to fetch courses from Firestore...');
      // Query for both status='published' and published=true
      final querySnapshot = await FirebaseFirestore.instance
          .collection('courses')
          .where('status', isEqualTo: true)
          .get();

      debugPrint(
        'Query completed. Number of documents: ${querySnapshot.docs.length}',
      );
      debugPrint(
        'Raw documents data: ${querySnapshot.docs.map((doc) => doc.data()).toList()}',
      );

      if (querySnapshot.docs.isEmpty) {
        // Try querying with published=true if no results found
        debugPrint(
          'No courses found with status=published, trying published=true...',
        );
        final publishedSnapshot = await FirebaseFirestore.instance
            .collection('courses')
            .where('published', isEqualTo: true)
            .get();

        if (publishedSnapshot.docs.isEmpty) {
          debugPrint('No published courses found, creating test course...');
          await createTestCourse();
          return;
        }

        final List<CourseModel> loadedCourses = [];
        for (final doc in publishedSnapshot.docs) {
          try {
            debugPrint('Processing document ${doc.id}');
            debugPrint('Document data: ${doc.data()}');

            final course = CourseModel.fromFirestore(doc);
            debugPrint('Successfully converted course: ${course.title}');
            loadedCourses.add(course);
          } catch (e, stackTrace) {
            debugPrint('Error converting document ${doc.id}: $e');
            debugPrint('Stack trace: $stackTrace');
            continue;
          }
        }

        _courses = loadedCourses;
        debugPrint('Successfully loaded ${_courses.length} courses');
        debugPrint('Courses list: ${_courses.map((c) => c.title).toList()}');
        return;
      }

      final List<CourseModel> loadedCourses = [];
      for (final doc in querySnapshot.docs) {
        try {
          debugPrint('Processing document ${doc.id}');
          debugPrint('Document data: ${doc.data()}');

          final course = CourseModel.fromFirestore(doc);
          debugPrint('Successfully converted course: ${course.title}');
          loadedCourses.add(course);
        } catch (e, stackTrace) {
          debugPrint('Error converting document ${doc.id}: $e');
          debugPrint('Stack trace: $stackTrace');
          continue;
        }
      }

      _courses = loadedCourses;
      debugPrint('Successfully loaded ${_courses.length} courses');
      debugPrint('Courses list: ${_courses.map((c) => c.title).toList()}');
    } catch (e, stackTrace) {
      debugPrint('Error loading courses: $e');
      debugPrint('Stack trace: $stackTrace');
      _error = e.toString();
      _courses = [];
    } finally {
      _isLoading = false;
      _isInitialized = true;
      notifyListeners();
      debugPrint('=== Finished loading courses ===');
    }
  }

  Future<CourseModel?> getCourseById(String courseId) async {
    try {
      final doc = await FirebaseFirestore.instance
          .collection('courses')
          .doc(courseId)
          .get();

      if (!doc.exists) return null;
      return CourseModel.fromFirestore(doc);
    } catch (e) {
      debugPrint('Error getting course: $e');
      return null;
    }
  }

  Future<bool> enrollInCourse(String courseId, String userId) async {
    try {
      // Check if already enrolled
      final existingEnrollment = await FirebaseFirestore.instance
          .collection('enrollments')
          .where('courseId', isEqualTo: courseId)
          .where('studentId', isEqualTo: userId)
          .get();

      if (existingEnrollment.docs.isNotEmpty) {
        final status = existingEnrollment.docs.first.data()['status'];
        if (status == 'active') {
          debugPrint('Student is already enrolled in this course');
          return true;
        }
        if (status == 'pending') {
          debugPrint('Enrollment request is already pending');
          return true;
        }
      }

      // Create enrollment in enrollments collection
      await FirebaseFirestore.instance.collection('enrollments').add({
        'courseId': courseId,
        'studentId': userId,
        'status': 'pending',
        'enrolledAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      // Update user's enrolled courses (even if pending)
      await FirebaseFirestore.instance.collection('users').doc(userId).update({
        'enrolledCourses': FieldValue.arrayUnion([courseId]),
        'lastActiveCourse': courseId,
        'lastStudyDate': FieldValue.serverTimestamp(),
      });

      return true;
    } catch (e) {
      debugPrint('Error requesting enrollment: $e');
      return false;
    }
  }

  Future<bool> isEnrolled(String courseId, String userId) async {
    try {
      final enrollmentsQuery = await FirebaseFirestore.instance
          .collection('enrollments')
          .where('courseId', isEqualTo: courseId)
          .where('studentId', isEqualTo: userId)
          .where('status', isEqualTo: 'active')
          .get();

      return enrollmentsQuery.docs.isNotEmpty;
    } catch (e) {
      debugPrint('Error checking enrollment: $e');
      return false;
    }
  }

  Future<String> getEnrollmentStatus(String courseId, String userId) async {
    try {
      final enrollmentsQuery = await FirebaseFirestore.instance
          .collection('enrollments')
          .where('courseId', isEqualTo: courseId)
          .where('studentId', isEqualTo: userId)
          .get();

      if (enrollmentsQuery.docs.isEmpty) {
        return 'not_enrolled';
      }

      return enrollmentsQuery.docs.first.data()['status'] ?? 'not_enrolled';
    } catch (e) {
      debugPrint('Error getting enrollment status: $e');
      return 'not_enrolled';
    }
  }

  // Admin functions
  Future<bool> approveEnrollment(String courseId, String userId) async {
    try {
      // Find the enrollment document
      final enrollmentsQuery = await FirebaseFirestore.instance
          .collection('enrollments')
          .where('courseId', isEqualTo: courseId)
          .where('studentId', isEqualTo: userId)
          .get();

      if (enrollmentsQuery.docs.isEmpty) {
        return false;
      }

      final enrollmentDoc = enrollmentsQuery.docs.first;

      // Update enrollment status
      await enrollmentDoc.reference.update({
        'status': 'active',
        'updatedAt': FieldValue.serverTimestamp(),
      });

      // Update course enrolled students count
      await FirebaseFirestore.instance
          .collection('courses')
          .doc(courseId)
          .update({'enrolledStudents': FieldValue.increment(1)});

      // Update user's enrolled courses
      await FirebaseFirestore.instance.collection('users').doc(userId).update({
        'enrolledCourses': FieldValue.arrayUnion([courseId]),
        'lastActiveCourse': courseId,
        'lastStudyDate': FieldValue.serverTimestamp(),
      });

      return true;
    } catch (e) {
      debugPrint('Error approving enrollment: $e');
      return false;
    }
  }

  Future<bool> rejectEnrollment(String courseId, String userId) async {
    try {
      // Find the enrollment document
      final enrollmentsQuery = await FirebaseFirestore.instance
          .collection('enrollments')
          .where('courseId', isEqualTo: courseId)
          .where('studentId', isEqualTo: userId)
          .get();

      if (enrollmentsQuery.docs.isEmpty) {
        return false;
      }

      final enrollmentDoc = enrollmentsQuery.docs.first;

      // Update enrollment status
      await enrollmentDoc.reference.update({
        'status': 'rejected',
        'updatedAt': FieldValue.serverTimestamp(),
      });

      return true;
    } catch (e) {
      debugPrint('Error rejecting enrollment: $e');
      return false;
    }
  }

  // Get all pending enrollments for admin
  Future<List<Map<String, dynamic>>> getPendingEnrollments() async {
    try {
      final enrollmentsQuery = await FirebaseFirestore.instance
          .collection('enrollments')
          .where('status', isEqualTo: 'pending')
          .get();

      List<Map<String, dynamic>> pendingEnrollments = [];

      for (var enrollmentDoc in enrollmentsQuery.docs) {
        final enrollment = enrollmentDoc.data();

        // Get course details
        final courseDoc = await FirebaseFirestore.instance
            .collection('courses')
            .doc(enrollment['courseId'])
            .get();

        if (courseDoc.exists) {
          pendingEnrollments.add({
            'enrollmentId': enrollmentDoc.id,
            'courseId': enrollment['courseId'],
            'courseTitle': courseDoc.data()?['title'],
            'userId': enrollment['studentId'],
            'status': enrollment['status'],
            'enrolledAt': enrollment['enrolledAt'],
          });
        }
      }

      return pendingEnrollments;
    } catch (e) {
      debugPrint('Error getting pending enrollments: $e');
      return [];
    }
  }

  // Course management functions
  Future<bool> createCourse(CourseModel course) async {
    try {
      final docRef = await FirebaseFirestore.instance
          .collection('courses')
          .add(course.toFirestore());
      _courses.add(course.copyWith(id: docRef.id));
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error creating course: $e');
      return false;
    }
  }

  Future<bool> updateCourse(String courseId, CourseModel course) async {
    try {
      await FirebaseFirestore.instance
          .collection('courses')
          .doc(courseId)
          .update(course.toFirestore());

      final index = _courses.indexWhere((c) => c.id == courseId);
      if (index != -1) {
        _courses[index] = course;
        notifyListeners();
      }
      return true;
    } catch (e) {
      debugPrint('Error updating course: $e');
      return false;
    }
  }

  Future<bool> deleteCourse(String courseId) async {
    try {
      await FirebaseFirestore.instance
          .collection('courses')
          .doc(courseId)
          .delete();

      _courses.removeWhere((c) => c.id == courseId);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Error deleting course: $e');
      return false;
    }
  }

  // Debug function to create a test course
  Future<void> createTestCourse() async {
    try {
      debugPrint('=== Creating test course ===');
      final testCourse = CourseModel(
        id: 'test-course-${DateTime.now().millisecondsSinceEpoch}',
        title: 'Test Course',
        description: 'This is a test course for debugging purposes.',
        shortDescription: 'Test course for debugging',
        category: 'Beginner',
        level: 'Beginner',
        instructor: 'Test Instructor',
        instructorBio: 'Test instructor bio',
        prerequisites: ['None'],
        objectives: ['Learn the basics'],
        duration: '1 hour',
        totalLessons: 1,
        totalQuizzes: 1,
        totalAssignments: 1,
        price: 0,
        tags: ['test'],
        requirements: ['None'],
        targetAudience: ['Beginners'],
        whatYouWillLearn: ['Basics'],
        courseMaterials: ['None'],
        support: {'email': 'test@example.com'},
        enrolledStudents: 0,
        rating: 0.0,
        totalRatings: 0,
        reviews: [],
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
        status: 'published',
      );

      debugPrint('Test course object created: ${testCourse.toJson()}');

      final docRef =
          FirebaseFirestore.instance.collection('courses').doc(testCourse.id);

      debugPrint('Attempting to save test course to Firestore...');
      await docRef.set(testCourse.toJson());
      debugPrint('Test course saved successfully with ID: ${testCourse.id}');

      debugPrint('Reloading courses after creating test course...');
      await loadCourses();
    } catch (e, stackTrace) {
      debugPrint('Error creating test course: $e');
      debugPrint('Stack trace: $stackTrace');
    }
  }
}
