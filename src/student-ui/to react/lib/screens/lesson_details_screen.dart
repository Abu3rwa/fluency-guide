import 'package:englishfluencyguide/theme/app_theme.dart';
import 'package:englishfluencyguide/widgets/utils/constants.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'dart:math';
import '../../../../../migrate/lib/models/lesson_model.dart';
import '../providers/lesson_provider.dart';
import '../providers/module_provider.dart';
import '../routes/app_routes.dart';
import '../services/task_service.dart';
import '../../../../../migrate/lib/models/task_model.dart';
import '../providers/task_provider.dart';
import '../providers/user_provider.dart';
import '../providers/message_provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../l10n/app_localizations.dart';

class LessonDetailsScreen extends StatefulWidget {
  final String lessonId;
  final String moduleId;
  final String courseId;

  const LessonDetailsScreen({
    Key? key,
    required this.lessonId,
    required this.moduleId,
    required this.courseId,
  }) : super(key: key);

  @override
  State<LessonDetailsScreen> createState() => _LessonDetailsScreenState();
}

class _LessonDetailsScreenState extends State<LessonDetailsScreen>
    with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  String? _error;
  LessonModel? _lesson;
  final TaskService _taskService = TaskService();
  late Future<List<Task>> _tasksFuture;
  double _progress = 0.0;
  late AnimationController _entranceController;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _loadLesson();
    _loadTasks();
    _entranceController.forward();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    super.dispose();
  }

  Future<void> _loadLesson() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final lesson =
          await context.read<LessonProvider>().getLesson(widget.lessonId);

      final user =
          Provider.of<UserProvider>(context, listen: false).currentUser;
      final lessonProgress =
          user?.progress?['lessons']?[lesson!.id]?['progress'] ?? 0.0;
      _progress = lessonProgress;

      setState(() {
        _lesson = lesson;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load lesson: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _markLessonCompleted() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    if (userProvider.currentUser != null) {
      // Award 10 XP for completing the lesson
      await userProvider.addPoints(10);

      // Update lesson progress
      // (You might want to add more sophisticated progress tracking here)
      setState(() {
        _progress = 1.0;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Congratulations! You earned 10 XP.'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _loadTasks() {
    _tasksFuture = _taskService.getTasksByLessonId(widget.lessonId);
  }

  void _navigateToTask(Task task) {
    task.type.toLowerCase() == QuizTypes.trueFalse.toLowerCase()
        ? Navigator.pushNamed(
            context,
            AppRoutes.trueFalse,
            arguments: {
              'taskId': task.id,
            },
          )
        : Navigator.pushNamed(
            context,
            AppRoutes.fillInTheBlank,
            arguments: {
              'taskId': task.id,
            },
          );
  }

  Task _createFillInTheBlankTask() {
    // Create a proper task with the correct lesson and course IDs
    return Task(
      id: 'fillInTheBlank_${_lesson?.id ?? ''}',
      title: 'Fill in the Blank',
      instructions: 'Fill in the blank with the correct answer',
      type: 'fillInBlanks',
      timeLimit: 30,
      passingScore: 70,
      attemptsAllowed: 3,
      difficulty: "medium",
      tags: ['English', 'Grammar'],
      isPublished: true,
      showFeedback: true,
      randomizeQuestions: true,
      showCorrectAnswers: true,
      allowReview: true,
      pointsPerQuestion: 10,
      totalPoints: 30,
      questions: [
        TaskQuestion(
          id: '1',
          text: '_____ تاريخ زواجنا هو ',
          points: 10,
          explanation: 'يوم خاص يميز حبنا.',
          type: 'fillInTheBlank',
          options: ['12/4/2024', '10/3/2025', '11/5/2024', '9/6/2024'],
          correctAnswer: '12/4/2024',
        ),
        TaskQuestion(
          id: '2',
          text: 'أول مرة لمست يدك كانت في _____',
          points: 10,
          explanation: 'لحظة لا تُنسى في رحلتنا.',
          type: 'fillInTheBlank',
          options: ['10/3/2025', '12/4/2024', '11/2/2025', '9/1/2025'],
          correctAnswer: '10/3/2025',
        ),
        TaskQuestion(
          id: '3',
          text: '_____ماذا ستفعلين إذا قبلتك؟',
          points: 10,
          explanation: 'طريقة ممتعة لاستكشاف مشاعرنا!',
          type: 'fillInTheBlank',
          options: ['أبتسم وأقبل', 'أضحك وأخجل', 'أحتضنك بقوة', 'أقول أحبك'],
          correctAnswer: 'أبتسم وأقبل',
        ),
      ],
      lessonId: _lesson?.id ?? '',
      courseId: widget.courseId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      status: 'active',
      metadata: {},
    );
  }

  Widget _buildHeroSection() {
    final themeColor = Theme.of(context).primaryColor;
    return SliverAppBar(
      expandedHeight: 220,
      pinned: true,
      stretch: true,
      backgroundColor: themeColor,
      automaticallyImplyLeading: false,
      elevation: 0,
      flexibleSpace: LayoutBuilder(
        builder: (context, constraints) {
          final percent = ((constraints.maxHeight - kToolbarHeight) /
                  (220 - kToolbarHeight))
              .clamp(0.0, 1.0);
          return Stack(
            fit: StackFit.expand,
            children: [
              if (_lesson?.coverImageUrl.isNotEmpty ?? false)
                Positioned.fill(
                  child: Image.network(
                    _lesson!.coverImageUrl,
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    loadingBuilder: (context, child, progress) {
                      if (progress == null) return child;
                      return Container(
                        color: Colors.grey[200],
                        child: const Center(child: CircularProgressIndicator()),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.image_not_supported, size: 80),
                    ),
                  ),
                ),
              // Gradient overlay
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
              // Parallax title and progress
              Positioned(
                left: 24,
                right: 24,
                bottom: 32 + 32 * (1 - percent),
                child: Opacity(
                  opacity: max(0.7, percent),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 600),
                        curve: Curves.easeOut,
                        width: 180,
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: FractionallySizedBox(
                            widthFactor: _progress,
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          // _buildDifficultyChip(),
                          const SizedBox(width: 8),
                          _buildTimeEstimateChip(),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildSliverLessonInfo(),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTimeEstimateChip() {
    return Semantics(
      label: 'Estimated time',
      child: Chip(
        avatar: const Icon(Icons.access_time, size: 18, color: Colors.blueGrey),
        label: Text('${_lesson?.duration ?? 0} min'),
        backgroundColor: Colors.blueGrey.withOpacity(0.08),
      ),
    );
  }

  Widget _buildAnimatedSection({required Widget child, required int index}) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: _entranceController,
        curve: Interval(
          0.1 * index,
          (0.5 + 0.1 * index).clamp(0.0, 1.0),
          curve: Curves.easeOut,
        ),
      ),
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.08),
          end: Offset.zero,
        ).animate(CurvedAnimation(
          parent: _entranceController,
          curve: Interval(
            0.1 * index,
            (0.5 + 0.1 * index).clamp(0.0, 1.0),
            curve: Curves.easeOut,
          ),
        )),
        child: child,
      ),
    );
  }

  Widget _buildElevatedCard({required Widget child}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOut,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(18),
        boxShadow: Theme.of(context).brightness == Brightness.dark
            ? []
            : [AppTheme.boxShadow],
      ),
      child: child,
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: _buildElevatedCard(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                _error ?? AppLocalizations.of(context)!.lessonDetailsError,
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(color: Colors.red),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _loadLesson,
                icon: const Icon(Icons.refresh),
                label: Text(AppLocalizations.of(context)!.retry),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 24),
          Text(AppLocalizations.of(context)!.loadingLesson,
              style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: _buildLoadingState(),
      );
    }
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(
            title: Text(AppLocalizations.of(context)!.lessonDetailsError)),
        body: _buildErrorState(),
      );
    }
    if (_lesson == null) {
      return Scaffold(
          body: Center(
              child: Text(AppLocalizations.of(context)!.lessonNotFound)));
    }
    final themeColor = _getThemeColor();
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(_lesson?.title ?? ''),
        backgroundColor: Theme.of(context).colorScheme.primary,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(
              Icons.more_vert,
              color: Colors.white,
              size: 30,
            ),
            onSelected: (value) {
              if (value == 'content') {
                showModalBottomSheet(
                  backgroundColor: Theme.of(context).colorScheme.surface,
                  context: context,
                  isScrollControlled: true,
                  shape: const RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  builder: (context) => DraggableScrollableSheet(
                    expand: false,
                    initialChildSize: 0.6,
                    minChildSize: 0.3,
                    maxChildSize: 0.95,
                    builder: (context, scrollController) =>
                        SingleChildScrollView(
                      controller: scrollController,
                      padding: const EdgeInsets.all(24),
                      child: _buildContentSection(),
                    ),
                  ),
                );
              } else if (value == 'objectives') {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  shape: const RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  builder: (context) => DraggableScrollableSheet(
                    expand: false,
                    initialChildSize: 0.5,
                    minChildSize: 0.3,
                    maxChildSize: 0.95,
                    builder: (context, scrollController) =>
                        SingleChildScrollView(
                      controller: scrollController,
                      padding: const EdgeInsets.all(24),
                      child: _buildObjectivesSection(),
                    ),
                  ),
                );
              } else if (value == 'skills') {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  shape: const RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  builder: (context) => DraggableScrollableSheet(
                    expand: false,
                    initialChildSize: 0.5,
                    minChildSize: 0.3,
                    maxChildSize: 0.95,
                    builder: (context, scrollController) =>
                        SingleChildScrollView(
                      controller: scrollController,
                      padding: const EdgeInsets.all(24),
                      child: _buildSkillsSection(),
                    ),
                  ),
                );
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'content',
                child: ListTile(
                  leading: const Icon(Icons.menu_book_outlined),
                  title: Text(AppLocalizations.of(context)!.content),
                ),
              ),
              PopupMenuItem(
                value: 'objectives',
                child: ListTile(
                  leading: const Icon(Icons.flag_outlined),
                  title: Text(AppLocalizations.of(context)!.learningObjectives),
                ),
              ),
              PopupMenuItem(
                value: 'skills',
                child: ListTile(
                  leading: const Icon(Icons.star_outline),
                  title: Text(AppLocalizations.of(context)!.skillsYoullLearn),
                ),
              ),
            ],
          ),
        ],
      ),
      floatingActionButton: _buildAskButton(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      body: CustomScrollView(
        slivers: [
          _buildHeroSection(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),
                  if (_lesson!.resources.isNotEmpty)
                    _buildAnimatedSection(
                      child:
                          _buildElevatedCard(child: _buildResourcesSection()),
                      index: 3,
                    ),
                  const SizedBox(height: 16),
                  if (_lesson!.assessment.isNotEmpty)
                    _buildAnimatedSection(
                      child:
                          _buildElevatedCard(child: _buildAssessmentSection()),
                      index: 4,
                    ),
                  const SizedBox(height: 16),
                  if (_lesson!.quizId.isNotEmpty)
                    _buildAnimatedSection(
                      child: _buildElevatedCard(child: _buildQuizSection()),
                      index: 5,
                    ),
                  const SizedBox(height: 24),
                  Text(
                    AppLocalizations.of(context)!.tasks,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: themeColor,
                        ),
                  ),
                  const SizedBox(height: 16),
                  FutureBuilder<List<Task>>(
                    future: _tasksFuture,
                    builder: (context, snapshot) {
                      print('snapshot: ${snapshot.data}');
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (snapshot.hasError) {
                        return Center(
                          child: Text(
                            AppLocalizations.of(context)!
                                .errorLoadingTasks(snapshot.error.toString()),
                            style: const TextStyle(color: Colors.red),
                          ),
                        );
                      }
                      final tasks = snapshot.data ?? [];
                      if (tasks.isEmpty) {
                        return _buildElevatedCard(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Center(
                              child: Text(
                                AppLocalizations.of(context)!.noTasksAvailable,
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                          ),
                        );
                      }
                      return ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: tasks.length,
                        itemBuilder: (context, index) {
                          final task = tasks[index];
                          return _buildAnimatedSection(
                            index: 7 + index,
                            child: _buildElevatedCard(
                              child: ListTile(
                                title: Text(
                                  task.title,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 4),
                                    Text(
                                      task.instructions,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.timer,
                                          size: 16,
                                          color: themeColor,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          AppLocalizations.of(context)!
                                              .minutes(task.timeLimit),
                                          style: TextStyle(
                                            color: themeColor,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Icon(
                                          Icons.assignment,
                                          size: 16,
                                          color: themeColor,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          AppLocalizations.of(context)!
                                              .questions(task.questions.length),
                                          style: TextStyle(
                                            color: themeColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                trailing: const Icon(Icons.arrow_forward_ios),
                                onTap: () => _navigateToTask(task),
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  _buildAnimatedSection(
                    index: 8,
                    child: Center(
                      child: ElevatedButton.icon(
                        onPressed: _progress < 1.0 ? _markLessonCompleted : null,
                        icon: const Icon(Icons.check_circle),
                        label: Text(_progress < 1.0
                            ? 'Complete Lesson'
                            : 'Lesson Completed'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24,
                              vertical: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Existing content section widgets below (unchanged, but now used in new layout) ---
  Widget _buildContentSection() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(AppLocalizations.of(context)!.content,
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          Text(_lesson!.content),
        ],
      ),
    );
  }

  Widget _buildObjectivesSection() {
    if (_lesson!.objectives.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppLocalizations.of(context)!.learningObjectives,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _lesson!.objectives.length,
            itemBuilder: (context, index) {
              return ListTile(
                leading: const Icon(Icons.check_circle_outline),
                title: Text(_lesson!.objectives[index].toString()),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSkillsSection() {
    if (_lesson!.skills.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppLocalizations.of(context)!.skillsYoullLearn,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _lesson!.skills.split(',').map((skill) {
              return Chip(
                label: Text(skill.trim()),
                backgroundColor:
                    Theme.of(context).primaryColor.withOpacity(0.1),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildResourcesSection() {
    if (_lesson!.resources.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(AppLocalizations.of(context)!.resources,
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _lesson!.resources.length,
            itemBuilder: (context, index) {
              final resource = _lesson!.resources[index];
              return ListTile(
                leading: const Icon(Icons.attachment),
                title: Text(resource['title'] ??
                    AppLocalizations.of(context)!.resource(index + 1)),
                subtitle: Text(resource['description'] ?? ''),
                trailing: const Icon(Icons.download),
                onTap: () {
                  // TODO: Handle resource download
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAssessmentSection() {
    if (_lesson!.assessment.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(AppLocalizations.of(context)!.assessment,
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              // TODO: Navigate to assessment
            },
            icon: const Icon(Icons.assignment),
            label: Text(AppLocalizations.of(context)!.startAssessment),
          ),
        ],
      ),
    );
  }

  Widget _buildQuizSection() {
    if (_lesson!.quizId.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(AppLocalizations.of(context)!.quiz,
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              // TODO: Navigate to quiz
            },
            icon: const Icon(Icons.quiz),
            label: Text(AppLocalizations.of(context)!.startQuiz),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverLessonInfo() {
    if (_lesson == null) return const SizedBox.shrink();
    final info = <Widget>[
      // _buildAskButton(),
      _buildInfoItem(AppLocalizations.of(context)!.created, _lesson!.createdAt),
      _buildInfoItem(AppLocalizations.of(context)!.updated, _lesson!.updatedAt),
      _buildInfoItem(AppLocalizations.of(context)!.author, _lesson!.authorId),
    ];
    if (_lesson!.discussionId.isNotEmpty) {
      info.add(_buildInfoItem(
          AppLocalizations.of(context)!.discussion, _lesson!.discussionId));
    }
    if (_lesson!.taskId.isNotEmpty) {
      info.add(
          _buildInfoItem(AppLocalizations.of(context)!.task, _lesson!.taskId));
    }
    return Wrap(
      spacing: 16,
      runSpacing: 4,
      children: info,
    );
  }

  Widget _buildAskButton() {
    return FloatingActionButton(
      backgroundColor: Colors.white,
      foregroundColor: Theme.of(context).primaryColor,
      elevation: 2,
      child: const Icon(Icons.question_answer, size: 28),
      onPressed: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          builder: (context) {
            final controller = TextEditingController();
            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Consumer2<MessageProvider, UserProvider>(
                builder: (context, messageProvider, userProvider, _) {
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(AppLocalizations.of(context)!.askQuestionAboutLesson,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 16),
                      TextField(
                        controller: controller,
                        maxLines: 4,
                        decoration: InputDecoration(
                          hintText: AppLocalizations.of(context)!
                              .typeYourQuestionHere,
                          border: const OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (messageProvider.error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Text(
                            messageProvider.error!,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      Align(
                        alignment: Alignment.centerRight,
                        child: ElevatedButton.icon(
                          icon: messageProvider.isSending
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child:
                                      CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.send),
                          label: Text(messageProvider.isSending
                              ? AppLocalizations.of(context)!.sending
                              : AppLocalizations.of(context)!.send),
                          onPressed: messageProvider.isSending
                              ? null
                              : () async {
                                  final user = userProvider.currentUser;
                                  if (user == null) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content: Text(
                                              AppLocalizations.of(context)!
                                                  .mustBeSignedInToAsk)),
                                    );
                                    return;
                                  }
                                  final text = controller.text.trim();
                                  if (text.isEmpty) return;
                                  // Fetch all admin user IDs
                                  final adminQuery = await FirebaseFirestore
                                      .instance
                                      .collection('users')
                                      .where('isAdmin', isEqualTo: true)
                                      .get();
                                  final adminIds = adminQuery.docs
                                      .map((doc) => doc.id)
                                      .toList();
                                  if (adminIds.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content: Text(
                                              AppLocalizations.of(context)!
                                                  .noAdminAvailable)),
                                    );
                                    return;
                                  }
                                  await messageProvider
                                      .sendMessageToMultipleReceivers(
                                    lessonId: _lesson!.id,
                                    userId: user.uid,
                                    receiverIds: adminIds,
                                    content: text,
                                  );
                                  if (messageProvider.error == null) {
                                    Navigator.pop(context);
                                    ScaffoldMessenger.of(this.context)
                                        .showSnackBar(
                                      SnackBar(
                                          content: Text(
                                              AppLocalizations.of(context)!
                                                  .questionSentToAdmins)),
                                    );
                                  }
                                },
                        ),
                      ),
                    ],
                  );
                },
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildInfoItem(String label, dynamic value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('$label: ',
            style: const TextStyle(
                color: Colors.white70,
                fontWeight: FontWeight.bold,
                fontSize: 12)),
        Text(
          value is DateTime
              ? DateFormat('MMM dd, yyyy').format(value)
              : value.toString(),
          style: const TextStyle(color: Colors.white, fontSize: 12),
        ),
      ],
    );
  }

  Color _getThemeColor() {
    // You can customize this logic as needed
    return Theme.of(context).primaryColor;
  }
}

extension StringCasingExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return this[0].toUpperCase() + substring(1);
  }
}
