import 'package:flutter/material.dart';
import 'package:englishfluencyguide/models/task_model.dart';
import 'package:provider/provider.dart';
import 'package:englishfluencyguide/providers/audio_provider.dart';
import 'package:englishfluencyguide/models/recent_activity_model.dart';
import 'multiple_choice_question_card.dart';
import 'multiple_choice_navigation_section.dart';
import 'multiple_choice_results_screen.dart';
import 'multiple_choice_timer_section.dart';
import 'multiple_choice_progress_section.dart';
import 'multiple_choice_feedback_section.dart';
import 'dart:async';
import 'package:englishfluencyguide/services/task_service.dart';
import 'package:englishfluencyguide/providers/user_provider.dart';
import 'package:englishfluencyguide/providers/recent_activity_provider.dart';

class MultipleChoiceScreen extends StatefulWidget {
  final String taskId;
  const MultipleChoiceScreen({Key? key, required this.taskId})
      : super(key: key);

  @override
  _MultipleChoiceScreenState createState() => _MultipleChoiceScreenState();
}

class _MultipleChoiceScreenState extends State<MultipleChoiceScreen>
    with SingleTickerProviderStateMixin {
  Task? quiz;
  bool isLoading = true;
  String? errorMessage;
  int _currentQuestionIndex = 0;
  Map<String, String> _userAnswers = {};
  bool _quizCompleted = false;
  int _remainingSeconds = 30;
  bool _showFeedback = false;
  bool _isCurrentCorrect = false;
  String _currentExplanation = '';
  List<TaskQuestion>? _questions;
  int? _totalQuestions;
  Timer? _timer;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _loadTask();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeIn,
    );
    // Only reset timer after questions are loaded
  }

  @override
  void dispose() {
    _timer?.cancel();
    _fadeController.dispose();

    // Stop clock ticking sound
    final audioProvider = context.read<AudioProvider>();
    audioProvider.stopClockTicking();

    super.dispose();
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
          _questions = quiz!.questions;
          _totalQuestions = _questions!.length;
        });
        _resetTimer();
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Error loading task: $e';
      });
    }
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _remainingSeconds = 30;
    });

    // Start clock ticking sound
    final audioProvider = context.read<AudioProvider>();
    audioProvider.startClockTicking();

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        timer.cancel();
        _onTimeUp();
      }
    });
  }

  void _onTimeUp() {
    if (_questions == null) return;
    final question = _questions![_currentQuestionIndex];
    final userAnswer = _userAnswers[question.id];
    final isCorrect = userAnswer == question.correctAnswer;

    // Stop clock ticking
    final audioProvider = context.read<AudioProvider>();
    audioProvider.stopClockTicking();

    setState(() {
      _showFeedback = true;
      _isCurrentCorrect = isCorrect;
      _currentExplanation = question.explanation ?? '';
    });
    _fadeController.forward(from: 0);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) _nextQuestion();
    });
  }

  void _answerQuestion(String questionId, String answer) {
    if (_questions == null) return;
    final question = _questions![_currentQuestionIndex];
    final isCorrect = answer == question.correctAnswer;

    // Stop clock ticking and play appropriate sound
    final audioProvider = context.read<AudioProvider>();
    audioProvider.stopClockTicking();

    if (isCorrect) {
      audioProvider.playCorrect();
    } else {
      audioProvider.playIncorrect();
    }

    setState(() {
      _userAnswers[questionId] = answer;
      _showFeedback = true;
      _isCurrentCorrect = isCorrect;
      _currentExplanation = question.explanation ?? '';
    });
    _fadeController.forward(from: 0);
    _timer?.cancel();
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) _nextQuestion();
    });
  }

  void _nextQuestion() {
    if (_questions == null || _totalQuestions == null) return;
    if (_currentQuestionIndex < _totalQuestions! - 1) {
      setState(() {
        _currentQuestionIndex++;
        _showFeedback = false;
      });
      _fadeController.reset();
      _resetTimer();
    } else {
      setState(() {
        _quizCompleted = true;
      });
      _timer?.cancel();

      // Create activity and refresh user data after completing quiz
      _createActivityAndRefresh();
    }
  }

  void _createActivityAndRefresh() async {
    final userProvider = context.read<UserProvider>();
    final activityProvider = context.read<RecentActivityProvider>();

    if (userProvider.currentUser != null && quiz != null) {
      final correctAnswers = _calculateCorrectAnswers();
      final passed =
          correctAnswers >= (_totalQuestions! * 0.6); // 60% passing threshold
      final timeSpentInSeconds = 30 - _remainingSeconds;
      final timeSpentInMinutes = (timeSpentInSeconds / 60).ceil();

      try {
        await activityProvider.createActivityFromTaskAttempt(
          quiz!.id,
          userProvider.currentUser!.uid,
          quiz!.id,
          quiz!.title,
          quiz!.lessonId ?? '',
          quiz!.courseId ?? '',
          passed ? ActivityStatus.completed : ActivityStatus.failed,
          progress: 1.0,
          score: correctAnswers,
          timeSpent: timeSpentInMinutes,
          totalQuestions: _totalQuestions!,
        );

        if (timeSpentInMinutes > 0) {
          await userProvider.updateTodayStudyMinutes(timeSpentInMinutes);
        }
      } catch (e) {
        print('Error creating activity: $e');
      }
    }

    // Refresh user data
    userProvider.refreshUserData();
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (quiz == null || _questions == null || _totalQuestions == null) {
      return Scaffold(
          body: Center(child: Text(errorMessage ?? 'Task not found')));
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(quiz!.title),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 400),
        child: _quizCompleted
            ? MultipleChoiceResultsScreen(
                correctAnswers: _calculateCorrectAnswers(),
                totalQuestions: _totalQuestions!,
              )
            : _buildQuizScreen(),
      ),
    );
  }

  Widget _buildQuizScreen() {
    if (_questions == null) return const SizedBox.shrink();
    final question = _questions![_currentQuestionIndex];
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MultipleChoiceTimerSection(
            remainingSeconds: _remainingSeconds,
          ),
          const SizedBox(height: 8),
          MultipleChoiceProgressSection(
            currentQuestionIndex: _currentQuestionIndex,
            totalQuestions: _totalQuestions!,
          ),
          const SizedBox(height: 16),
          MultipleChoiceNavigationSection(
            currentQuestionIndex: _currentQuestionIndex,
            totalQuestions: _totalQuestions!,
            isAnswered: _userAnswers.containsKey(question.id),
            onNext: _nextQuestion,
            isLastQuestion: _currentQuestionIndex == _totalQuestions! - 1,
          ),
          const SizedBox(height: 16),
          MultipleChoiceQuestionCard(
            question: question,
            selectedAnswer: _userAnswers[question.id],
            onAnswer: (answer) => _answerQuestion(question.id, answer),
          ),
          const SizedBox(height: 16),
          AnimatedBuilder(
            animation: _fadeAnimation,
            builder: (context, child) {
              return _showFeedback
                  ? FadeTransition(
                      opacity: _fadeAnimation,
                      child: MultipleChoiceFeedbackSection(
                        isCorrect: _isCurrentCorrect,
                        explanation: _currentExplanation,
                      ),
                    )
                  : const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }

  int _calculateCorrectAnswers() {
    if (_questions == null) return 0;
    int correctAnswers = 0;
    for (var question in _questions!) {
      if (_userAnswers[question.id] == question.correctAnswer) {
        correctAnswers++;
      }
    }
    return correctAnswers;
  }
}
