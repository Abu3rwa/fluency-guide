import 'package:englishfluencyguide/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'dart:math';
import 'dart:convert';
// import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import '../../../../../../migrate/l10n/app_localizations.dart';

// Assume you have these models:
import '../../../../../../migrate/lib/models/quiz_model.dart'; // Your Quiz data structure
import '../../../../../../migrate/lib/models/task_model.dart'; // Your TaskQuestion model
import 'package:englishfluencyguide/providers/user_provider.dart';
import 'package:englishfluencyguide/services/task_service.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:englishfluencyguide/theme/theme_provider.dart';
import 'package:englishfluencyguide/providers/recent_activity_provider.dart';
import 'package:englishfluencyguide/models/recent_activity_model.dart';
import 'package:englishfluencyguide/routes/app_routes.dart';
import 'fill_in_blanks/fill_in_blank_question_card.dart';
import 'fill_in_blanks/fill_in_blank_question_with_blanks.dart';
import 'fill_in_blanks/fill_in_blank_option_list.dart';
import 'fill_in_blanks/fill_in_blank_blank_space.dart';
import 'fill_in_blanks/fill_in_blank_feedback_section.dart';
import 'fill_in_blanks/fill_in_blank_explanation_section.dart';
import 'fill_in_blanks/fill_in_blank_navigation_section.dart';
import 'fill_in_blanks/fill_in_blank_progress_section.dart';
import 'fill_in_blanks/fill_in_blank_timer_section.dart';
import 'package:englishfluencyguide/providers/audio_provider.dart';

class FillInTheBlankQuizScreen extends StatefulWidget {
  final String taskId;
  const FillInTheBlankQuizScreen({Key? key, required this.taskId})
      : super(key: key);

  @override
  State<FillInTheBlankQuizScreen> createState() =>
      _FillInTheBlankQuizScreenState();
}

// Helper to construct from navigation arguments
FillInTheBlankQuizScreen fillInTheBlankQuizScreenFromRoute(
    BuildContext context) {
  final args = ModalRoute.of(context)?.settings.arguments;
  if (args is String) {
    return FillInTheBlankQuizScreen(taskId: args);
  } else {
    throw Exception('No Task ID provided to FillInTheBlankQuizScreen');
  }
}

