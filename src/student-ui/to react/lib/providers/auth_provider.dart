import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:async';
import '../../../../../migrate/lib/models/user_model.dart';
import '../services/auth_service.dart';
import 'user_provider.dart';

class AuthProvider extends ChangeNotifier {
  User? _firebaseUser;
  UserModel? _userModel;
  bool _isLoading = true;
  late final AuthService _authService;
  StreamSubscription<User?>? _authStateSubscription;

  User? get firebaseUser => _firebaseUser;
  UserModel? get userModel => _userModel;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _firebaseUser != null && _userModel != null;

  AuthProvider() {
    _authService =
        AuthService(UserProvider()); // Create a temporary UserProvider
    _initializeAuthState();
  }

  void setAuthService(AuthService authService) {
    _authService = authService;
  }

  void _initializeAuthState() {
    // Listen to Firebase Auth state changes
    _authStateSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (User? user) async {
        _firebaseUser = user;

        if (user != null) {
          // User is signed in, fetch user data from Firestore
          try {
            final userDoc = await FirebaseFirestore.instance
                .collection('users')
                .doc(user.uid)
                .get();

            if (userDoc.exists && userDoc.data() != null) {
              _userModel = UserModel.fromJson(userDoc.data()!);
            } else {
              _userModel = null;
            }
          } catch (e) {
            print('Error fetching user data: $e');
            _userModel = null;
          }
        } else {
          // User is signed out
          _userModel = null;
        }

        _isLoading = false;
        notifyListeners();
      },
      onError: (error) {
        print('Auth state change error: $error');
        _isLoading = false;
        _firebaseUser = null;
        _userModel = null;
        notifyListeners();
      },
    );
  }

  void setUser(User? user) {
    _firebaseUser = user;
    notifyListeners();
  }

  void setUserModel(UserModel? userModel) {
    _userModel = userModel;
    notifyListeners();
  }

  @override
  void dispose() {
    _authStateSubscription?.cancel();
    super.dispose();
  }
}
