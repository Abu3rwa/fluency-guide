import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../../migrate/lib/models/user_model.dart';
import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';

class UserProvider extends ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = false;
  late final AuthService _authService;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;

  UserProvider() {
    _authService = AuthService(this);
  }

  // Set loading provider reference

  Future<void> updateUser(UserModel user) async {
    _currentUser = user;
    notifyListeners();
  }

  Future<void> signOut() async {
    _currentUser = null;
    _isLoading = false;
    notifyListeners();
  }

  Future<void> initUser() async {
    if (_isLoading) return; // Prevent multiple simultaneous calls

    _isLoading = true;
    notifyListeners();

    try {
      final firebaseUser = FirebaseAuth.instance.currentUser;

      if (firebaseUser != null) {
        final userDoc = await FirebaseFirestore.instance
            .collection('users')
            .doc(firebaseUser.uid)
            .get();

        if (userDoc.exists && userDoc.data() != null) {
          final userData = userDoc.data();

          if (userData != null) {
            try {
              _currentUser = UserModel.fromJson(userData);
            } catch (e, stackTrace) {
              print('Error parsing user data: $e');
              _currentUser = null;
            }
          } else {
            _currentUser = null;
          }
        } else {
          _currentUser = null;
        }
      } else {
        _currentUser = null;
      }
    } catch (e, stackTrace) {
      print('Error initializing user: $e');
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Refresh user data from Firestore (useful after completing tasks)
  Future<void> refreshUserData() async {
    if (_currentUser == null) return;

    try {
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(_currentUser!.uid)
          .get();

      if (userDoc.exists && userDoc.data() != null) {
        final userData = userDoc.data()!;
        try {
          _currentUser = UserModel.fromJson(userData);
          print(
              'User data refreshed. Total study minutes: ${_currentUser?.totalStudyMinutes}');
          notifyListeners();
        } catch (e) {
          print('Error parsing refreshed user data: $e');
        }
      }
    } catch (e) {
      print('Error refreshing user data: $e');
    }
  }

  Future<void> updatePreferredLanguage(String languageCode) async {
    if (_currentUser == null) return;

    try {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(_currentUser!.uid)
          .update({'preferredLanguage': languageCode});
      _currentUser = _currentUser!.copyWith(preferredLanguage: languageCode);
      notifyListeners();
    } catch (e) {
      print('Error updating preferred language: $e');
    }
  }

  /// Fetch top users ordered by totalPoints (for leaderboard)
  Future<List<UserModel>> fetchTopUsers({int limit = 10}) async {
    try {
      final querySnapshot = await FirebaseFirestore.instance
          .collection('users')
          .orderBy('totalPoints', descending: true)
          .limit(limit)
          .get();
      return querySnapshot.docs
          .map((doc) => UserModel.fromJson(doc.data()))
          .toList();
    } catch (e) {
      print('Error fetching top users: $e');
      return [];
    }
  }

  // Test method to manually update study minutes
  Future<void> updateStudyMinutes(int minutes) async {
    if (_currentUser == null) return;

    try {
      print('=== USER PROVIDER: Manually updating study minutes ===');
      print('Current study minutes: ${_currentUser?.totalStudyMinutes}');
      print('Adding $minutes minutes');

      final newTotalMinutes = (_currentUser?.totalStudyMinutes ?? 0) + minutes;

      await FirebaseFirestore.instance
          .collection('users')
          .doc(_currentUser!.uid)
          .update({
        'totalStudyMinutes': newTotalMinutes,
        'progress.totalStudyMinutes': newTotalMinutes,
      });

      // Refresh user data
      await refreshUserData();

      print('=== USER PROVIDER: Study minutes updated to $newTotalMinutes ===');
    } catch (e) {
      print('Error updating study minutes: $e');
    }
  }

  // Initialize missing user study data
  Future<void> initializeStudyData() async {
    if (_currentUser == null) return;

    try {
      print('=== USER PROVIDER: Initializing study data ===');

      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(_currentUser!.uid)
          .get();

      if (userDoc.exists && userDoc.data() != null) {
        final userData = userDoc.data()!;
        final progress = userData['progress'] as Map<String, dynamic>? ?? {};

        bool needsUpdate = false;
        final updateData = <String, dynamic>{};

        // Check and initialize totalStudyMinutes
        if (userData['totalStudyMinutes'] == null ||
            userData['totalStudyMinutes'] == 0) {
          final estimatedMinutes = progress['totalStudyMinutes'] ?? 0;
          updateData['totalStudyMinutes'] = estimatedMinutes;
          needsUpdate = true;
          print('Initializing totalStudyMinutes to: $estimatedMinutes');
        }

        // Check and initialize lastStudyDate
        if (userData['lastStudyDate'] == null) {
          final lastStudyDate = progress['lastStudyDate'];
          if (lastStudyDate != null) {
            updateData['lastStudyDate'] = DateTime.parse(lastStudyDate);
            needsUpdate = true;
            print('Initializing lastStudyDate to: $lastStudyDate');
          }
        }

        // Check and initialize streaks
        if (userData['currentStreak'] == null ||
            userData['currentStreak'] == 0) {
          final currentStreak = progress['currentStreak'] ?? 1;
          updateData['currentStreak'] = currentStreak;
          needsUpdate = true;
          print('Initializing currentStreak to: $currentStreak');
        }

        if (userData['longestStreak'] == null ||
            userData['longestStreak'] == 0) {
          final longestStreak = progress['longestStreak'] ?? 1;
          updateData['longestStreak'] = longestStreak;
          needsUpdate = true;
          print('Initializing longestStreak to: $longestStreak');
        }

        if (needsUpdate) {
          await FirebaseFirestore.instance
              .collection('users')
              .doc(_currentUser!.uid)
              .update(updateData);

          print('=== USER PROVIDER: Study data initialized ===');

          // Refresh user data
          await refreshUserData();
        } else {
          print('=== USER PROVIDER: Study data already initialized ===');
        }
      }
    } catch (e) {
      print('Error initializing study data: $e');
    }
  }

  // Test method to set study minutes to a specific value
  Future<void> setStudyMinutes(int minutes) async {
    if (_currentUser == null) return;

    try {
      print('=== USER PROVIDER: Setting study minutes to $minutes ===');

      await FirebaseFirestore.instance
          .collection('users')
          .doc(_currentUser!.uid)
          .update({
        'totalStudyMinutes': minutes,
        'progress.totalStudyMinutes': minutes,
      });

      // Refresh user data
      await refreshUserData();

      print('=== USER PROVIDER: Study minutes set to $minutes ===');
    } catch (e) {
      print('Error setting study minutes: $e');
    }
  }

  Future<void> updateTodayStudyMinutes(int minutes) async {
    if (_currentUser == null) return;
    final now = DateTime.now();
    final lastDate = _currentUser!.lastStudyDate;
    int newTodayMinutes = minutes;
    int newStreak = 1;
    if (lastDate != null) {
      if (_isSameDay(now, lastDate)) {
        newTodayMinutes += (_currentUser!.todayStudyMinutes ?? 0);
        newStreak = (_currentUser!.currentStreak ?? 1);
      } else if (now.difference(lastDate).inDays == 1) {
        newStreak = (_currentUser!.currentStreak ?? 0) + 1;
      }
    }
    await FirebaseFirestore.instance
        .collection('users')
        .doc(_currentUser!.uid)
        .update({
      'todayStudyMinutes': newTodayMinutes,
      'lastStudyDate': now,
      'currentStreak': newStreak,
      'totalStudyMinutes': (_currentUser!.totalStudyMinutes ?? 0) + minutes,
    });
    await refreshUserData();
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  Future<void> addPoints(int points) async {
    if (_currentUser == null) return;

    try {
      final newTotalPoints = (_currentUser!.totalPoints ?? 0) + points;

      await FirebaseFirestore.instance
          .collection('users')
          .doc(_currentUser!.uid)
          .update({'totalPoints': newTotalPoints});

      _currentUser = _currentUser!.copyWith(totalPoints: newTotalPoints);
      notifyListeners();
    } catch (e) {
      print('Error adding points: $e');
    }
  }
}
