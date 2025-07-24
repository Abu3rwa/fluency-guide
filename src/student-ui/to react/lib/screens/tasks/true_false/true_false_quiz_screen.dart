import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'dart:convert';

// Assume you have these models:
import '../../../../../../../migrate/lib/models/task_model.dart'; // Your TaskQuestion model
import 'package:englishfluencyguide/providers/user_provider.dart';
import 'package:englishfluencyguide/services/task_service.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:englishfluencyguide/theme/theme_provider.dart';
import 'package:englishfluencyguide/providers/recent_activity_provider.dart';
import 'package:englishfluencyguide/models/recent_activity_model.dart';
import 'package:englishfluencyguide/routes/app_routes.dart';
import 'package:englishfluencyguide/providers/audio_provider.dart';

import 'true_false_answer_button.dart';
import 'true_false_feedback_section.dart';
import 'true_false_navigation.dart';
import 'true_false_progress_indicator.dart';
import 'true_false_question_card.dart';
import 'true_false_results_screen.dart';

class TrueFalseQuizScreen extends StatefulWidget {
  final String taskId;
  const TrueFalseQuizScreen({Key? key, required this.taskId}) : super(key: key);

  @override
  State<TrueFalseQuizScreen> createState() => _TrueFalseQuizScreenState();
}

