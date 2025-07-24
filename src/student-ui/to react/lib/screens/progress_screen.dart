import '../../../../../migrate/lib/models/user_model.dart';
import '../theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../providers/course_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/common/bottonNav.dart';
import 'package:fl_chart/fl_chart.dart';
import 'progress/progress_trend_chart.dart';
import 'progress/progress_course_bars.dart';
import 'progress/progress_goals.dart';
import 'progress/progress_achievements.dart';
import 'progress/progress_recent_activities.dart';
import 'progress/progress_pronunciation_section.dart';
import '../../../../../migrate/lib/models/vocabulary_progress.dart';
import '../../../../../migrate/lib/models/pronunciation_progress.dart';
import '../services/pronunciation_progress_service.dart';
import '../services/vocabulary_progress_service.dart';
import '../l10n/app_localizations.dart';
import '../providers/achievement_provider.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _isLoading = false;

  // Vocabulary and Pronunciation Progress Data
  List<VocabularyProgress> _vocabularyProgress = [];
  List<PronunciationSummary> _pronunciationSummaries = [];
  Map<String, dynamic> _vocabularyStats = {};
  Map<String, dynamic> _pronunciationStats = {};
  bool _isLoadingProgressData = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
    _loadProgressData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _refreshData() async {
    setState(() => _isLoading = true);
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final courseProvider = Provider.of<CourseProvider>(context, listen: false);

    await Future.wait([
      userProvider.initUser(),
      courseProvider.loadCourses(),
      _loadProgressData(),
    ]);

    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  Future<void> _loadProgressData() async {
    setState(() {
      _isLoadingProgressData = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      if (authProvider.firebaseUser == null) {
        throw Exception('User not authenticated');
      }

      final userId = authProvider.firebaseUser!.uid;
      print('Loading progress data for user: $userId');

      // Load vocabulary progress
      final vocabularyService = VocabularyProgressService();

      // Debug Firebase connection
      await vocabularyService.debugFirebaseConnection(userId);

      final vocabularyProgress =
          await vocabularyService.getUserProgress(userId);
      final vocabularyStats = await vocabularyService.getUserStatistics(userId);

      print('Vocabulary stats: $vocabularyStats');

      // Load pronunciation data
      final pronunciationService = PronunciationProgressService();
      final pronunciationSummaries =
          await pronunciationService.getUserPronunciationSummaries(userId);
      final pronunciationStats =
          await pronunciationService.getUserPronunciationStats(userId);

      print('Pronunciation stats: $pronunciationStats');

      if (!mounted) return;
      setState(() {
        _vocabularyProgress = vocabularyProgress;
        _pronunciationSummaries = pronunciationSummaries;
        _vocabularyStats = vocabularyStats;
        _pronunciationStats = pronunciationStats;
        _isLoadingProgressData = false;
      });
    } catch (e) {
      print('Error loading progress data: $e');
      if (!mounted) return;
      setState(() {
        _isLoadingProgressData = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final courseProvider = Provider.of<CourseProvider>(context);
    final user = userProvider.currentUser;
    final theme = Theme.of(context);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Progress'),
          elevation: 0,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.person_outline,
                size: 80,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              Text(
                AppLocalizations.of(context)!.pleaseSignInToViewProgress,
                style: theme.textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pushNamed(context, '/login'),
                      icon: const Icon(Icons.login),
                      label: const Text('Sign In'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        bottomNavigationBar: const BottomNav(),
      );
    }

    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            icon: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.refresh, color: Colors.white),
            onPressed: _isLoading ? null : _refreshData,
          ),
        ],
        backgroundColor: theme.colorScheme.primary,
        automaticallyImplyLeading: false,
        title: Text(
          AppLocalizations.of(context)!.learningProgress,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              automaticallyImplyLeading: false,
              expandedHeight: 200,
              floating: false,
              pinned: true,
              elevation: 0,
              backgroundColor: theme.colorScheme.primary,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        theme.colorScheme.primary,
                        theme.colorScheme.primary.withOpacity(0.8),
                      ],
                    ),
                  ),
                  child: _buildHeaderStats(context, user),
                ),
              ),
              bottom: TabBar(
                indicatorWeight: 5,
                controller: _tabController,
                indicatorColor: Colors.white,
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white70,
                tabs: [
                  Tab(
                      text: AppLocalizations.of(context)!.overview,
                      icon: const Icon(Icons.dashboard)),
                  Tab(
                      text: AppLocalizations.of(context)!.courses,
                      icon: const Icon(Icons.book)),
                  Tab(
                      text: AppLocalizations.of(context)!
                          .vocabularyAndPronunciation,
                      icon: const Icon(Icons.analytics)),
                ],
              ),
            ),
          ];
        },
        body: FadeTransition(
          opacity: _fadeAnimation,
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildOverviewTab(context, user, courseProvider),
              _buildCoursesTab(context, user, courseProvider),
              _buildVocabularyPronunciationTab(context, user),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const BottomNav(),
    );
  }

  Widget _buildHeaderStats(BuildContext context, UserModel user) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildHeaderStatItem(
            context,
            Icons.local_fire_department,
            '${user.currentStreak ?? 0}',
            AppLocalizations.of(context)!.dayStreak(user.currentStreak ?? 0),
            Colors.orangeAccent,
          ),
          _buildHeaderStatItem(
            context,
            Icons.timer,
            '${(user.totalStudyMinutes ?? 0) ~/ 60}h',
            AppLocalizations.of(context)!.studyTime,
            Colors.purpleAccent,
          ),
          _buildHeaderStatItem(
            context,
            Icons.emoji_events,
            '${user.completedLessons?.length ?? 0}',
            AppLocalizations.of(context)!.completed,
            Colors.amberAccent,
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderStatItem(
    BuildContext context,
    IconData icon,
    String value,
    String label,
    Color color,
  ) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildOverviewTab(
      BuildContext context, UserModel user, CourseProvider courseProvider) {
    // Example mock data for goals
    final goals = [
      {
        'title': 'Daily Study',
        'progress': user.totalStudyMinutes ?? 0,
        'target': 30
      },
      {
        'title': 'Lessons Completed',
        'progress': user.completedLessons?.length ?? 0,
        'target': 10
      },
    ];

    // Fetch real achievements from provider
    final achievementProvider = Provider.of<AchievementProvider>(context);
    // final achievements = achievementProvider.userAchievements
    //     .where((a) => a.isUnlocked)
    //     .map((a) => {
    //           'icon': a.icon,
    //           'title': a.title,
    //           'description': a.description,
    //         })
    //     .toList();

    return RefreshIndicator(
      onRefresh: _refreshData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Motivational card (optional)
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.blue.shade400, Colors.purple.shade400],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.blue.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.star,
                          color: Colors.white,
                          size: 28,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            AppLocalizations.of(context)!.keepUpGreatWork,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ProgressGoals(goals: goals),
              const SizedBox(height: 20),
              // ProgressAchievements(achievements: achievements),
              const SizedBox(height: 20),
              const ProgressRecentActivities(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCoursesTab(
      BuildContext context, UserModel user, CourseProvider courseProvider) {
    // Build course progress bars from enrolled courses
    final enrolledCourseIds = user.enrolledCourses ?? [];
    final allCourses = courseProvider.courses;
    final enrolledCourses = allCourses
        .where((course) => enrolledCourseIds.contains(course.id))
        .toList();
    final courseBarsData = enrolledCourses.map((course) {
      double progress = 0.0;
      if (user.progress != null && user.progress![course.id] != null) {
        final p = user.progress![course.id];
        if (p is num) progress = p.toDouble();
        if (p is Map && p['progress'] != null) {
          progress = (p['progress'] as num).toDouble();
        }
      }
      return {
        'title': course.title,
        'thumbnail': course.thumbnail,
        'progress': (progress * 100),
      };
    }).toList();
    return RefreshIndicator(
      onRefresh: _refreshData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProgressCourseBars(courses: courseBarsData),
              const SizedBox(height: 20),
              _buildEnrolledCourses(context, user, courseProvider),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVocabularyPronunciationTab(
      BuildContext context, UserModel user) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final userId = authProvider.firebaseUser?.uid ?? '';

    return RefreshIndicator(
      onRefresh: _loadProgressData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with filters
              // Overview Cards
              _buildProgressOverviewCards(theme),
              const SizedBox(height: 24),

              // Progress Charts
              _buildProgressCharts(theme),
              const SizedBox(height: 24),

              // Vocabulary Progress Section

              const SizedBox(height: 24),

              // Pronunciation Progress Section

              ProgressPronunciationSection(
                userId: userId,
                pronunciationStats: _pronunciationStats,
              ),

              const SizedBox(height: 24),

              // Additional Progress Components
              // _buildAdditionalProgressSections(theme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressOverviewCards(ThemeData theme) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildProgressOverviewCard(
                theme,
                AppLocalizations.of(context)!.vocabularyWords,
                _vocabularyStats['totalWords']?.toString() ?? '0',
                Icons.book,
                Colors.blue,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildProgressOverviewCard(
                theme,
                AppLocalizations.of(context)!.pronunciationAttempts,
                _pronunciationStats['totalAttempts']?.toString() ?? '0',
                Icons.mic,
                Colors.green,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildProgressOverviewCard(
                theme,
                AppLocalizations.of(context)!.vocabularyAccuracy,
                '${((_vocabularyStats['overallAccuracy'] ?? 0.0) * 100).toStringAsFixed(1)}%',
                Icons.check_circle,
                Colors.orange,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildProgressOverviewCard(
                theme,
                AppLocalizations.of(context)!.pronunciationAccuracy,
                '${((_pronunciationStats['averageAccuracy'] ?? 0.0) * 100).toStringAsFixed(1)}%',
                Icons.record_voice_over,
                Colors.purple,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildProgressOverviewCard(
      ThemeData theme, String title, String value, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          AppTheme.boxShadow,
        ],
      ),
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 28,
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: theme.textTheme.bodySmall?.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildProgressCharts(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppLocalizations.of(context)!.progressTrends,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Vocabulary vs Pronunciation Progress',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: true),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 40,
                            getTitlesWidget: (value, meta) {
                              return Text('${(value * 100).toInt()}%');
                            },
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              return Text('${value.toInt()}');
                            },
                          ),
                        ),
                        rightTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                        topTitles: const AxisTitles(
                          sideTitles: SideTitles(showTitles: false),
                        ),
                      ),
                      borderData: FlBorderData(show: true),
                      lineBarsData: [
                        LineChartBarData(
                          spots: _generateVocabularyProgressSpots(),
                          isCurved: true,
                          color: Colors.blue,
                          barWidth: 3,
                          dotData: const FlDotData(show: true),
                        ),
                        LineChartBarData(
                          spots: _generatePronunciationProgressSpots(),
                          isCurved: true,
                          color: Colors.green,
                          barWidth: 3,
                          dotData: const FlDotData(show: true),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildLegendItem(
                        AppLocalizations.of(context)!.vocabulary, Colors.blue),
                    const SizedBox(width: 24),
                    _buildLegendItem(
                        AppLocalizations.of(context)!.pronunciation,
                        Colors.green),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<FlSpot> _generateVocabularyProgressSpots() {
    final spots = <FlSpot>[];
    final totalWords = _vocabularyProgress.length;

    if (totalWords == 0) {
      return [const FlSpot(0, 0)];
    }

    for (int i = 0; i < totalWords && i < 10; i++) {
      final progress = _vocabularyProgress[i];
      final accuracy = progress.accuracy;
      spots.add(FlSpot(i.toDouble(), accuracy));
    }

    return spots;
  }

  List<FlSpot> _generatePronunciationProgressSpots() {
    final spots = <FlSpot>[];
    final totalAttempts = _pronunciationSummaries.length;

    if (totalAttempts == 0) {
      return [const FlSpot(0, 0)];
    }

    for (int i = 0; i < totalAttempts && i < 10; i++) {
      final summary = _pronunciationSummaries[i];
      final accuracy = summary.averageAccuracy;
      spots.add(FlSpot(i.toDouble(), accuracy));
    }

    return spots;
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(label),
      ],
    );
  }

  Widget _buildAdditionalProgressSections(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Additional Progress',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ProgressTrendChart(
          data: _generateSampleTrendData(),
          title: 'Learning Activity',
          valueLabel: 'Activities per Day',
        ),
        const SizedBox(height: 16),
        ProgressCourseBars(
          courses: _generateSampleCourseData(),
        ),
        const SizedBox(height: 16),
        ProgressGoals(
          goals: _generateSampleGoalData(),
        ),
        const SizedBox(height: 16),
        ProgressAchievements(
          achievements: _generateSampleAchievementData(),
        ),
        const SizedBox(height: 16),
        const ProgressRecentActivities(),
      ],
    );
  }

  List<Map<String, dynamic>> _generateSampleTrendData() {
    return [
      {'date': 'Mon', 'value': 5},
      {'date': 'Tue', 'value': 8},
      {'date': 'Wed', 'value': 12},
      {'date': 'Thu', 'value': 6},
      {'date': 'Fri', 'value': 10},
      {'date': 'Sat', 'value': 15},
      {'date': 'Sun', 'value': 7},
    ];
  }

  List<Map<String, dynamic>> _generateSampleCourseData() {
    return [
      {
        'title': 'Basic Vocabulary',
        'progress': 75.0,
        'thumbnail': null,
      },
      {
        'title': 'Pronunciation Practice',
        'progress': 45.0,
        'thumbnail': null,
      },
      {
        'title': 'Advanced Grammar',
        'progress': 30.0,
        'thumbnail': null,
      },
    ];
  }

  List<Map<String, dynamic>> _generateSampleGoalData() {
    return [
      {
        'title': 'Learn 50 New Words',
        'progress': 35,
        'target': 50,
      },
      {
        'title': 'Practice Pronunciation Daily',
        'progress': 7,
        'target': 30,
      },
      {
        'title': 'Complete 10 Lessons',
        'progress': 6,
        'target': 10,
      },
    ];
  }

  List<Map<String, dynamic>> _generateSampleAchievementData() {
    return [
      {
        'title': 'First Word Mastered',
        'description': 'Successfully learned your first word!',
        'icon': '🏆',
        'color': Colors.amber,
        'unlocked': true,
      },
      {
        'title': 'Pronunciation Pro',
        'description': 'Achieved 90% accuracy in pronunciation',
        'icon': '🎤',
        'color': Colors.green,
        'unlocked': false,
      },
      {
        'title': 'Vocabulary Champion',
        'description': 'Learned 100 words',
        'icon': '📚',
        'color': Colors.blue,
        'unlocked': false,
      },
    ];
  }

  Widget _buildEnrolledCourses(
      BuildContext context, UserModel user, CourseProvider courseProvider) {
    final enrolledCourseIds = user.enrolledCourses ?? [];
    final allCourses = courseProvider.courses;
    final enrolledCourses = allCourses
        .where((course) => enrolledCourseIds.contains(course.id))
        .toList();

    if (enrolledCourses.isEmpty) {
      return const Center(
        child: Text('You are not enrolled in any courses yet'),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Enrolled Courses', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: enrolledCourses.length,
          itemBuilder: (context, index) {
            final course = enrolledCourses[index];
            // Progress: try to get from user.progress map if available
            double progress = 0.0;
            if (user.progress != null && user.progress![course.id] != null) {
              final p = user.progress![course.id];
              if (p is num) progress = p.toDouble();
              if (p is Map && p['progress'] != null) {
                progress = (p['progress'] as num).toDouble();
              }
            }
            // Status icon color
            Color statusColor;
            if (progress == 0.0) {
              statusColor = Colors.grey;
            } else if (progress >= 1.0) {
              statusColor = Colors.green;
            } else {
              statusColor = Colors.orange;
            }
            return Card(
              child: ListTile(
                leading: Stack(
                  children: [
                    course.thumbnail != null && course.thumbnail!.isNotEmpty
                        ? CircleAvatar(
                            backgroundImage: NetworkImage(course.thumbnail!),
                            radius: 24,
                          )
                        : CircleAvatar(
                            child: Icon(Icons.book, color: statusColor),
                            backgroundColor: statusColor.withOpacity(0.15),
                            radius: 24,
                          ),
                    // Status dot
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: statusColor,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                  ],
                ),
                title: Text(course.title),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(course.shortDescription),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: progress.clamp(0.0, 1.0),
                      minHeight: 8,
                    ),
                    const SizedBox(height: 2),
                    Text(
                        '${(progress * 100).toStringAsFixed(1)}% ${AppLocalizations.of(context)!.completed}',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
                trailing: Icon(Icons.chevron_right, color: statusColor),
                onTap: () {
                  // TODO: Navigate to course details
                  debugPrint('Tapped course: ${course.title}');
                },
              ),
            );
          },
        ),
      ],
    );
  }
}
