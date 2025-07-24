import '../../theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../services/auth_service.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../../../../../migrate/lib/models/user_model.dart';
import '../../routes/app_routes.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  late final AuthService _authService;
  bool _isLogin = true;
  bool _isLoading = false;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  bool _rememberCredentials = false;

  // Simplified animation controller
  late final AnimationController _animationController;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _authService = Provider.of<AuthService>(context, listen: false);
    _initUser();
    _loadSavedCredentials();

    // Initialize animations with simpler configuration
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500), // Reduced duration
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    );

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    _animationController.forward();
  }

  Future<void> _initUser() async {
    print('Checking user status in AuthScreen...');
    await _authService.currentUser;
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    await userProvider.initUser();
  }

  Future<void> _loadSavedCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedEmail = prefs.getString('saved_email');
      final savedPassword = prefs.getString('saved_password');
      final rememberCredentials =
          prefs.getBool('remember_credentials') ?? false;

      if (rememberCredentials && savedEmail != null && savedPassword != null) {
        setState(() {
          _emailController.text = savedEmail;
          _passwordController.text = savedPassword;
          _rememberCredentials = true;
        });
      }
    } catch (e) {
      print('Error loading saved credentials: $e');
    }
  }

  Future<void> _saveCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_rememberCredentials) {
        // Note: In a production app, consider encrypting sensitive data
        // before storing in SharedPreferences for additional security
        await prefs.setString('saved_email', _emailController.text.trim());
        await prefs.setString(
            'saved_password', _passwordController.text.trim());
        await prefs.setBool('remember_credentials', true);
      } else {
        await prefs.remove('saved_email');
        await prefs.remove('saved_password');
        await prefs.setBool('remember_credentials', false);
      }
    } catch (e) {
      print('Error saving credentials: $e');
    }
  }

  Future<void> _clearSavedCredentials() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('saved_email');
      await prefs.remove('saved_password');
      await prefs.setBool('remember_credentials', false);
    } catch (e) {
      print('Error clearing saved credentials: $e');
    }
  }

  void _clearForm() {
    _emailController.clear();
    _passwordController.clear();
    _nameController.clear();
    setState(() {
      _rememberCredentials = false;
    });
    _clearSavedCredentials();
  }

  void _toggleAuthMode() {
    setState(() {
      _isLogin = !_isLogin;
      _formKey.currentState?.reset();
    });
    // Clear saved credentials when switching modes
    _clearSavedCredentials();
  }

  Future<void> _submitForm() async {
    final formState = _formKey.currentState;
    if (formState == null || !formState.validate()) return;

    setState(() => _isLoading = true);

    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text.trim();
      UserModel? user;

      if (_isLogin) {
        // Sign in
        user = await _authService.signInWithEmailAndPassword(
          email: email,
          password: password,
        );

        // Save credentials if login is successful and remember is checked
        if (user != null) {
          await _saveCredentials();
        }
      } else {
        // Sign up
        final name = _nameController.text.trim();
        user = await _authService.signUpWithEmailAndPassword(
          email: email,
          password: password,
          name: name,
        );

        // Save credentials if signup is successful and remember is checked
        if (user != null) {
          await _saveCredentials();
        }
      }

      if (user != null && mounted) {
        _showWelcomeSnackbar(user.name);
      }
    } on FirebaseAuthException catch (e) {
      if (mounted) {
        String errorMessage;
        switch (e.code) {
          case 'user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'email-already-in-use':
            errorMessage = 'An account already exists with this email';
            break;
          case 'weak-password':
            errorMessage = 'Password is too weak';
            break;
          case 'operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled';
            break;
          case 'too-many-requests':
            errorMessage = 'Too many attempts. Please try again later';
            break;
          case 'network-request-failed':
            errorMessage =
                'Network error. Please check your internet connection';
            break;
          default:
            errorMessage =
                e.message ?? 'An error occurred during authentication';
        }
        _showErrorSnackbar(errorMessage);
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackbar(e.toString());
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              Icons.error_outline,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                _isLogin
                    ? 'Error signing in: $message'
                    : 'Error creating account: $message',
              ),
            ),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: Theme.of(context).colorScheme.errorContainer,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _showWelcomeSnackbar(String name) {
    // Navigate to home screen immediately after successful login
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.home,
      (route) => false, // Remove all previous routes
    );

    // Show welcome snackbar on the home screen
    Future.delayed(const Duration(milliseconds: 100), () {
      if (!mounted) return;
      final snackBar = SnackBar(
        content: Row(
          children: [
            Icon(
              Icons.waving_hand_rounded,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Welcome back, $name! 👋',
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: Theme.of(context).colorScheme.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      );

      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(snackBar);
    });
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.signInWithGoogle();
      if (user != null && mounted) {
        _showWelcomeSnackbar(user.name);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(
                  Icons.error_outline,
                  color: Theme.of(context).colorScheme.error,
                ),
                const SizedBox(width: 12),
                Expanded(child: Text('Error signing in with Google: $e')),
              ],
            ),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Theme.of(context).colorScheme.errorContainer,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return WillPopScope(
      onWillPop: () async {
        // If user is not logged in, prevent exiting the app
        final userProvider = Provider.of<UserProvider>(context, listen: false);
        if (userProvider.currentUser == null) {
          // Show confirmation dialog
          final shouldExit = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Exit App?'),
              content: const Text('Are you sure you want to exit?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('No'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('Yes'),
                ),
              ],
            ),
          );
          return shouldExit ?? false;
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: colorScheme.background,
        body: Stack(
          children: [
            // Animated gradient background
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      colorScheme.background,
                      colorScheme.surface,
                      colorScheme.primary.withOpacity(0.1),
                    ],
                    stops: const [0.2, 0.6, 1.0],
                  ),
                ),
              )
                  .animate(
                    onPlay: (controller) => controller.repeat(reverse: true),
                  )
                  .shimmer(
                    duration: 3.seconds,
                    color: colorScheme.primary.withOpacity(0.1),
                  )
                  .fadeIn(duration: 600.ms),
            ),

            // Auth form
            SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  physics:
                      const ClampingScrollPhysics(), // More efficient scrolling
                  padding: const EdgeInsets.all(24.0),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Logo or Icon
                            Icon(
                              Icons.school_rounded,
                              size: 64,
                              color: colorScheme.primary,
                            )
                                .animate()
                                .scale(
                                  duration: 600.ms,
                                  curve: Curves.elasticOut,
                                )
                                .fadeIn(duration: 400.ms),

                            const SizedBox(height: 24),

                            // Title with simplified animation
                            Text(
                              _isLogin ? "Welcome Back" : "Create Account",
                              style: theme.textTheme.displaySmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colorScheme.onBackground,
                              ),
                            ),

                            const SizedBox(height: 32),

                            // Form fields with simplified animations
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 200),
                              child: _buildFormFields(),
                            ),

                            const SizedBox(height: 24),

                            // Login button with simplified animation
                            ElevatedButton(
                              onPressed: _isLoading ? null : _submitForm,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: colorScheme.primary,
                                foregroundColor: colorScheme.onPrimary,
                                elevation: 2,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ).copyWith(
                                elevation:
                                    MaterialStateProperty.resolveWith<double>(
                                        (Set<MaterialState> states) {
                                  if (states.contains(
                                    MaterialState.hovered,
                                  )) return 4;
                                  if (states.contains(
                                    MaterialState.pressed,
                                  )) return 1;
                                  return 2;
                                }),
                              ),
                              child: Text(
                                _isLogin ? "Login" : "Sign Up",
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            // Google sign-in button with simplified animation
                            OutlinedButton.icon(
                              onPressed:
                                  _isLoading ? null : _handleGoogleSignIn,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: colorScheme.onBackground,
                                side: BorderSide(
                                  color:
                                      colorScheme.onBackground.withOpacity(0.2),
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ).copyWith(
                                elevation:
                                    MaterialStateProperty.resolveWith<double>(
                                        (Set<MaterialState> states) {
                                  if (states.contains(
                                    MaterialState.hovered,
                                  )) return 2;
                                  return 0;
                                }),
                              ),
                              icon: Image.network(
                                'https://www.google.com/favicon.ico',
                                height: 24,
                              )
                                  .animate(
                                    onPlay: (controller) => controller.repeat(),
                                  )
                                  .shimmer(
                                    duration: 2.seconds,
                                    color: colorScheme.primary.withOpacity(
                                      0.1,
                                    ),
                                  ),
                              label: const Text("Continue with Google"),
                            ),

                            const SizedBox(height: 16),

                            // Toggle auth mode with simplified animation
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 200),
                              child: TextButton(
                                key: ValueKey<bool>(_isLogin),
                                onPressed: _toggleAuthMode,
                                child: Text(
                                  _isLogin
                                      ? "Don't have an account? Sign Up"
                                      : "Already have an account? Login",
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Loading overlay with simplified animation
            if (_isLoading)
              Container(
                color: Colors.black.withOpacity(0.3),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(
                          colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Please wait...',
                        style: TextStyle(
                          color: colorScheme.onBackground,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormFields() {
    return Column(
      key: ValueKey<bool>(_isLogin),
      children: [
        if (!_isLogin)
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Name',
              prefixIcon: Icon(Icons.person_outline),
            ),
            validator: _validateName,
          ),
        if (!_isLogin) const SizedBox(height: 16),
        TextFormField(
          controller: _emailController,
          decoration: const InputDecoration(
            labelText: 'Email',
            prefixIcon: Icon(Icons.email_outlined),
          ),
          keyboardType: TextInputType.emailAddress,
          validator: _validateEmail,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _passwordController,
          decoration: const InputDecoration(
            labelText: 'Password',
            prefixIcon: Icon(Icons.lock_outline),
          ),
          obscureText: true,
          validator: _validatePassword,
        ),
        const SizedBox(height: 16),
        // Remember Me checkbox
        Row(
          children: [
            Checkbox(
              value: _rememberCredentials,
              onChanged: (value) {
                setState(() {
                  _rememberCredentials = value ?? false;
                });
                // Clear saved credentials if unchecked
                if (!_rememberCredentials) {
                  _clearSavedCredentials();
                }
              },
            ),
            const Expanded(
              child: Text(
                'Remember my credentials',
                style: TextStyle(fontSize: 14),
              ),
            ),
          ],
        ),
      ],
    );
  }

  String? _validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your name';
    }
    if (value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your email';
    }
    if (!value.contains('@') || !value.contains('.')) {
      return 'Please enter a valid email';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your password';
    }
    if (!_isLogin && value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }
}
