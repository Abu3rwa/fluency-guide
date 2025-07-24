// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../../../../migrate/lib/models/vocabulary_word.dart';
import '../../../../../../migrate/lib/models/vocabulary_progress.dart';
import '../../../../../../migrate/lib/models/pronunciation_progress.dart';
import '../../providers/vocabulary_goal_provider.dart';
import '../../providers/vocabulary_progress_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/user_provider.dart';
import '../../widgets/word_pronunciation_widget.dart';
import '../../widgets/sentence_pronunciation_widget.dart';
import '../../services/speech_recognition_service.dart';
import '../../services/notification_service.dart';
import '../../services/pronunciation_progress_service.dart';
import '../../providers/session_timer_provider.dart';
import '../../l10n/app_localizations.dart';
import 'word_card.dart';
import 'navigation_controls.dart';
import 'goal_prompt_section.dart';
import 'goal_progress_section.dart';
import 'progress_section.dart';
import 'dialogs/motivation_dialog.dart';
import 'vocabulary_app_bar.dart';

class VocabularyBuildingScreen extends StatefulWidget {
  const VocabularyBuildingScreen({Key? key}) : super(key: key);

  @override
  State<VocabularyBuildingScreen> createState() =>
      _VocabularyBuildingScreenState();
}

class _VocabularyBuildingScreenState extends State<VocabularyBuildingScreen>
    with TickerProviderStateMixin {
  List<VocabularyWord> _vocabulary = [];
  int _currentIndex = 0;
  String _searchQuery = '';
  bool _showAnswer = false;
  bool _isFavorite = false;
  bool _isSearchExpanded = false;
  bool _showPronunciationPractice = false;
  bool _showPronunciationProgress = false;
  bool _wordPronunciationCompleted = false;
  bool _sentencePronunciationCompleted = false;
  PronunciationSummary? _currentWordPronunciationSummary;
  Map<String, dynamic>? _userPronunciationStats;

  late AnimationController _cardAnimationController;
  late AnimationController _progressAnimationController;
  late AnimationController _searchAnimationController;
  late Animation<double> _cardAnimation;
  late Animation<double> _progressAnimation;
  late Animation<double> _searchAnimation;

  final PageController _pageController = PageController();
  final TextEditingController _searchController = TextEditingController();
  final SpeechRecognitionService _speechService = SpeechRecognitionService();

  DateTime? _sessionStartTime;
  int _lastMotivationMinute = 0;

  @override
  void initState() {
    super.initState();
    _vocabulary = vocabularyWords;

    // Initialize animations
    _cardAnimationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _progressAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _searchAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _cardAnimation = CurvedAnimation(
      parent: _cardAnimationController,
      curve: Curves.elasticOut,
    );
    _progressAnimation = CurvedAnimation(
      parent: _progressAnimationController,
      curve: Curves.easeInOut,
    );
    _searchAnimation = CurvedAnimation(
      parent: _searchAnimationController,
      curve: Curves.easeInOut,
    );

    // Start initial animations
    _cardAnimationController.forward();
    _progressAnimationController.forward();

    // Initialize progress tracking after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeProgressTracking();
      _startLearningSession();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final timerProvider = Provider.of<SessionTimerProvider>(context);
    timerProvider.addListener(_checkForMotivation);
  }

  void _checkForMotivation() {
    final timerProvider =
        Provider.of<SessionTimerProvider>(context, listen: false);
    if (timerProvider.minutes > 0 &&
        timerProvider.minutes % 10 == 0 &&
        timerProvider.minutes != _lastMotivationMinute) {
      _lastMotivationMinute = timerProvider.minutes;
      showMotivationDialog(context);
    }
  }

  void _initializeProgressTracking() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final progressProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);

    print('Initializing progress tracking...');
    print('Firebase user: ${authProvider.firebaseUser?.uid}');

    if (authProvider.firebaseUser != null) {
      print(
          'Initializing progress provider for user: ${authProvider.firebaseUser!.uid}');
      progressProvider.initialize(authProvider.firebaseUser!.uid).then((_) {
        print('Progress provider initialized successfully');
        // Load pronunciation data
        _loadPronunciationData();
      }).catchError((error) {
        print('Error initializing progress provider: $error');
      });
    } else {
      print('No Firebase user found, skipping progress initialization');
    }
  }

  void _loadPronunciationData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.firebaseUser == null) return;

    try {
      // Load current word pronunciation summary
      final currentWord = _vocabulary[_currentIndex];
      final summary = await _speechService.getPronunciationSummary(
        authProvider.firebaseUser!.uid,
        currentWord.word,
      );

      // Load user's overall pronunciation stats
      final stats = await _speechService.getUserPronunciationStats(
        authProvider.firebaseUser!.uid,
      );

      setState(() {
        _currentWordPronunciationSummary = summary;
        _userPronunciationStats = stats;
      });
    } catch (e) {
      print('Error loading pronunciation data: $e');
    }
  }

  void _togglePronunciationProgress() {
    setState(() {
      _showPronunciationProgress = !_showPronunciationProgress;
    });

    if (_showPronunciationProgress) {
      _loadPronunciationData();
    }
  }

  @override
  void dispose() {
    _cardAnimationController.dispose();
    _progressAnimationController.dispose();
    _searchAnimationController.dispose();
    _pageController.dispose();
    _searchController.dispose();

    // Clean up persistent notifications when leaving the screen
    _removeLearningSessionNotification();

    Provider.of<SessionTimerProvider>(context, listen: false)
        .removeListener(_checkForMotivation);

    super.dispose();
  }

  /// End learning session and show completion notification
  void _endLearningSession() async {
    // Remove persistent notification
    _removeLearningSessionNotification();

    // Calculate session duration (example: assume session started at a stored DateTime _sessionStartTime)
    final sessionStart = _sessionStartTime ?? DateTime.now();
    final minutesSpent = DateTime.now().difference(sessionStart).inMinutes;
    if (minutesSpent > 0) {
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      await userProvider.updateTodayStudyMinutes(minutesSpent);
    }

    // Show completion message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 8),
            Text(
              // TODO: Add a localization key with a placeholder for the number of words reviewed
              // Example: AppLocalizations.of(context)!.sessionCompletedYouReviewedWords(_currentIndex + 1)
              'Session completed! You reviewed \\${_currentIndex + 1} words.',
            ),
          ],
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _showGoalCompletedDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.goalAchieved),
        content: Text(AppLocalizations.of(context)!
            .congratulationsYouHaveReachedYourDailyVocabularyGoalWouldYouLikeToSetANewOne),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(AppLocalizations.of(context)!.notNow),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pushNamed('/vocabularyGoalSetting');
            },
            child: Text(AppLocalizations.of(context)!.setNewGoal),
          ),
        ],
      ),
    );
  }

  void _nextWord() {
    HapticFeedback.lightImpact();
    _cardAnimationController.reset();

    // Track progress for current word
    _trackWordProgress();

    final goalProvider =
        Provider.of<VocabularyGoalProvider>(context, listen: false);
    if (goalProvider.hasGoal && !goalProvider.isCompleted) {
      goalProvider.updateProgress(1).then((_) {
        if (goalProvider.isCompleted) {
          _showGoalCompletedDialog();
        }
      });
    }

    setState(() {
      _currentIndex = (_currentIndex + 1) % _vocabulary.length;
      _showAnswer = false;
      _updateFavoriteStatus();
    });
    _cardAnimationController.forward();
    _progressAnimationController.forward();

    // Update persistent notification with new word
    _updateLearningSessionNotification();
  }

  void _previousWord() {
    HapticFeedback.lightImpact();
    _cardAnimationController.reset();

    // Track progress for current word
    _trackWordProgress();

    setState(() {
      _currentIndex =
          (_currentIndex - 1 + _vocabulary.length) % _vocabulary.length;
      _showAnswer = false;
      _updateFavoriteStatus();
    });
    _cardAnimationController.forward();
    _progressAnimationController.forward();

    // Update persistent notification with new word
    _updateLearningSessionNotification();
  }

  void _toggleAnswer() {
    HapticFeedback.selectionClick();
    setState(() {
      _showAnswer = !_showAnswer;
    });
  }

  void _toggleFavorite() {
    HapticFeedback.mediumImpact();

    final currentWord = _vocabulary[_currentIndex];
    final progressProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (authProvider.firebaseUser != null) {
      progressProvider.toggleFavorite(currentWord.word).catchError((error) {
        print('Error toggling favorite: $error');
        // Show error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                AppLocalizations.of(context)!.failedToUpdateFavoriteStatus),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
          ),
        );
      });
    }

    setState(() {
      _isFavorite = !_isFavorite;
    });

    // Show feedback
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(_isFavorite
                ? AppLocalizations.of(context)!.addedToFavorites
                : AppLocalizations.of(context)!.removedFromFavorites),
          ],
        ),
        backgroundColor: _isFavorite ? Colors.red : Colors.grey[600],
        duration: const Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _updateFavoriteStatus() {
    final currentWord = _vocabulary[_currentIndex];
    final progressProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (authProvider.firebaseUser != null) {
      _isFavorite = progressProvider.isFavorite(currentWord.word);
    } else {
      _isFavorite = false;
    }
  }

  void _trackWordProgress() {
    final currentWord = _vocabulary[_currentIndex];
    final progressProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    print('Tracking progress for word: ${currentWord.word}');
    print('Firebase user: ${authProvider.firebaseUser?.uid}');
    print('Progress provider current user: ${progressProvider.currentUserId}');

    if (authProvider.firebaseUser != null) {
      // Ensure progress provider is initialized
      if (progressProvider.currentUserId == null) {
        print('Progress provider not initialized, initializing now...');
        progressProvider.initialize(authProvider.firebaseUser!.uid);
      }

      progressProvider
          .incrementViewCount(currentWord.word)
          .then((_) {})
          .catchError((error) {
        // Show a subtle error message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!
                .progressTrackingTemporarilyUnavailable),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
          ),
        );
      });
    } else {
      print('No Firebase user, skipping progress tracking');
    }
  }

  void _testFirebaseConnection() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final progressProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);

    String debugInfo = 'Firebase Debug Info:\n';
    debugInfo += 'Firebase User: ${authProvider.firebaseUser?.uid ?? 'null'}\n';
    debugInfo +=
        'Progress Provider User: ${progressProvider.currentUserId ?? 'null'}\n';
    debugInfo += 'Progress Map Size: ${progressProvider.progressMap.length}\n';
    debugInfo += 'Favorite Words: ${progressProvider.favoriteWords.length}\n';

    print(debugInfo);

    // Test manual Firebase operation
    if (authProvider.firebaseUser != null) {
      final currentWord = _vocabulary[_currentIndex];
      print('Testing manual Firebase operation for word: ${currentWord.word}');

      // Test vocabulary progress recording
      if (progressProvider.currentUserId == null) {
        print('Initializing progress provider for test...');
        progressProvider.initialize(authProvider.firebaseUser!.uid).then((_) {
          print(
              'Progress provider initialized, testing recordCorrectAnswer...');
          return progressProvider.recordCorrectAnswer(currentWord.word);
        }).then((_) {
          print('Vocabulary progress test successful!');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppLocalizations.of(context)!
                  .vocabularyProgressTestSuccessfulCheckConsoleForDetails),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 3),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
            ),
          );
        }).catchError((error) {
          print(
              '${AppLocalizations.of(context)!.vocabularyProgressTestFailed}: $error');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  '${AppLocalizations.of(context)!.vocabularyProgressTestFailed}: $error'),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 5),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
            ),
          );
        });
      } else {
        progressProvider.recordCorrectAnswer(currentWord.word).then((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppLocalizations.of(context)!
                  .vocabularyProgressTestSuccessfulCheckConsoleForDetails),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 3),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
            ),
          );
        }).catchError((error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  '${AppLocalizations.of(context)!.vocabularyProgressTestFailed}: $error'),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 5),
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
            ),
          );
        });
      }
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(debugInfo),
        backgroundColor: Colors.blue,
        duration: const Duration(seconds: 5),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _toggleSearch() {
    setState(() {
      _isSearchExpanded = !_isSearchExpanded;
    });

    if (_isSearchExpanded) {
      _searchAnimationController.forward();
    } else {
      _searchAnimationController.reverse();
      _searchController.clear();
      setState(() {
        _searchQuery = '';
      });
    }
  }

  void _playPronunciation() {
    HapticFeedback.lightImpact();
    _showPronunciationPracticeDialog();
  }

  void _showPronunciationPracticeDialog() {
    final currentWord = _vocabulary[_currentIndex];

    // Show persistent notification for pronunciation practice
    _showPronunciationPracticeNotification(currentWord.word, 0, 0.0);

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        insetPadding: const EdgeInsets.all(16),
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.9,
            maxHeight: MediaQuery.of(context).size.height * 0.8,
            minWidth: 300,
            minHeight: 400,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(8),
                    topRight: Radius.circular(8),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.record_voice_over,
                      color: Colors.white,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        AppLocalizations.of(context)!.wordPronunciationPractice,
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () {
                        // Remove pronunciation practice notification when closing
                        final practiceId =
                            DateTime.now().millisecondsSinceEpoch % 2147483647;
                        NotificationService.removePersistentNotification(
                            practiceId);
                        Navigator.of(context).pop();
                      },
                    ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: Builder(
                  builder: (context) {
                    try {
                      return SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: WordPronunciationWidget(
                          targetWord: currentWord.word,
                          pronunciation: currentWord.pronunciation,
                          onSuccess: () {
                            _onPronunciationSuccess();
                            // Remove pronunciation practice notification on success
                            final practiceId =
                                DateTime.now().millisecondsSinceEpoch;
                            NotificationService.removePersistentNotification(
                                practiceId);
                            Navigator.of(context).pop();
                          },
                          onRetry: () {
                            _onPronunciationRetry();
                            // Remove pronunciation practice notification on retry
                            final practiceId =
                                DateTime.now().millisecondsSinceEpoch;
                            NotificationService.removePersistentNotification(
                                practiceId);
                            Navigator.of(context).pop();
                          },
                        ),
                      );
                    } catch (e) {
                      debugPrint(
                          'Error creating pronunciation practice widget: $e');
                      return Container(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.error_outline,
                              size: 48,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              AppLocalizations.of(context)!
                                  .unableToLoadPronunciationPractice,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              AppLocalizations.of(context)!.pleaseTryAgainLater,
                              style: TextStyle(
                                color: Colors.grey[600],
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                // Remove pronunciation practice notification when closing
                                final practiceId =
                                    DateTime.now().millisecondsSinceEpoch;
                                NotificationService
                                    .removePersistentNotification(practiceId);
                                Navigator.of(context).pop();
                              },
                              child: Text(AppLocalizations.of(context)!.close),
                            ),
                          ],
                        ),
                      );
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSentencePronunciationDialog() {
    final currentWord = _vocabulary[_currentIndex];

    // Only show if there's an example sentence
    if (currentWord.example == null || currentWord.example!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!
              .noExampleSentenceAvailableForThisWord),
          backgroundColor: Colors.orange,
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
        ),
      );
      return;
    }

    // Show persistent notification for sentence pronunciation practice
    _showSentencePronunciationNotification(currentWord.example!, 0, 0.0);

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        insetPadding: const EdgeInsets.all(16),
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.9,
            maxHeight: MediaQuery.of(context).size.height * 0.8,
            minWidth: 300,
            minHeight: 400,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Colors.teal,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(8),
                    topRight: Radius.circular(8),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.chat_bubble_outline,
                      color: Colors.white,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        AppLocalizations.of(context)!
                            .sentencePronunciationPractice,
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () {
                        // Remove sentence pronunciation notification when closing
                        final practiceId =
                            DateTime.now().millisecondsSinceEpoch % 2147483647;
                        NotificationService.removePersistentNotification(
                            practiceId);
                        Navigator.of(context).pop();
                      },
                    ),
                  ],
                ),
              ),
              // Content
              Expanded(
                child: Builder(
                  builder: (context) {
                    try {
                      return SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: SentencePronunciationWidget(
                          targetSentence: currentWord.example!,
                          sentenceTranslation: currentWord.exampleMeaningArabic,
                          context:
                              AppLocalizations.of(context)!.exampleSentenceFor +
                                  ': ${currentWord.word}',
                          onSuccess: () {
                            _onSentencePronunciationSuccess();
                            // Remove sentence pronunciation notification on success
                            final practiceId =
                                DateTime.now().millisecondsSinceEpoch;
                            NotificationService.removePersistentNotification(
                                practiceId);
                            Navigator.of(context).pop();
                          },
                          onRetry: () {
                            _onSentencePronunciationRetry();
                            // Remove sentence pronunciation notification on retry
                            final practiceId =
                                DateTime.now().millisecondsSinceEpoch;
                            NotificationService.removePersistentNotification(
                                practiceId);
                            Navigator.of(context).pop();
                          },
                        ),
                      );
                    } catch (e) {
                      debugPrint(
                          'Error creating sentence pronunciation widget: $e');
                      return Container(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.error_outline,
                              size: 48,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              AppLocalizations.of(context)!
                                  .unableToLoadSentencePronunciationPractice,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              AppLocalizations.of(context)!.pleaseTryAgainLater,
                              style: TextStyle(
                                color: Colors.grey[600],
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                // Remove sentence pronunciation notification when closing
                                final practiceId =
                                    DateTime.now().millisecondsSinceEpoch;
                                NotificationService
                                    .removePersistentNotification(practiceId);
                                Navigator.of(context).pop();
                              },
                              child: Text(AppLocalizations.of(context)!.close),
                            ),
                          ],
                        ),
                      );
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _onPronunciationSuccess() {
    setState(() {
      _wordPronunciationCompleted = true;
    });
    _checkCompletion();
    print('=== WORD PRONUNCIATION SUCCESS ===');
    // Record successful pronunciation in Firebase
    final currentWord = _vocabulary[_currentIndex];
    print('Current word: \\${currentWord.word}');
    final progressProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    print('Auth provider user: \\${authProvider.firebaseUser?.uid}');
    print(
        'Progress provider initialized: \\${progressProvider.currentUserId != null}');

    if (authProvider.firebaseUser != null) {
      // Ensure progress provider is initialized
      if (progressProvider.currentUserId == null) {
        print('Progress provider not initialized, initializing now...');
        progressProvider.initialize(authProvider.firebaseUser!.uid).then((_) {
          print(
              'Progress provider initialized, now recording correct answer...');
          return progressProvider.recordCorrectAnswer(currentWord.word);
        }).then((_) {
          print(
              'Successfully recorded correct answer for word: \\${currentWord.word}');
        }).catchError((error) {
          print('Error initializing or recording correct answer: \\${error}');
        });
      } else {
        print('Recording correct answer for word: \\${currentWord.word}');
        progressProvider.recordCorrectAnswer(currentWord.word).then((_) {
          print(
              'Successfully recorded correct answer for word: \\${currentWord.word}');
        }).catchError((error) {
          print('Error recording correct answer: \\${error}');
        });
      }
    } else {
      print('No authenticated user found');
    }

    // Show a custom celebratory dialog instead of a SnackBar
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return Dialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.emoji_events, color: Colors.amber, size: 64),
                const SizedBox(height: 16),
                Text(
                  AppLocalizations.of(context)!.awesome,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.green[700],
                      ),
                ),
                const SizedBox(height: 12),
                Text(
                  AppLocalizations.of(context)!
                      .greatPronunciationKeepPracticingAndYoullMasterThisWord,
                  style: Theme.of(context).textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                if (_currentWordPronunciationSummary != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Column(
                      children: [
                        Text(
                          AppLocalizations.of(context)!.yourBestAccuracy,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${(_currentWordPronunciationSummary!.bestAccuracy * 100).toStringAsFixed(1)}%',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                color: Colors.blue,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        if (_currentWordPronunciationSummary!.averageAccuracy >
                            0)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              AppLocalizations.of(context)!.average +
                                  ': ${(_currentWordPronunciationSummary!.averageAccuracy * 100).toStringAsFixed(1)}%',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: Colors.grey[700]),
                            ),
                          ),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).pop();
                        _nextWord();
                      },
                      icon: const Icon(Icons.arrow_forward),
                      label: Text(AppLocalizations.of(context)!.nextWord),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: Text(AppLocalizations.of(context)!.close),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _onPronunciationRetry() {
    print('User wants to retry pronunciation');
  }

  void _onSentencePronunciationSuccess() {
    setState(() {
      _sentencePronunciationCompleted = true;
    });
    _checkCompletion();
    print('=== SENTENCE PRONUNCIATION SUCCESS ===');
    // Record successful sentence pronunciation in Firebase
    final currentWord = _vocabulary[_currentIndex];
    print('Current word: \\${currentWord.word}');
    final progressProvider =
        Provider.of<VocabularyProgressProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    print('Auth provider user: \\${authProvider.firebaseUser?.uid}');
    print(
        'Progress provider initialized: \\${progressProvider.currentUserId != null}');

    if (authProvider.firebaseUser != null) {
      // Ensure progress provider is initialized
      if (progressProvider.currentUserId == null) {
        print('Progress provider not initialized, initializing now...');
        progressProvider.initialize(authProvider.firebaseUser!.uid).then((_) {
          print(
              'Progress provider initialized, now recording correct answer...');
          return progressProvider.recordCorrectAnswer(currentWord.word);
        }).then((_) {
          print(
              'Successfully recorded correct answer for sentence practice of word: \\${currentWord.word}');
        }).catchError((error) {
          print(
              'Error initializing or recording correct answer for sentence practice: \\${error}');
        });
      } else {
        print(
            'Recording correct answer for sentence practice of word: \\${currentWord.word}');
        progressProvider.recordCorrectAnswer(currentWord.word).then((_) {
          print(
              'Successfully recorded correct answer for sentence practice of word: \\${currentWord.word}');
        }).catchError((error) {
          print(
              'Error recording correct answer for sentence practice: \\${error}');
        });
      }
    } else {
      print('No authenticated user found');
    }

    // Show a custom celebratory dialog instead of a SnackBar
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return Dialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.emoji_events, color: Colors.amber, size: 64),
                const SizedBox(height: 16),
                Text(
                  AppLocalizations.of(context)!.excellent,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.teal[700],
                      ),
                ),
                const SizedBox(height: 12),
                Text(
                  AppLocalizations.of(context)!
                      .greatSentencePronunciationKeepPracticingAndYoullSoundLikeANative,
                  style: Theme.of(context).textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                if (_currentWordPronunciationSummary != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Column(
                      children: [
                        Text(
                          AppLocalizations.of(context)!.yourBestAccuracy,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${(_currentWordPronunciationSummary!.bestAccuracy * 100).toStringAsFixed(1)}%',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                color: Colors.blue,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        if (_currentWordPronunciationSummary!.averageAccuracy >
                            0)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              AppLocalizations.of(context)!.average +
                                  ': ${(_currentWordPronunciationSummary!.averageAccuracy * 100).toStringAsFixed(1)}%',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(color: Colors.grey[700]),
                            ),
                          ),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).pop();
                        _nextWord();
                      },
                      icon: const Icon(Icons.arrow_forward),
                      label: Text(AppLocalizations.of(context)!.nextWord),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(AppLocalizations.of(context)!.close),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _onSentencePronunciationRetry() {
    print('User wants to retry sentence pronunciation');
  }

  void _checkCompletion() {
    if (_wordPronunciationCompleted && _sentencePronunciationCompleted) {
      final goalProvider =
          Provider.of<VocabularyGoalProvider>(context, listen: false);
      if (goalProvider.hasGoal && !goalProvider.isCompleted) {
        goalProvider.updateProgress(1).then((_) {
          if (goalProvider.isCompleted) {
            _showGoalCompletedDialog();
          }
        });
      }
    }
  }

  // ==================== PERSISTENT NOTIFICATIONS ====================

  /// Show persistent notification for learning session
  void _showLearningSessionNotification() {
    final currentWord = _vocabulary[_currentIndex];
    final sessionId = DateTime.now().millisecondsSinceEpoch;

    NotificationService.showLearningSessionNotification(
      sessionId: sessionId,
      currentWord: currentWord.word,
      wordsCompleted: _currentIndex,
      totalWords: _vocabulary.length,
    );
  }

  /// Update learning session notification
  void _updateLearningSessionNotification() {
    final currentWord = _vocabulary[_currentIndex];
    final sessionId = DateTime.now().millisecondsSinceEpoch;

    NotificationService.updatePersistentNotification(
      id: sessionId,
      title: AppLocalizations.of(context)!.learningSessionInProgress,
      body:
          AppLocalizations.of(context)!.currentWord + ': "${currentWord.word}"',
      progress: _currentIndex / _vocabulary.length,
    );
  }

  /// Remove learning session notification
  void _removeLearningSessionNotification() {
    final sessionId = DateTime.now().millisecondsSinceEpoch;
    NotificationService.removePersistentNotification(sessionId);
  }

  /// Show persistent notification for pronunciation practice
  void _showPronunciationPracticeNotification(
      String targetWord, int attempts, double accuracy) {
    final practiceId =
        DateTime.now().millisecondsSinceEpoch % 2147483647; // 32-bit max

    NotificationService.showPronunciationPracticeNotification(
      practiceId: practiceId,
      targetWord: targetWord,
      attempts: attempts,
      bestAccuracy: accuracy,
    );
  }

  /// Show persistent notification for sentence pronunciation practice
  void _showSentencePronunciationNotification(
      String targetSentence, int attempts, double accuracy) {
    final practiceId =
        DateTime.now().millisecondsSinceEpoch % 2147483647; // 32-bit max

    NotificationService.showPronunciationPracticeNotification(
      practiceId: practiceId,
      targetWord: targetSentence,
      attempts: attempts,
      bestAccuracy: accuracy,
    );
  }

  /// Show streak maintenance notification
  void _showStreakMaintenanceNotification() {
    final streakId = DateTime.now().millisecondsSinceEpoch;
    final currentStreak = 5; // This should come from your streak provider
    final hoursLeft = 3; // Calculate based on last activity

    NotificationService.showStreakMaintenanceNotification(
      streakId: streakId,
      currentStreak: currentStreak,
      hoursLeft: hoursLeft,
    );
  }

  /// Show study reminder notification
  void _showStudyReminderNotification() {
    final reminderId = DateTime.now().millisecondsSinceEpoch;

    NotificationService.showStudyReminderNotification(
      reminderId: reminderId,
      message: AppLocalizations.of(context)!
          .timeToPracticeYourVocabularyKeepYourLearningStreakAlive,
      minutesLeft: 30,
    );
  }

  /// Start a learning session with persistent notification
  void _startLearningSession() {
    // Show persistent notification for learning session
    _showLearningSessionNotification();

    // Show a welcome message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.notifications_active, color: Colors.white),
            const SizedBox(width: 8),
            Text(AppLocalizations.of(context)!
                .learningSessionStartedCheckYourNotifications),
          ],
        ),
        backgroundColor: Colors.blue,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
      ),
    );

    // Set session start time
    _sessionStartTime = DateTime.now();
  }

  void _randomWord() {
    HapticFeedback.mediumImpact();
    _cardAnimationController.reset();
    setState(() {
      _currentIndex =
          (DateTime.now().millisecondsSinceEpoch % _vocabulary.length).toInt();
      _showAnswer = false;
      _updateFavoriteStatus();
    });
    _cardAnimationController.forward();
    _progressAnimationController.forward();
  }

  @override
  Widget build(BuildContext context) {
    final currentWord = _vocabulary[_currentIndex];
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        // Initialize progress tracking when auth state changes
        if (authProvider.firebaseUser != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            final progressProvider =
                Provider.of<VocabularyProgressProvider>(context, listen: false);
            if (progressProvider.currentUserId == null) {
              print('Auth state changed, initializing progress provider...');
              progressProvider.initialize(authProvider.firebaseUser!.uid);
            }
          });
        }

        return Scaffold(
          body: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: isDark
                    ? [theme.colorScheme.background, theme.colorScheme.surface]
                    : [Colors.grey[50]!, Colors.grey[100]!],
              ),
            ),
            child: CustomScrollView(
              slivers: [
                VocabularyAppBar(
                  isSearchExpanded: _isSearchExpanded,
                  isFavorite: _isFavorite,
                  onToggleSearch: _toggleSearch,
                  onToggleFavorite: _toggleFavorite,
                  onTestFirebaseConnection: _testFirebaseConnection,
                ),
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      // Search Bar
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        height: _isSearchExpanded ? 80 : 0,
                        child: _isSearchExpanded
                            ? FadeTransition(
                                opacity: _searchAnimation,
                                child: Container(
                                  margin: const EdgeInsets.all(16),
                                  child: TextField(
                                    controller: _searchController,
                                    autofocus: true,
                                    decoration: InputDecoration(
                                      hintText: AppLocalizations.of(context)!
                                          .searchWordsOrMeanings,
                                      prefixIcon: const Icon(Icons.search),
                                      suffixIcon: _searchQuery.isNotEmpty
                                          ? IconButton(
                                              icon: const Icon(Icons.clear),
                                              onPressed: () {
                                                _searchController.clear();
                                                setState(() {
                                                  _searchQuery = '';
                                                });
                                              },
                                            )
                                          : null,
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(16),
                                        borderSide: BorderSide.none,
                                      ),
                                      filled: true,
                                      fillColor: isDark
                                          ? theme.colorScheme.surface
                                          : Colors.white,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 12,
                                      ),
                                    ),
                                    onChanged: (value) {
                                      setState(() {
                                        _searchQuery = value;
                                        if (value.isNotEmpty) {
                                          final filteredVocabulary =
                                              _vocabulary.where((word) {
                                            return word.word
                                                    .toLowerCase()
                                                    .contains(
                                                        value.toLowerCase()) ||
                                                (word.meaningArabic
                                                        ?.toLowerCase()
                                                        .contains(value
                                                            .toLowerCase()) ??
                                                    false);
                                          }).toList();

                                          if (filteredVocabulary.isNotEmpty) {
                                            final index = _vocabulary.indexOf(
                                                filteredVocabulary.first);
                                            if (index != -1) {
                                              _currentIndex = index;
                                              _updateFavoriteStatus();
                                            }
                                          }
                                        }
                                      });
                                    },
                                  ),
                                ),
                              )
                            : const SizedBox.shrink(),
                      ),

                      // Goal Prompt Section
                      GoalPromptSection(
                        onSetGoal: () => Navigator.of(context)
                            .pushNamed('/vocabularyGoalSetting'),
                      ),

                      // Goal Progress Section
                      const GoalProgressSection(),

                      // Progress Section
                      ProgressSection(
                        currentIndex: _currentIndex,
                        vocabularyLength: _vocabulary.length,
                        theme: theme,
                        isDark: isDark,
                        progressAnimation: _progressAnimation,
                      ),

                      const SizedBox(height: 16),

                      // Main Word Card
                      WordCard(
                        word: currentWord,
                        theme: theme,
                        isDark: isDark,
                        wordPronunciationCompleted: _wordPronunciationCompleted,
                        sentencePronunciationCompleted:
                            _sentencePronunciationCompleted,
                        onShowPronunciationPractice:
                            _showPronunciationPracticeDialog,
                        onShowSentencePronunciation:
                            _showSentencePronunciationDialog,
                      ),

                      const SizedBox(height: 24),

                      // Navigation Controls
                      NavigationControls(
                        theme: theme,
                        onPrevious: _previousWord,
                        onNext: _nextWord,
                        onRandom: _randomWord,
                        onToggleAnswer: _toggleAnswer,
                        showAnswer: _showAnswer,
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // bottomNavigationBar: const BottomNav(),
        );
      },
    );
  }
}