class _FillInTheBlankQuizScreenState extends State<FillInTheBlankQuizScreen>
    with TickerProviderStateMixin {
  Task? quiz;
  bool isLoading = true;
  String? errorMessage;
  List<TaskQuestion>? questions;
  int timeLimitSeconds = 0;
  int attemptsAllowed = 1;
  int pointsPerQuestion = 1;
  int totalPoints = 0;
  bool randomizeQuestions = false;
  bool showFeedback = true;
  bool showCorrectAnswers = true;
  bool allowReview = true;
  String difficulty = 'medium';
  List<String> tags = [];

  int currentQuestionIndex = 0;
  Map<String, List<String>> userAnswers =
      {}; // Store list of answers for blanks
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
  List<bool>? blanksCorrectness; // Track correctness of each blank

  // Drag and drop state
  List<String> availableOptions = [];
  List<String> usedOptions = [];
  String? draggedOption;

  // Animation controllers
  late AnimationController _fadeController;
  late AnimationController _scaleController;
  late AnimationController _progressController;
  late AnimationController _dragController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _progressAnimation;
  late Animation<double> _dragAnimation;

  // Sound and haptic feedback
  bool soundEnabled = true;
  bool hapticEnabled = true;

  // Periodic progress saving
  Timer? _saveProgressTimer;

  // New progress update timer
  Timer? _progressUpdateTimer;

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
          questions = quiz!.questions;
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
    _dragController = AnimationController(
      duration: const Duration(milliseconds: 200),
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
    _dragAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _dragController, curve: Curves.easeInOut),
    );

    _fadeController.forward();
    _scaleController.forward();
  }

  void _restoreOrStartQuiz() async {
    // Parse quiz data first to ensure questions are available
    _parseQuizData();

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
      await _clearLocalProgress();
    }

    _startNewQuiz();
  }

  void _showResumeDialog(Map<String, dynamic> progress) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.resumeQuizTitle),
        content: Text(AppLocalizations.of(context)!.resumeQuizContent),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _startNewQuiz();
              _clearLocalProgress();
            },
            child: Text(AppLocalizations.of(context)!.startOver),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _restoreProgress(progress);
            },
            child: Text(AppLocalizations.of(context)!.resume),
          ),
        ],
      ),
    );
  }

  void _startNewQuiz() {
    setState(() {
      _parseQuizData();
      _startQuiz();
      _initializeCurrentQuestion();
    });

    // Create recent activity when quiz starts
    _createQuizActivity(ActivityStatus.inProgress);
  }

  void _createQuizActivity(ActivityStatus status) {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);

    if (userProvider.currentUser != null) {
      activityProvider.createActivityFromTaskAttempt(
        widget.taskId,
        userProvider.currentUser!.uid,
        AppRoutes.fillInTheBlank,
        quiz!.title,
        quiz!.lessonId,
        quiz!.courseId,
        status,
        progress: 0.0,
        totalQuestions: questions!.length,
      );
    }
  }

  void _updateQuizActivityProgress() {
    // Cancel previous timer
    _progressUpdateTimer?.cancel();

    // Set new timer to debounce updates
    _progressUpdateTimer = Timer(const Duration(milliseconds: 500), () {
      _performProgressUpdate();
    });
  }

  void _performProgressUpdate() {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);

    if (userProvider.currentUser != null) {
      // Calculate progress based on answered questions
      final answeredCount =
          isAnswered.values.where((answered) => answered).length;
      final progress =
          questions!.isNotEmpty ? answeredCount / questions!.length : 0.0;

      debugPrint('=== PROGRESS UPDATE DEBUG ===');
      debugPrint('Total questions: ${questions!.length}');
      debugPrint('Answered questions: $answeredCount');
      debugPrint(
          'Progress calculation: $answeredCount / ${questions!.length} = $progress');
      debugPrint('isAnswered map: $isAnswered');
      debugPrint('userAnswers map: $userAnswers');
      debugPrint('Current question index: $currentQuestionIndex');

      // Find the activity in both recent and incomplete activities
      final allActivities = [
        ...activityProvider.recentActivities,
        ...activityProvider.incompleteActivities
      ];
      debugPrint('Total activities found: ${allActivities.length}');
      debugPrint(
          'Recent activities: ${activityProvider.recentActivities.length}');
      debugPrint(
          'Incomplete activities: ${activityProvider.incompleteActivities.length}');

      try {
        final activity = allActivities.firstWhere(
          (a) =>
              a.targetId == AppRoutes.fillInTheBlank &&
              a.type == ActivityType.task,
        );

        debugPrint('Found activity: ${activity.id}, updating progress');
        debugPrint('Activity current progress: ${activity.progress}');
        debugPrint('Activity status: ${activity.statusText}');

        activityProvider.updateActivityProgress(
          activity.id,
          progress,
          progress >= 1.0
              ? ActivityStatus.completed
              : ActivityStatus.inProgress,
        );
        debugPrint('Activity progress update called successfully');
      } catch (e) {
        // Activity not found, create a new one
        debugPrint('Activity not found, creating new one. Error: $e');
        _createQuizActivity(ActivityStatus.inProgress);
      }
      debugPrint('=== END PROGRESS UPDATE DEBUG ===');
    } else {
      debugPrint('ERROR: User is null, cannot update activity');
    }
  }

  void _restoreProgress(Map<String, dynamic> progress) {
    setState(() {
      _parseQuizData();

      // Validate currentQuestionIndex is within bounds
      final savedIndex = progress['currentQuestionIndex'] as int? ?? 0;
      currentQuestionIndex = savedIndex < questions!.length ? savedIndex : 0;

      // Restore user answers with validation
      try {
        final answersJson = jsonDecode(progress['userAnswers']);
        userAnswers = Map<String, List<String>>.from(answersJson
            .map((key, value) => MapEntry(key, List<String>.from(value))));
      } catch (e) {
        debugPrint('Error restoring user answers: $e');
        userAnswers = {};
      }

      // Restore isAnswered with validation
      try {
        isAnswered = Map<String, bool>.from(jsonDecode(progress['isAnswered']));
      } catch (e) {
        debugPrint('Error restoring isAnswered: $e');
        isAnswered = {};
      }

      // Restore answerTimes with validation
      try {
        answerTimes =
            Map<String, String>.from(jsonDecode(progress['answerTimes']))
                .map((key, value) => MapEntry(key, DateTime.parse(value)));
      } catch (e) {
        debugPrint('Error restoring answerTimes: $e');
        answerTimes = {};
      }

      score = progress['score'] as int? ?? 0;
      attempts = progress['attempts'] as int? ?? 0;

      try {
        quizStartTime = DateTime.parse(progress['quizStartTime']);
      } catch (e) {
        debugPrint('Error parsing quizStartTime: $e');
        quizStartTime = DateTime.now();
      }

      if (timeLimitSeconds > 0) {
        secondsRemaining =
            progress['secondsRemaining'] as int? ?? timeLimitSeconds;
        timer = Timer.periodic(const Duration(seconds: 1), _onTick);
      }

      _saveProgressTimer =
          Timer.periodic(const Duration(seconds: 15), (_) => _saveProgress());

      _initializeCurrentQuestion();
    });
    _updateProgress();
    _fadeController.forward();

    // Create activity for restored quiz
    _createQuizActivity(ActivityStatus.inProgress);
  }

  void _initializeCurrentQuestion() {
    if (currentQuestionIndex < questions!.length && questions!.isNotEmpty) {
      final q = questions![currentQuestionIndex];
      // For fill-in-the-blank, generate options from blanks' answers
      if (q.blanks.isNotEmpty) {
        // Create a list with all correct answers plus some distractors
        availableOptions = List<String>.from(q.blanks.map((b) => b.answer));

        // Add some distractors if we have options available
        if (q.options != null && q.options!.isNotEmpty) {
          final distractors = q.options!
              .where((option) => !q.blanks.any((blank) =>
                  blank.answer.toLowerCase() == option.toLowerCase()))
              .toList();

          // Add up to 2 distractors to make it more challenging
          if (distractors.isNotEmpty) {
            distractors.shuffle();
            availableOptions.addAll(distractors.take(2));
          }
        }
      } else {
        availableOptions = List<String>.from(q.options ?? []);
      }

      // Remove already used options
      final currentAnswers = userAnswers[q.id] ?? [];
      usedOptions = List<String>.from(currentAnswers);
      for (final used in usedOptions) {
        availableOptions.remove(used);
      }

      // Ensure we have enough options by duplicating some if needed
      if (availableOptions.length < q.blanks.length) {
        final needed = q.blanks.length - availableOptions.length;
        final correctAnswers = q.blanks.map((b) => b.answer).toList();
        for (int i = 0; i < needed; i++) {
          if (correctAnswers.isNotEmpty) {
            availableOptions.add(correctAnswers[i % correctAnswers.length]);
          }
        }
      }

      availableOptions.shuffle();
    } else {
      currentQuestionIndex = 0;
      availableOptions = [];
      usedOptions = [];
    }
  }

  Future<void> _saveProgress() async {
    if (quizCompleted) return;

    final prefs = await SharedPreferences.getInstance();
    final progress = {
      'currentQuestionIndex': currentQuestionIndex,
      'userAnswers': jsonEncode(userAnswers.map((k, v) => MapEntry(k, v))),
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
    questions = List<TaskQuestion>.from(quiz!.questions);
    // Calculate totalPoints as the total number of blanks
    totalPoints = questions!
        .fold(0, (sum, q) => sum + (q.blanks.isNotEmpty ? q.blanks.length : 1));
    timeLimitSeconds = (quiz!.timeLimit ?? 0) * 60;
    attemptsAllowed = quiz!.attemptsAllowed ?? 1;
    pointsPerQuestion = 1; // Each blank is worth 1 point
    randomizeQuestions = quiz!.randomizeQuestions ?? false;
    showFeedback = quiz!.showFeedback ?? false;
    showCorrectAnswers = quiz!.showCorrectAnswers ?? false;
    allowReview = quiz!.allowReview ?? false;
    difficulty = quiz!.difficulty;
    tags = quiz!.tags;

    if (randomizeQuestions) {
      questions!.shuffle();
    }
  }

  void _startQuiz() {
    quizStartTime = DateTime.now();
    if (timeLimitSeconds > 0) {
      secondsRemaining = timeLimitSeconds;
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
      SnackBar(
        content: Text(AppLocalizations.of(context)!.thirtySecondsWarning),
        backgroundColor: Colors.orange,
        duration: const Duration(seconds: 2),
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

      // Stop clock ticking sound
      final audioProvider = context.read<AudioProvider>();
      audioProvider.stopClockTicking();

      debugPrint('Quiz paused - all timers and updates stopped');
    } else {
      // Resume timers when unpaused
      if (timeLimitSeconds > 0 && secondsRemaining > 0) {
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
    _dragController.dispose();
    super.dispose();
  }

  void _onOptionDragStart(String option) {
    setState(() {
      draggedOption = option;
    });
    _dragController.forward();

    if (hapticEnabled) {
      HapticFeedback.selectionClick();
    }
  }

  void _onOptionDragEnd() {
    setState(() {
      draggedOption = null;
    });
    _dragController.reverse();
  }

  void _onBlankAccept(String option, int blankIndex) {
    final q = questions![currentQuestionIndex];
    if (hapticEnabled) {
      HapticFeedback.mediumImpact();
    }
    setState(() {
      if (!userAnswers.containsKey(q.id)) {
        userAnswers[q.id] = List<String>.filled(q.blanks.length, '');
      }
      userAnswers[q.id]![blankIndex] = option;
      availableOptions.remove(option);
      usedOptions.add(option);

      // Ensure we have enough options for remaining blanks
      _ensureEnoughOptions();

      final allFilled = userAnswers[q.id]!.every((answer) => answer.isNotEmpty);
      if (allFilled) {
        isAnswered[q.id] = true;
        answerTimes[q.id] = DateTime.now();
        _checkAnswers();
      }
      _updateProgress();
      _updateQuizActivityProgress();
    });
    _saveProgress();
  }

  void _onBlankRemove(int blankIndex) {
    final q = questions![currentQuestionIndex];
    if (userAnswers[q.id] != null &&
        userAnswers[q.id]![blankIndex].isNotEmpty) {
      final removedOption = userAnswers[q.id]![blankIndex];
      setState(() {
        userAnswers[q.id]![blankIndex] = '';
        availableOptions.add(removedOption);
        usedOptions.remove(removedOption);
        isAnswered[q.id] = false;
        blanksCorrectness = null;
        _updateProgress();
        _updateQuizActivityProgress();
      });
      if (hapticEnabled) {
        HapticFeedback.lightImpact();
      }
    }
  }

  void _checkAnswers() {
    final q = questions![currentQuestionIndex];
    final userAnswerList = userAnswers[q.id] ?? [];
    blanksCorrectness = [];
    bool allCorrect = true;

    for (int i = 0; i < userAnswerList.length; i++) {
      if (i < q.blanks.length) {
        final isCorrect = userAnswerList[i].trim().toLowerCase() ==
            q.blanks[i].answer.trim().toLowerCase();
        blanksCorrectness!.add(isCorrect);
        if (!isCorrect) allCorrect = false;
      } else {
        blanksCorrectness!.add(false);
        allCorrect = false;
      }
    }

    // Play appropriate audio sound
    final audioProvider = context.read<AudioProvider>();
    if (allCorrect && blanksCorrectness!.isNotEmpty) {
      audioProvider.playCorrect();
    } else if (blanksCorrectness!.isNotEmpty) {
      audioProvider.playIncorrect();
    }
  }

  int _getBlankCount(String text) {
    // Handle different underscore patterns: __, ___, _____, ______
    // This regex matches 2 or more consecutive underscores
    final underscorePattern = RegExp(r'_{2,}');
    return underscorePattern.allMatches(text).length;
  }

  void _nextQuestion() {
    _fadeController.reset();
    setState(() {
      blanksCorrectness = null;
      currentQuestionIndex++;
      _initializeCurrentQuestion();
    });
    _fadeController.forward();
    _updateProgress();
  }

  void _previousQuestion() {
    if (currentQuestionIndex > 0) {
      _fadeController.reset();
      setState(() {
        blanksCorrectness = null;
        currentQuestionIndex--;
        _initializeCurrentQuestion();
      });
      _fadeController.forward();
    }
  }

  void _updateProgress() {
    // Calculate progress based on answered questions, not current question index
    if (questions == null) return;
    final answeredCount =
        isAnswered.values.where((answered) => answered).length;
    final progress =
        questions!.isNotEmpty ? answeredCount / questions!.length : 0.0;

    _progressController.animateTo(progress);
  }

  void _submitQuiz() async {
    if (quizCompleted) return; // Prevent double submit
    timer?.cancel();
    _saveProgressTimer?.cancel();

    score = 0;
    int totalBlanks = 0;

    // Calculate score: 1 point per correct blank
    for (final q in questions!) {
      final userAnswerList = userAnswers[q.id] ?? [];
      final blanks = q.blanks;
      totalBlanks += blanks.isNotEmpty ? blanks.length : 1;
      for (int i = 0; i < blanks.length; i++) {
        if (i < userAnswerList.length &&
            userAnswerList[i].trim().toLowerCase() ==
                blanks[i].answer.trim().toLowerCase()) {
          score++;
        }
      }
      // If no blanks, treat as single blank
      if (blanks.isEmpty &&
          userAnswerList.isNotEmpty &&
          q.correctAnswer != null) {
        if (userAnswerList[0].trim().toLowerCase() ==
            q.correctAnswer.toString().trim().toLowerCase()) {
          score++;
        }
      }
    }
    totalPoints = totalBlanks;

    // Debug print total score
    debugPrint(
        'Total score: $score / $totalPoints (${questions!.length} questions)');

    // Play congratulations sound
    final audioProvider = context.read<AudioProvider>();
    audioProvider.playCongratulations();

    // Update activity status based on final result
    _updateQuizActivityOnCompletion();

    await _saveResultsToFirestore();
    await _clearLocalProgress();

    setState(() {
      quizCompleted = true;
      attempts++;
    });

    // Refresh user data after completing quiz
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    userProvider.refreshUserData();

    if (hapticEnabled) {
      HapticFeedback.mediumImpact();
    }

    await _onQuizCompleted();
  }

  void _updateQuizActivityOnCompletion() {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final activityProvider =
        Provider.of<RecentActivityProvider>(context, listen: false);

    if (userProvider.currentUser != null) {
      final passed = score >= (quiz!.passingScore ?? 0);
      final timeSpent = quizStartTime != null
          ? DateTime.now().difference(quizStartTime!).inMinutes
          : 0;

      // Find the activity and mark it as completed
      final allActivities = [
        ...activityProvider.recentActivities,
        ...activityProvider.incompleteActivities
      ];
      try {
        final activity = allActivities.firstWhere(
          (a) => a.targetId == quiz!.id && a.type == ActivityType.task,
        );

        activityProvider.markActivityCompleted(
          activity.id,
          score: score,
          timeSpent: timeSpent,
        );
      } catch (e) {
        // Activity not found, create a completed one
        activityProvider.createActivityFromTaskAttempt(
          quiz!.id,
          userProvider.currentUser!.uid,
          quiz!.id,
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
      blanksCorrectness = null;

      if (randomizeQuestions) {
        questions!.shuffle();
      }
    });

    _progressController.reset();
    _fadeController.reset();
    _fadeController.forward();
    _startQuiz();
    _initializeCurrentQuestion();
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
            Text('Total points: $totalPoints'),
            Text(
                'Calculated points per question: ${totalPoints / questions!.length}'),
            Text('Passing score: ${quiz!.passingScore ?? 0}'),
            Text('Attempts allowed: $attemptsAllowed'),
            if (timeLimitSeconds > 0)
              Text('Time limit: ${timeLimitSeconds ~/ 60} minutes'),
            if (tags.isNotEmpty) Text('Tags: ${tags.join(', ')}'),
            const SizedBox(height: 8),
            Text(AppLocalizations.of(context)!.quizConfiguration,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            Text('Quiz totalPoints: ${quiz!.totalPoints}'),
            Text('Quiz pointsPerQuestion: ${quiz!.pointsPerQuestion}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(AppLocalizations.of(context)!.close),
          ),
        ],
      ),
    );
  }

  void _showSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.settings),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SwitchListTile(
              title: Text(AppLocalizations.of(context)!.soundEffects),
              value: soundEnabled,
              onChanged: (value) => setState(() => soundEnabled = value),
            ),
            SwitchListTile(
              title: Text(AppLocalizations.of(context)!.hapticFeedback),
              value: hapticEnabled,
              onChanged: (value) => setState(() => hapticEnabled = value),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(AppLocalizations.of(context)!.close),
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
      return _buildResultsScreen();
    }

    if (isPaused) {
      return _buildPauseScreen();
    }

    // Validate that questions are available and currentQuestionIndex is valid
    if (questions!.isEmpty || currentQuestionIndex >= questions!.length) {
      return Scaffold(
        key: ValueKey('fill_in_blank_quiz_${quiz!.id}'),
        appBar: AppBar(
          title: Text(quiz!.title),
          elevation: 0,
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text(
                'No questions available',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text(
                'This quiz does not contain any questions.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    final q = questions![currentQuestionIndex];
    final progress = (currentQuestionIndex + 1) / questions!.length;
    final isCurrentAnswered = isAnswered[q.id] ?? false;

    return Scaffold(
      key: ValueKey('fill_in_blank_quiz_${quiz!.id}'),
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
          if (timeLimitSeconds > 0)
            IconButton(
              onPressed: _togglePause,
              icon: Icon(isPaused ? Icons.play_arrow : Icons.pause),
            ),
          if (timeLimitSeconds > 0)
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
                  // Progress Section
                  _buildProgressSection(),

                  // Question Card with Animation
                  Expanded(
                    child: AnimatedBuilder(
                      animation: _scaleAnimation,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _scaleAnimation.value,
                          child: _buildQuestionCard(q),
                        );
                      },
                    ),
                  ),

                  // Options Section
                  _buildOptionsSection(),

                  // Navigation Section
                  _buildNavigationSection(q),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProgressSection() {
    return FillInBlankProgressSection(
      currentQuestionIndex: currentQuestionIndex,
      totalQuestions: questions!.length,
    );
  }

  Widget _buildTimerSection() {
    return FillInBlankTimerSection(
      remainingSeconds: secondsRemaining,
      onTimeUp: _submitQuiz,
    );
  }

  Widget _buildNavigationSection(TaskQuestion q) {
    final isCurrentAnswered = isAnswered[q.id] ?? false;
    final isLast = currentQuestionIndex == questions!.length - 1;
    return FillInBlankNavigationSection(
      currentQuestionIndex: currentQuestionIndex,
      totalQuestions: questions!.length,
      onNext: isLast ? _submitQuiz : _nextQuestion,
      onPrevious: _previousQuestion,
      isLastQuestion: isLast,
      isAnswered: isCurrentAnswered,
    );
  }

  Widget _buildQuestionCard(TaskQuestion q) {
    return FillInBlankQuestionCard(
      question: q,
      showFeedback: showFeedback,
      blanksCorrectness: blanksCorrectness,
      isAnswered: isAnswered[q.id] == true,
      questionWithBlanks: FillInBlankQuestionWithBlanks(
        question: q,
        userAnswers: userAnswers[q.id] ?? List.filled(q.blanks.length, ''),
        blankBuilder: (blankIndex) {
          final currentAnswer = userAnswers[q.id] != null &&
                  blankIndex < userAnswers[q.id]!.length
              ? userAnswers[q.id]![blankIndex]
              : '';
          Color? blankColor;
          if (blanksCorrectness != null &&
              blankIndex < blanksCorrectness!.length) {
            blankColor =
                blanksCorrectness![blankIndex] ? Colors.green : Colors.red;
          }
          return DragTarget<String>(
            onAccept: (option) => _onBlankAccept(option, blankIndex),
            builder: (context, candidateData, rejectedData) {
              final isHovering = candidateData.isNotEmpty;
              return FillInBlankBlankSpace(
                currentAnswer: currentAnswer,
                blankColor: blankColor,
                isHovering: isHovering,
                onRemove: currentAnswer.isNotEmpty
                    ? () => _onBlankRemove(blankIndex)
                    : null,
              );
            },
          );
        },
      ),
      feedbackSection: showFeedback && blanksCorrectness != null
          ? FillInBlankFeedbackSection(blanksCorrectness: blanksCorrectness!)
          : null,
      explanationSection: isAnswered[q.id] == true && q.explanation.isNotEmpty
          ? FillInBlankExplanationSection(explanation: q.explanation)
          : null,
    );
  }

  Widget _buildOptionsSection() {
    return FillInBlankOptionList(
      availableOptions: availableOptions,
      draggedOption: draggedOption,
      dragAnimation: _dragAnimation,
      onDragStart: _onOptionDragStart,
      onDragEnd: _onOptionDragEnd,
    );
  }

  Widget _buildPauseScreen() {
    return Scaffold(
      key: ValueKey('fill_in_blank_pause_${quiz!.id}'),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).primaryColor.withOpacity(0.1),
              Theme.of(context).scaffoldBackgroundColor,
            ],
          ),
        ),
        child: Center(
          child: Card(
            elevation: 12,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            child: Padding(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.pause_circle_filled,
                    size: 80,
                    color: Theme.of(context).primaryColor,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Quiz Paused',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Take your time. Tap resume when ready.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _togglePause,
                    icon: const Icon(Icons.play_arrow),
                    label: Text(AppLocalizations.of(context)!.resumeQuizTitle),
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
      ),
    );
  }

  Widget _buildResultsScreen() {
    final percentage =
        totalPoints > 0 ? (score / totalPoints * 100).round() : 0;
    final passed = score >= (quiz!.passingScore ?? 0);
    final theme = Theme.of(context);

    // Determine color based on percentage
    Color resultColor;
    String resultTitle;
    IconData resultIcon;

    if (percentage >= 80) {
      resultColor = Colors.green;
      resultTitle = 'Excellent!';
      resultIcon = Icons.celebration;
    } else if (percentage >= 60) {
      resultColor = Colors.orange;
      resultTitle = 'Good Job!';
      resultIcon = Icons.thumb_up;
    } else if (percentage >= 40) {
      resultColor = Colors.orange;
      resultTitle = 'Keep Trying!';
      resultIcon = Icons.info;
    } else {
      resultColor = Colors.red;
      resultTitle = 'Need More Practice';
      resultIcon = Icons.school;
    }

    return Scaffold(
      key: ValueKey('fill_in_blank_results_${quiz!.id}'),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              resultColor
                  .withOpacity(theme.brightness == Brightness.dark ? 0.2 : 0.1),
              theme.scaffoldBackgroundColor,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Expanded(
                  child: Center(
                    child: Card(
                      elevation: 12,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Results Icon
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 500),
                              child: Icon(
                                resultIcon,
                                size: 100,
                                color: resultColor,
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Results Title
                            Text(
                              resultTitle,
                              style: theme.textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: resultColor,
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Score Display
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: resultColor.withOpacity(
                                    theme.brightness == Brightness.dark
                                        ? 0.2
                                        : 0.1),
                                borderRadius: BorderRadius.circular(15),
                                border: Border.all(
                                  color: resultColor.withOpacity(0.5),
                                ),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    'Your Score',
                                    style:
                                        theme.textTheme.titleMedium?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '$score / $totalPoints',
                                    style:
                                        theme.textTheme.headlineLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: resultColor,
                                    ),
                                  ),
                                  Text(
                                    '$percentage%',
                                    style: theme.textTheme.titleLarge?.copyWith(
                                      color: resultColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),

                            // Quiz Stats
                            _buildQuizStats(),

                            const SizedBox(height: 24),

                            // Review Button (if allowed)
                            if (allowReview && !reviewMode)
                              ElevatedButton.icon(
                                onPressed: () =>
                                    setState(() => reviewMode = true),
                                icon: const Icon(Icons.visibility),
                                label: Text(AppLocalizations.of(context)!
                                    .reviewAnswers),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
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
                ),

                // Bottom Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _restartQuiz,
                        icon: const Icon(Icons.refresh),
                        label: Text(AppLocalizations.of(context)!.tryAgain),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.home),
                        label: Text(AppLocalizations.of(context)!.finish),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.surfaceVariant,
                          foregroundColor: theme.colorScheme.onSurfaceVariant,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuizStats() {
    final duration = quizStartTime != null
        ? DateTime.now().difference(quizStartTime!)
        : const Duration();

    final answeredQuestions =
        isAnswered.values.where((answered) => answered).length;

    return Column(
      children: [
        _buildStatRow(
            'Questions Answered', '$answeredQuestions / ${questions!.length}'),
        _buildStatRow('Time Taken', _formatDuration(duration)),
        _buildStatRow('Difficulty', difficulty.toUpperCase()),
        if (quiz!.passingScore != null)
          _buildStatRow('Passing Score', '${quiz!.passingScore}'),
      ],
    );
  }

  Widget _buildStatRow(String label, String value) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes}m ${seconds}s';
  }

  Future<void> _saveResultsToFirestore() async {
    try {
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final taskService = TaskService();

      final quizResult = {
        'userId': userProvider.currentUser?.uid,
        'quizId': quiz!.id,
        'score': score,
        'totalPoints': totalPoints,
        'percentage': (score / totalPoints * 100).round(),
        'completedAt': DateTime.now().toIso8601String(),
        'timeTaken': quizStartTime != null
            ? DateTime.now().difference(quizStartTime!).inMinutes
            : 0,
        'userAnswers': userAnswers,
        'difficulty': difficulty,
        'passed': score >= (quiz!.passingScore),
      };

      await taskService.saveQuizResult(quizResult);
      debugPrint('Quiz results saved successfully');
    } catch (e) {
      debugPrint('Error saving quiz results: $e');
    }
  }

  void _ensureEnoughOptions() {
    final q = questions![currentQuestionIndex];
    final neededOptions = q.blanks.length;

    if (availableOptions.length < neededOptions) {
      // Add more options by duplicating correct answers
      final correctAnswers = q.blanks.map((b) => b.answer).toList();
      final currentCount = availableOptions.length;

      for (int i = 0; i < neededOptions - currentCount; i++) {
        if (correctAnswers.isNotEmpty) {
          final optionToAdd = correctAnswers[i % correctAnswers.length];
          // Only add if it's not already in available options
          if (!availableOptions.contains(optionToAdd)) {
            availableOptions.add(optionToAdd);
          }
        }
      }

      // If still not enough, add some generic options
      if (availableOptions.length < neededOptions) {
        final genericOptions = ['word', 'answer', 'term', 'phrase'];
        for (int i = 0; i < neededOptions - availableOptions.length; i++) {
          if (i < genericOptions.length) {
            availableOptions.add(genericOptions[i]);
          }
        }
      }

      availableOptions.shuffle();
    }
  }

  Future<void> _onQuizCompleted() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final minutesSpent = quizStartTime != null
        ? DateTime.now().difference(quizStartTime!).inMinutes
        : 0;
    if (minutesSpent > 0) {
      await userProvider.updateTodayStudyMinutes(minutesSpent);
    }
  }
}
