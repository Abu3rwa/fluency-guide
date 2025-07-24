import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../../migrate/lib/models/user_model.dart';
import '../providers/user_provider.dart';

/// Service class that handles all authentication-related operations
class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    // Add these configuration options to prevent platform channel issues
    scopes: ['email', 'profile'],
  );
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final UserProvider _userProvider;

  AuthService(this._userProvider);

  /// Get the current Firebase Auth user
  User? get currentUser => _auth.currentUser;

  /// Stream of authentication state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Create a new user document in Firestore
  Future<UserModel> _createUserDocument(User user) async {
    final userModel = UserModel(
      uid: user.uid,
      email: user.email ?? '',
      name: user.displayName ?? 'User',
      profileImage: user.photoURL ?? '',
      isAdmin: false,
      isStudent: true,
      createdAt: DateTime.now(),
      lastLogin: DateTime.now(),
      emailVerified: user.emailVerified,
      preferredLanguage: 'English',
      currentStreak: 0,
      longestStreak: 0,
      totalStudyMinutes: 0,
      enrolledCourses: [],
      completedLessons: [],
      progress: {
        'dailyGoal': 20,
        'weeklyGoal': 120,
        'achievements': [],
        'quizScores': {},
        'vocabularyProgress': {},
      },
      preferences: {
        'theme': 'system',
        'notifications': true,
        'soundEnabled': true,
        'dailyReminder': true,
        'reminderTime': '09:00',
      },
    );

    await _firestore.collection('users').doc(user.uid).set(userModel.toJson());
    return userModel;
  }

  /// Update an existing user document in Firestore
  Future<UserModel> _updateUserDocument(
      User user, Map<String, dynamic>? existingData) async {
    final updateData = {
      'lastLogin': DateTime.now(),
      'emailVerified': user.emailVerified,
      if (user.displayName != null && user.displayName!.isNotEmpty)
        'name': user.displayName,
      if (user.photoURL != null && user.photoURL!.isNotEmpty)
        'profileImage': user.photoURL,
    };

    if (existingData != null) {
      final updatedData = Map<String, dynamic>.from(existingData);
      updatedData.addAll(updateData);
      return UserModel.fromJson(updatedData);
    }

    return UserModel.fromJson(updateData);
  }

  /// Handle user authentication and Firestore operations
  Future<UserModel?> _handleUserAuth(User user) async {
    try {
      final userDoc = await _firestore
          .collection('users')
          .doc(user.uid)
          .get()
          .timeout(const Duration(seconds: 15));

      UserModel userModel;
      if (!userDoc.exists) {
        userModel = await _createUserDocument(user);
      } else {
        userModel = await _updateUserDocument(user, userDoc.data());
        await userDoc.reference.update({
          'lastLogin': userModel.lastLogin.toIso8601String(),
        });
      }

      // Update the user provider if it exists
      if (_userProvider != null) {
        await _userProvider.updateUser(userModel);
      }

      return userModel;
    } catch (e, stackTrace) {
      rethrow;
    }
  }

  /// Sign in with Google
  Future<UserModel?> signInWithGoogle() async {
    try {
      await _signOutSilently();

      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('Google sign in was cancelled or failed');
      }

      final googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final user = userCredential.user;

      if (user == null) {
        throw Exception('Failed to get user from Google sign in');
      }

      return await _handleUserAuth(user);
    } catch (e) {
      await _signOutSilently();
      rethrow;
    }
  }

  /// Sign in with email and password
  Future<UserModel?> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = userCredential.user;
      if (user == null) return null;

      return await _handleUserAuth(user);
    } on FirebaseAuthException catch (e) {
      rethrow;
    }
  }

  /// Sign up with email and password
  Future<UserModel?> signUpWithEmailAndPassword({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = userCredential.user;
      if (user == null) return null;

      return await _handleUserAuth(user);
    } on FirebaseAuthException catch (e) {
      rethrow;
    }
  }

  /// Sign out from all services
  Future<void> signOut() async {
    try {
      await Future.wait([_auth.signOut(), _googleSignIn.signOut()]);
      // Update the user provider if it exists
      if (_userProvider != null) {
        await _userProvider.signOut();
      }
      // Clear saved credentials
      await _clearSavedCredentials();
    } catch (e) {
      rethrow;
    }
  }

  /// Clear saved credentials from SharedPreferences
  Future<void> _clearSavedCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('saved_email');
      await prefs.remove('saved_password');
      await prefs.setBool('remember_credentials', false);
    } catch (e) {
      rethrow;
    }
  }

  /// Silently sign out from all services (used internally)
  Future<void> _signOutSilently() async {
    try {
      await Future.wait([
        _googleSignIn.signOut().catchError(
              (e) => print('Google signOut error: $e'),
            ),
        _auth.signOut().catchError((e) => print('Firebase signOut error: $e')),
      ]);
    } catch (e) {
      print('Error during silent sign out: $e');
    }
  }

  /// Get current user model from Firestore
  Future<UserModel?> getCurrentUser() async {
    final user = _auth.currentUser;
    if (user == null) return null;

    try {
      final userDoc = await _firestore.collection('users').doc(user.uid).get();
      if (!userDoc.exists) return null;

      final userData = userDoc.data();
      if (userData == null) {
        print('Warning: User document exists but data is null');
        return null;
      }

      return UserModel.fromJson(userData);
    } catch (e) {
      print('Error getting current user: $e');
      return null;
    }
  }

  /// Get user data by UID
  Future<UserModel?> getUserData(String uid) async {
    try {
      final userDoc = await _firestore.collection('users').doc(uid).get();
      if (!userDoc.exists) return null;

      final userData = userDoc.data();
      if (userData == null) return null;

      return UserModel.fromJson(userData);
    } catch (e) {
      print('Error getting user data: $e');
      return null;
    }
  }

  /// Update user profile
  Future<UserModel?> updateUserProfile(
    String uid,
    Map<String, dynamic> data,
  ) async {
    try {
      final userDoc = await _firestore.collection('users').doc(uid).get();
      if (!userDoc.exists) return null;

      await userDoc.reference.update(data);
      final updatedDoc = await userDoc.reference.get();
      final updatedData = updatedDoc.data();

      if (updatedData == null) return null;

      return UserModel.fromJson(updatedData);
    } catch (e) {
      print('Error updating user profile: $e');
      return null;
    }
  }
}