class _TrueFalseQuizScreenState extends State<TrueFalseQuizScreen>
    with TickerProviderStateMixin {
  Task? quiz;
  bool isLoading = true;
  String? errorMessage;

  List<TaskQuestion>? questions;
  int? timeLimitSeconds;
  int? attemptsAllowed;
  int? pointsPerQuestion;
  int? totalPoints;
  bool? randomizeQuestions;
  bool? showFeedback;
  bool? showCorrectAnswers;
  bool? allowReview;
  String? difficulty;
  List<String>? tags;

  int currentQuestionIndex = 0;
  Map<String, bool> userAnswers = {};
  Map<String, bool> isAnswered = {};
  Map<String, DateTime> answerTimes = {};
  int score = 0;
  int attempts = 0;
  bool quizCompleted = false;
  bool reviewMode = false;
  bool isPaused = false;
  Timer? timer;
  int secondsRemaining = 0;
  DateTime? quizStartTime;
  bool? isCorrect;

  // Periodic progress saving
  Timer? _saveProgressTimer;
  Timer? _progressUpdateTimer;

  // Animation controllers
  late AnimationController _fadeController;
  late AnimationController _scaleController;
  late AnimationController _progressController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _progressAnimation;

  // Sound and haptic feedback
  bool soundEnabled = true;
  bool hapticEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadTask();
  }

  Future<void> _loadTask() async {
    try {
      quiz = await TaskService().getTaskById(widget.taskId);
      if (quiz == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Task not found.';
        });
      } else {
        setState(() {
          isLoading = false;
        });
        _initializeAnimations();
        _restoreOrStartQuiz();
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Error loading task: $e';
      });
    }
  }

  void _initializeAnimations() {
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );
    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );
    _progressAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _progressController, curve: Curves.easeInOut),
    );

    _fadeController.forward();
    _scaleController.forward();
  }

  void _restoreOrStartQuiz() async {
    final prefs = await SharedPreferences.getInstance();
    try {
      final progressString = prefs.getString('quiz_progress_${quiz!.id}');
      if (progressString != null) {
        final progress = jsonDecode(progressString);
        final lastSaved = DateTime.parse(progress['lastSavedTime']);

        if (DateTime.now().difference(lastSaved).inHours < 24) {
          if (mounted) {
            _showResumeDialog(progress);
          }
          return;
        }
      }
    } catch (e) {
      debugPrint('Error restoring progress: $e');
      // If restoration fails, start a new quiz
      await _clearLocalProgress();
    }

    _startNewQuiz();
  }

  void _createQuizActivity(ActivityStatus status) {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);

    debugPrint('=== ACTIVITY CREATION DEBUG ===');
    debugPrint('User provider: ${userProvider.runtimeType}');
    debugPrint('Activity provider: ${activityProvider.runtimeType}');
    debugPrint('User is null: ${userProvider.currentUser == null}');

    if (userProvider.currentUser != null) {
      debugPrint('Creating quiz activity for task: ${quiz!.id}');
      debugPrint('User ID: ${userProvider.currentUser!.uid}');
      debugPrint('Task title: ${quiz!.title}');
      debugPrint('Lesson ID: ${quiz!.lessonId}');
      debugPrint('Course ID: ${quiz!.courseId}');
      debugPrint('Total questions: ${questions!.length}');

      try {
        activityProvider.createActivityFromTaskAttempt(
          quiz!.id,
          userProvider.currentUser!.uid,
          AppRoutes.trueFalse, // Use route as targetId
          quiz!.title,
          quiz!.lessonId,
          quiz!.courseId,
          status,
          progress: 0.0,
          totalQuestions: questions!.length,
        );
        debugPrint('Quiz activity creation initiated successfully');
      } catch (e) {
        debugPrint('ERROR creating activity: $e');
      }
    } else {
      debugPrint('ERROR: User is null, cannot create activity');
    }
    debugPrint('=== END ACTIVITY CREATION DEBUG ===');
  }

  void _updateQuizActivityProgress() {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);

    if (userProvider.currentUser != null && questions != null) {
      // Calculate progress based on answered questions
      final answeredCount = userAnswers.length;
      final progress =
          questions!.isNotEmpty ? answeredCount / questions!.length : 0.0;

      // Find the activity in both recent and incomplete activities
      final allActivities = [
        ...activityProvider.recentActivities,
        ...activityProvider.incompleteActivities
      ];
      try {
        final activity = allActivities.firstWhere(
          (a) =>
              a.targetId == AppRoutes.trueFalse && a.type == ActivityType.task,
        );

        activityProvider.updateActivityProgress(
          activity.id,
          progress,
          progress >= 1.0
              ? ActivityStatus.completed
              : ActivityStatus.inProgress,
        );
      } catch (e) {
        // Activity not found, create a new one
        _createQuizActivity(ActivityStatus.inProgress);
      }
    }
  }

  void _showResumeDialog(Map<String, dynamic> progress) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Resume Quiz?'),
        content: const Text(
            'You have a quiz in progress. Would you like to resume?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _startNewQuiz();
              _clearLocalProgress();
            },
            child: const Text('Start Over'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _restoreProgress(progress);
            },
            child: const Text('Resume'),
          ),
        ],
      ),
    );
  }

  void _startNewQuiz() {
    setState(() {
      _parseQuizData();
      _startQuiz();
    });

    // Create activity for new quiz
    _createQuizActivity(ActivityStatus.inProgress);
  }

  void _restoreProgress(Map<String, dynamic> progress) {
    setState(() {
      _parseQuizData();

      currentQuestionIndex = progress['currentQuestionIndex'];
      userAnswers = Map<String, bool>.from(jsonDecode(progress['userAnswers']));
      isAnswered = Map<String, bool>.from(jsonDecode(progress['isAnswered']));
      answerTimes =
          Map<String, String>.from(jsonDecode(progress['answerTimes']))
              .map((key, value) => MapEntry(key, DateTime.parse(value)));
      score = progress['score'];
      attempts = progress['attempts'];
      quizStartTime = DateTime.parse(progress['quizStartTime']);

      if (timeLimitSeconds! > 0) {
        secondsRemaining = progress['secondsRemaining'];
        timer = Timer.periodic(const Duration(seconds: 1), _onTick);
      }

      _saveProgressTimer =
          Timer.periodic(const Duration(seconds: 15), (_) => _saveProgress());
    });
    _updateProgress();
    _fadeController.forward();

    // Create activity for restored quiz
    _createQuizActivity(ActivityStatus.inProgress);
  }

  Future<void> _saveProgress() async {
    if (quizCompleted) return;

    final prefs = await SharedPreferences.getInstance();
    final progress = {
      'currentQuestionIndex': currentQuestionIndex,
      'userAnswers': jsonEncode(userAnswers),
      'isAnswered': jsonEncode(isAnswered),
      'answerTimes': jsonEncode(
          answerTimes.map((k, v) => MapEntry(k, v.toIso8601String()))),
      'score': score,
      'attempts': attempts,
      'secondsRemaining': secondsRemaining,
      'quizStartTime': quizStartTime?.toIso8601String(),
      'lastSavedTime': DateTime.now().toIso8601String(),
    };

    await prefs.setString('quiz_progress_${quiz!.id}', jsonEncode(progress));
    debugPrint("Progress saved!");
  }

  Future<void> _clearLocalProgress() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('quiz_progress_${quiz!.id}');
    debugPrint("Local progress cleared!");
  }

  void _parseQuizData() {
    setState(() {
      questions = List<TaskQuestion>.from(quiz!.questions);
      timeLimitSeconds = (quiz!.timeLimit) * 60;
      attemptsAllowed = quiz!.attemptsAllowed;
      pointsPerQuestion = quiz!.pointsPerQuestion;

      // Debug logging for quiz data parsing
      debugPrint('=== QUIZ DATA PARSING DEBUG ===');
      debugPrint('Quiz totalPoints from Firebase: ${quiz!.totalPoints}');
      debugPrint(
          'Quiz pointsPerQuestion from Firebase: ${quiz!.pointsPerQuestion}');
      debugPrint('Number of questions: ${questions!.length}');
      debugPrint('Default pointsPerQuestion: $pointsPerQuestion');

      // Fix totalPoints calculation - ensure it's calculated after questions is set
      if (quiz!.totalPoints != null && quiz!.totalPoints! > 0) {
        totalPoints = quiz!.totalPoints;
        debugPrint('Using totalPoints from Firebase: $totalPoints');
      } else {
        // Calculate total points based on individual question points
        int calculatedTotal = 0;
        for (final q in questions!) {
          calculatedTotal += q.points > 0 ? q.points : pointsPerQuestion!;
        }
        totalPoints = calculatedTotal;
        debugPrint('Calculated totalPoints from question points: $totalPoints');
      }

      debugPrint('Final totalPoints: $totalPoints');
      debugPrint('=== END QUIZ DATA PARSING DEBUG ===');

      randomizeQuestions = quiz!.randomizeQuestions ?? false;
      showFeedback = quiz!.showFeedback ?? false;
      showCorrectAnswers = quiz!.showCorrectAnswers ?? false;
      allowReview = quiz!.allowReview ?? false;
      difficulty = quiz!.difficulty;
      tags = quiz!.tags;

      if (randomizeQuestions!) {
        questions!.shuffle();
      }
    });
  }

  void _startQuiz() {
    quizStartTime = DateTime.now();
    if (timeLimitSeconds! > 0) {
      secondsRemaining = timeLimitSeconds!;
      timer = Timer.periodic(const Duration(seconds: 1), _onTick);
    }
    _saveProgressTimer =
        Timer.periodic(const Duration(seconds: 15), (_) => _saveProgress());
  }

  void _onTick(Timer t) {
    if (!isPaused && secondsRemaining > 0) {
      setState(() {
        secondsRemaining--;
      });

      // Warning when 30 seconds left
      if (secondsRemaining == 30) {
        _showTimeWarning();
      }
    } else if (secondsRemaining <= 0) {
      _submitQuiz();
    }
  }

  void _showTimeWarning() {
    if (hapticEnabled) {
      HapticFeedback.vibrate();
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('⚠️ 30 seconds remaining!'),
        backgroundColor: Colors.orange,
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _togglePause() {
    setState(() {
      isPaused = !isPaused;
    });

    // Stop all timers and updates when paused
    if (isPaused) {
      timer?.cancel();
      _saveProgressTimer?.cancel();
      _progressUpdateTimer?.cancel();

      debugPrint('Quiz paused - all timers and updates stopped');
    } else {
      // Resume timers when unpaused
      if (timeLimitSeconds! > 0 && secondsRemaining > 0) {
        timer = Timer.periodic(const Duration(seconds: 1), _onTick);
      }
      _saveProgressTimer =
          Timer.periodic(const Duration(seconds: 15), (_) => _saveProgress());

      debugPrint('Quiz resumed - timers restarted');
    }
  }

  @override
  void dispose() {
    timer?.cancel();
    _saveProgressTimer?.cancel();
    _progressUpdateTimer?.cancel();
    _fadeController.dispose();
    _scaleController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  Future<void> _answerQuestion(bool answer) async {
    final q = questions![currentQuestionIndex];
    if (userAnswers[q.id] != null) return;

    if (hapticEnabled) {
      HapticFeedback.selectionClick();
    }

    setState(() {
      userAnswers[q.id] = answer;
      isAnswered[q.id] = true;
      answerTimes[q.id] = DateTime.now();
      isCorrect =
          (answer == (q.correctAnswer.toString().toLowerCase() == 'true'));
    });

    // Play appropriate audio sound
    final audioProvider = context.read<AudioProvider>();
    if (isCorrect == true) {
      audioProvider.playCorrect();
    } else if (isCorrect == false) {
      audioProvider.playIncorrect();
    }

    // Update activity progress
    _updateQuizActivityProgress();

    // Animate button selection
    await _scaleController.reverse();
    await _scaleController.forward();

    // Save progress after answering
    await _saveProgress();

    // Show feedback if enabled
    if (showFeedback!) {
      await Future.delayed(const Duration(milliseconds: 800));
    }

    if (mounted) {
      if (currentQuestionIndex < questions!.length - 1) {
        _nextQuestion();
      } else {
        _submitQuiz();
      }
    }

    print('Current: $currentQuestionIndex');
    print('All answers: $userAnswers');
  }

  void _nextQuestion() {
    _fadeController.reset();
    setState(() {
      isCorrect = null;
      currentQuestionIndex++;
    });
    _fadeController.forward();
    _updateProgress();
  }

  void _previousQuestion() {
    if (currentQuestionIndex > 0) {
      _fadeController.reset();
      setState(() {
        isCorrect = null;
        currentQuestionIndex--;
      });
      _fadeController.forward();
    }
  }

  void _updateProgress() {
    final progress = (currentQuestionIndex + 1) / questions!.length;
    _progressController.animateTo(progress);
  }

  void _submitQuiz() async {
    timer?.cancel();
    _saveProgressTimer?.cancel();

    score = 0;

    // Debug logging for score calculation
    debugPrint('=== SCORE CALCULATION DEBUG ===');
    debugPrint('Total questions: ${questions!.length}');
    debugPrint('Points per question: $pointsPerQuestion');
    debugPrint('Total points: $totalPoints');
    debugPrint('User answers: $userAnswers');

    for (final q in questions!) {
      final correct = q.correctAnswer.toString().toLowerCase() == 'true';
      final userAnswer = userAnswers[q.id];
      final isCorrect = userAnswer == correct;

      debugPrint(
          'Question ${q.id}: correct=$correct, userAnswer=$userAnswer, isCorrect=$isCorrect, points=${q.points}');

      if (isCorrect) {
        final pointsToAdd = q.points > 0 ? q.points : pointsPerQuestion!;
        score += pointsToAdd;
        debugPrint(
            'Adding $pointsToAdd points for correct answer. New score: $score');
      }
    }

    debugPrint('Final score: $score / $totalPoints');
    debugPrint('=== END SCORE CALCULATION DEBUG ===');

    // Play congratulations sound
    final audioProvider = context.read<AudioProvider>();
    audioProvider.playCongratulations();

    // Update activity status based on result
    final passed = score >= (quiz!.passingScore ?? 0);
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);
    final timeSpent = quizStartTime != null
        ? DateTime.now().difference(quizStartTime!).inMinutes
        : 0;

    if (userProvider.currentUser != null) {
      final allActivities = [
        ...activityProvider.recentActivities,
        ...activityProvider.incompleteActivities
      ];
      try {
        final activity = allActivities.firstWhere(
          (a) =>
              a.targetId == AppRoutes.trueFalse && a.type == ActivityType.task,
        );

        activityProvider.markActivityCompleted(
          activity.id,
          score: score,
          timeSpent: timeSpent,
        );
      } catch (e) {
        activityProvider.createActivityFromTaskAttempt(
          quiz!.id,
          userProvider.currentUser!.uid,
          AppRoutes.trueFalse,
          quiz!.title,
          quiz!.lessonId,
          quiz!.courseId,
          passed ? ActivityStatus.completed : ActivityStatus.failed,
          progress: 1.0,
          score: score,
          timeSpent: timeSpent,
          totalQuestions: questions!.length,
        );
      }
    }

    await _saveResultsToFirestore();
    await _clearLocalProgress();

    if (userProvider.currentUser != null && timeSpent > 0) {
      await userProvider.updateTodayStudyMinutes(timeSpent);
    }

    setState(() {
      quizCompleted = true;
      reviewMode = allowReview!;
    });

    // Refresh user data after completing quiz
    userProvider.refreshUserData();

    if (hapticEnabled) {
      HapticFeedback.mediumImpact();
    }

    if (mounted) {
      if (currentQuestionIndex < questions!.length - 1) {
        _nextQuestion();
      } else {
        _submitQuiz();
      }
    }
  }

  void _restartQuiz() async {
    await _clearLocalProgress();
    setState(() {
      userAnswers.clear();
      isAnswered.clear();
      answerTimes.clear();
      currentQuestionIndex = 0;
      score = 0;
      quizCompleted = false;
      reviewMode = false;
      isPaused = false;
      if (randomizeQuestions!) {
        questions!.shuffle();
      }
      attempts++;
    });

    _progressController.reset();
    _fadeController.reset();
    _fadeController.forward();
    _startQuiz();
  }

  void _showQuizInfo() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(quiz!.title),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Difficulty: $difficulty'),
            Text('Questions: ${questions!.length}'),
            Text('Points per question: $pointsPerQuestion'),
            Text('Passing score: ${quiz!.passingScore ?? 0}'),
            Text('Attempts allowed: $attemptsAllowed'),
            if (timeLimitSeconds! > 0)
              Text('Time limit: ${timeLimitSeconds! ~/ 60} minutes'),
            if (tags!.isNotEmpty) Text('Tags: ${tags!.join(', ')}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SwitchListTile(
              title: const Text('Sound Effects'),
              value: soundEnabled,
              onChanged: (value) => setState(() => soundEnabled = value),
            ),
            SwitchListTile(
              title: const Text('Haptic Feedback'),
              value: hapticEnabled,
              onChanged: (value) => setState(() => hapticEnabled = value),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Color _getTimerColor() {
    if (secondsRemaining > 60) return Colors.green;
    if (secondsRemaining > 30) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (quiz == null || questions == null) {
      return Scaffold(
          body: Center(child: Text(errorMessage ?? 'Task not found')));
    }

    if (quizCompleted) {
      final percentage =
          totalPoints! > 0 ? (score / totalPoints! * 100).round() : 0;
      final passingScore = quiz!.passingScore;
      final passed = percentage >= passingScore || score >= totalPoints!;
      return TrueFalseResultsScreen(
        score: score,
        totalPoints: totalPoints!,
        passed: passed,
        attempts: attempts,
        attemptsAllowed: attemptsAllowed!,
        quizStartTime: quizStartTime,
        questions: questions!,
        userAnswers: userAnswers,
        onRestart: _restartQuiz,
      );
    }

    if (isPaused) {
      return _buildPauseScreen();
    }

    final q = questions![currentQuestionIndex];
    final progress = (currentQuestionIndex + 1) / questions!.length;
    final isCurrentAnswered = userAnswers[q.id] != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(quiz!.title),
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _showQuizInfo,
            icon: const Icon(Icons.info_outline),
          ),
          IconButton(
            onPressed: _showSettings,
            icon: const Icon(Icons.settings),
          ),
          if (timeLimitSeconds! > 0)
            IconButton(
              onPressed: _togglePause,
              icon: Icon(isPaused ? Icons.play_arrow : Icons.pause),
            ),
          if (timeLimitSeconds! > 0)
            Container(
              margin: const EdgeInsets.all(8.0),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _getTimerColor().withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: _getTimerColor()),
              ),
              child: Text(
                '${secondsRemaining ~/ 60}:${(secondsRemaining % 60).toString().padLeft(2, '0')}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: _getTimerColor(),
                ),
              ),
            ),
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, _) => IconButton(
              icon: Icon(
                themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode,
              ),
              onPressed: () => themeProvider.toggleTheme(),
              tooltip: themeProvider.isDarkMode
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode',
            ),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: _fadeAnimation,
        builder: (context, child) {
          return FadeTransition(
            opacity: _fadeAnimation,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Enhanced Progress Section
                  TrueFalseProgressIndicator(
                    currentQuestionIndex: currentQuestionIndex,
                    totalQuestions: questions!.length,
                    progress: progress,
                  ),

                  // Question Card with Animation
                  Expanded(
                    child: AnimatedBuilder(
                      animation: _scaleAnimation,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _scaleAnimation.value,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              TrueFalseQuestionCard(question: q),
                              const SizedBox(height: 20),
                              Row(
                                children: [
                                  Expanded(
                                    child: TrueFalseAnswerButton(
                                      label: 'TRUE',
                                      value: true,
                                      isSelected: userAnswers[q.id] == true,
                                      isCorrect: isCorrect,
                                      isDisabled: isCurrentAnswered,
                                      onAnswer: _answerQuestion,
                                    ),
                                  ),
                                  const SizedBox(width: 20),
                                  Expanded(
                                    child: TrueFalseAnswerButton(
                                      label: 'FALSE',
                                      value: false,
                                      isSelected: userAnswers[q.id] == false,
                                      isCorrect: isCorrect,
                                      isDisabled: isCurrentAnswered,
                                      onAnswer: _answerQuestion,
                                    ),
                                  ),
                                ],
                              ),
                              if (showFeedback! &&
                                  userAnswers.containsKey(q.id))
                                TrueFalseFeedbackSection(
                                  isCorrect: isCorrect,
                                  explanation: q.explanation,
                                ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  // Enhanced Navigation
                  TrueFalseNavigation(
                    currentQuestionIndex: currentQuestionIndex,
                    totalQuestions: questions!.length,
                    isAnswered: isCurrentAnswered,
                    onNext: _nextQuestion,
                    onPrevious: _previousQuestion,
                    onSubmit: _submitQuiz,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPauseScreen() {
    return Scaffold(
      body: Center(
        child: Card(
          margin: const EdgeInsets.all(32),
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.pause_circle_filled,
                  size: 80,
                  color: Theme.of(context).primaryColor,
                ),
                const SizedBox(height: 16),
                Text(
                  'Quiz Paused',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  'Take your time, then resume when ready',
                  style: Theme.of(context).textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: _togglePause,
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Resume Quiz'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _saveResultsToFirestore() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final user = userProvider.currentUser;

    if (user == null) {
      debugPrint("User not logged in, cannot save results.");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('You must be logged in to save results.'),
            backgroundColor: Colors.amber,
          ),
        );
      }
      return;
    }

    final totalTime = quizStartTime != null
        ? DateTime.now().difference(quizStartTime!).inMinutes
        : 0;
    final percentage =
        totalPoints! > 0 ? ((score / totalPoints!) * 100).round() : 0;

    // Convert user answers to QuestionResponse format
    final responses = userAnswers.entries.map((entry) {
      final questionStartTime = quizStartTime;
      final answerTime = answerTimes[entry.key];
      final timeSpent = questionStartTime != null && answerTime != null
          ? answerTime.difference(questionStartTime).inMinutes
          : 0;

      return QuestionResponse(
        questionId: entry.key,
        selectedAnswer: entry.value.toString(),
        isCorrect: entry.value ==
            (questions!
                    .firstWhere((q) => q.id == entry.key)
                    .correctAnswer
                    .toString()
                    .toLowerCase() ==
                'true'),
        timeSpent: timeSpent,
      );
    }).toList();

    try {
      await TaskService().submitTaskAttempt(quiz!.id, user.uid, responses);
      debugPrint("Quiz results saved to Firestore!");
    } catch (e) {
      debugPrint("Error saving quiz results: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error saving results: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
